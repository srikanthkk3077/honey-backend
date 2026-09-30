import { Request, Response, NextFunction } from 'express';
import settingsService from '../services/settings.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

export const getSettings = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const settings = await settingsService.getSettings();
    return sendSuccess(res, 'Store settings retrieved successfully', settings);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const updated = await settingsService.updateSettings(req.body);
    return sendSuccess(res, 'Store settings updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export default {
  getSettings,
  updateSettings,
};
