import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { name, email, password, phone, role, address } = req.body;

    if (!name || !email) {
      return sendError(res, 'Name and email are required', 400);
    }

    const result = await authService.register({ name, email, password, phone, role, address });
    return sendSuccess(res, 'User registered successfully', result, 201);
  } catch (error: any) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return sendError(res, 'Email is required', 400);
    }

    const result = await authService.login(email, password);
    return sendSuccess(res, 'Login successful', result, 200);
  } catch (error: any) {
    next(error);
  }
};

export const adminLogin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required for admin login', 400);
    }

    const result = await authService.adminLogin(email, password);
    return sendSuccess(res, 'Admin authentication successful', result, 200);
  } catch (error: any) {
    next(error);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user?.id) {
      return sendError(res, 'Unauthorized', 401);
    }

    const user = await authService.getProfile(req.user.id);
    return sendSuccess(res, 'Profile retrieved successfully', user, 200);
  } catch (error: any) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user?.id) {
      return sendError(res, 'Unauthorized', 401);
    }

    const updatedUser = await authService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, 'Profile updated successfully', updatedUser, 200);
  } catch (error: any) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user?.id) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current password and new password are required', 400);
    }

    await authService.changePassword(req.user.id, currentPassword, newPassword);
    return sendSuccess(res, 'Password changed successfully', null, 200);
  } catch (error: any) {
    next(error);
  }
};

/**
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 'Please provide a valid registered email address', 400);
    }

    const result = await authService.forgotPassword(email);
    return sendSuccess(res, result.message, result, 200);
  } catch (error: any) {
    next(error);
  }
};

/**
 * POST /api/auth/verify-otp
 */
export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return sendError(res, 'Email address and 6-digit OTP code are required', 400);
    }

    const result = await authService.verifyResetOtp(email, otp);
    return sendSuccess(res, result.message, result, 200);
  } catch (error: any) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email, otp, resetToken, token, newPassword, password } = req.body;
    const finalPassword = newPassword || password;
    const finalKey = otp || resetToken || token;

    if (!email) {
      return sendError(res, 'Email address is required', 400);
    }
    if (!finalKey) {
      return sendError(res, 'Verification code or reset token is required', 400);
    }
    if (!finalPassword) {
      return sendError(res, 'Please enter a new password', 400);
    }

    const result = await authService.resetPassword(email, finalKey, finalPassword);
    return sendSuccess(res, result.message, result, 200);
  } catch (error: any) {
    next(error);
  }
};

export default {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
