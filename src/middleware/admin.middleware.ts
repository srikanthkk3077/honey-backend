import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { sendError } from '../utils/response';

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): any => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }

  if (req.user.role !== 'admin') {
    return sendError(res, 'Access denied: Admin privileges required', 403);
  }

  next();
};

export default requireAdmin;
