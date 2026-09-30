import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400);
    }

    const result = await authService.register({ name, email, password, phone, role });
    return sendSuccess(res, 'User registered successfully', result, 201);
  } catch (error: any) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const result = await authService.login(email, password);
    return sendSuccess(res, 'Login successful', result, 200);
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

export default {
  register,
  login,
  getProfile,
  updateProfile,
};
