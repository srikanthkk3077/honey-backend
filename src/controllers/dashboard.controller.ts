import { Response, NextFunction } from 'express';
import dashboardService from '../services/dashboard.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const stats = await dashboardService.getDashboardStats();
    return sendSuccess(res, 'Apiary dashboard statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardStats,
};
