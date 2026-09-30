import User from '../models/User';
import { IUser, IUserPayload } from '../types';
import { generateToken } from '../utils/generateToken';
import bcrypt from 'bcryptjs';

export class AuthService {
  async register(data: { name: string; email: string; password: string; phone?: string; role?: 'customer' | 'admin' }) {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      phone: data.phone,
      role: data.role || 'customer',
    });

    const payload: IUserPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const token = generateToken(payload);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password credentials');
    }

    if (!user.isActive) {
      throw new Error('This account has been deactivated. Please contact support.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password credentials');
    }

    const payload: IUserPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const token = generateToken(payload);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User profile not found');
    }
    return user;
  }

  async updateProfile(userId: string, data: Partial<IUser> & { newPassword?: string; currentPassword?: string }) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new Error('User profile not found');
    }

    if (data.name) user.name = data.name;
    if (data.phone) user.phone = data.phone;
    if (data.address) user.address = { ...user.address, ...data.address };

    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new Error('Current password is required to set a new password');
      }
      const isMatch = await user.comparePassword(data.currentPassword);
      if (!isMatch) {
        throw new Error('Current password is incorrect');
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(data.newPassword, salt);
    }

    await user.save();

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
      updatedAt: user.updatedAt,
    };
  }
}

export const authService = new AuthService();
export default authService;
