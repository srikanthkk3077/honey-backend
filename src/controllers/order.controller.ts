import { Response, NextFunction } from 'express';
import orderService from '../services/order.service';
import paymentService from '../services/payment.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user?.id) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { orderItems, shippingAddress, paymentMethod, notes } = req.body;

    if (!orderItems || !orderItems.length || !shippingAddress || !paymentMethod) {
      return sendError(res, 'orderItems, shippingAddress, and paymentMethod are required', 400);
    }

    const order = await orderService.createOrder(req.user.id, {
      orderItems,
      shippingAddress,
      paymentMethod,
      notes,
    });

    return sendSuccess(res, 'Order placed successfully', order, 201);
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user?.id) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { page, limit } = req.query;
    const result = await orderService.getUserOrders(
      req.user.id,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10
    );

    return sendSuccess(res, 'Orders retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    const order = await orderService.getOrderById(id, userId, isAdmin);
    return sendSuccess(res, 'Order details retrieved successfully', order);
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { status, paymentStatus, page, limit } = req.query;
    const result = await orderService.getAllOrders({
      status: status as any,
      paymentStatus: paymentStatus as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });

    return sendSuccess(res, 'All orders retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return sendError(res, 'orderStatus is required', 400);
    }

    const order = await orderService.updateOrderStatus(id, orderStatus);
    return sendSuccess(res, 'Order status updated successfully', order);
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    const userId = req.user?.id as string;
    const isAdmin = req.user?.role === 'admin';

    const order = await orderService.cancelOrder(id, userId, isAdmin, reason);
    return sendSuccess(res, 'Order cancelled successfully', order);
  } catch (error) {
    next(error);
  }
};

export const processOrderPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { paymentMethod, paymentResult } = req.body;

    if (!paymentMethod) {
      return sendError(res, 'paymentMethod is required', 400);
    }

    const result = await paymentService.processPayment({
      orderId: id,
      paymentMethod,
      paymentResult,
    });

    return sendSuccess(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

export default {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  processOrderPayment,
};
