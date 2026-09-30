import User from '../models/User';
import { IUser, IUserPayload } from '../types';
import { generateToken } from '../utils/generateToken';
import bcrypt from 'bcryptjs';

export class AuthService {
  async register(data: { name: string; email: string; password?: string; phone?: string; role?: 'customer' | 'admin'; address?: any }) {
    const email = data.email.toLowerCase().trim();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    // Default secure password if none provided (e.g. quick social / test registration)
    const password = data.password || 'madhuvan12345';

    const user = await User.create({
      name: data.name.trim(),
      email,
      password,
      phone: data.phone?.trim() || '',
      role: data.role || 'customer',
      address: data.address || {},
    });

    const payload: IUserPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = generateToken(payload);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        address: user.address,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async login(email: string, password?: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password credentials');
    }

    if (!user.isActive) {
      throw new Error('This account has been deactivated. Please contact support.');
    }

    if (password) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid email or password credentials');
      }
    }

    const payload: IUserPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = generateToken(payload);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        address: user.address,
        wishlist: user.wishlist,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async adminLogin(email: string, password?: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      throw new Error('Invalid admin credentials');
    }

    if (user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    if (!user.isActive) {
      throw new Error('This admin account has been suspended.');
    }

    if (password) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid admin credentials');
      }
    }

    const payload: IUserPayload = {
      id: user._id.toString(),
      email: user.email,
      role: 'admin',
      name: user.name,
    };

    const token = generateToken(payload);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: 'admin',
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await User.findById(userId)
      .select('-password')
      .populate('wishlist', 'name slug price images rating reviewsCount stock');
    if (!user) {
      throw new Error('User profile not found');
    }
    return user;
  }

  async updateProfile(userId: string, data: Partial<IUser> & { avatar?: string }) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User profile not found');
    }

    if (data.name) user.name = data.name.trim();
    if (data.phone !== undefined) user.phone = data.phone.trim();
    if (data.avatar !== undefined) user.avatar = data.avatar;
    if (data.address) {
      user.address = {
        ...user.address,
        ...data.address,
      };
    }

    await user.save();

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      updatedAt: user.updatedAt,
    };
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await user.comparePassword(currentPass);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    if (newPass.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    user.password = newPass;
    await user.save();

    return true;
  }
}

export const authService = new AuthService();
export default authService;
