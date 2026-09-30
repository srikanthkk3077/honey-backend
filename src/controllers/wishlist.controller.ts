import { Response, NextFunction } from 'express';
import wishlistService from '../services/wishlist.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const getWishlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user?.id) {
      return sendError(res, 'Unauthorized', 401);
    }

    const wishlist = await wishlistService.getWishlist(req.user.id);
    return sendSuccess(res, 'Wishlist retrieved successfully', wishlist);
  } catch (error) {
    next(error);
  }
};

export const toggleWishlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user?.id) {
      return sendError(res, 'Unauthorized', 401);
    }

    const productId = req.params.productId as string;
    if (!productId) {
      return sendError(res, 'Product ID is required', 400);
    }

    const result = await wishlistService.toggleWishlist(req.user.id, productId);
    return sendSuccess(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

export default {
  getWishlist,
  toggleWishlist,
};
