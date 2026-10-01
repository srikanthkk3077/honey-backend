import { Response, NextFunction } from 'express';
import orderService from '../services/order.service';
import paymentService from '../services/payment.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const {
      shippingAddress,
      paymentMethod,
      items,
      orderItems,
      notes,
      customerName,
      customerEmail,
      customerPhone,
      utrNumber,
      paymentScreenshot,
    } = req.body;

    const rawItems = items || orderItems;
    if (!rawItems || !rawItems.length || !shippingAddress || !paymentMethod) {
      return sendError(res, 'Items, shippingAddress, and paymentMethod are required', 400);
    }

    const userId = req.user?.id || null;

    const order = await orderService.createOrder(userId, {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod,
      items: rawItems,
      notes,
      utrNumber,
      paymentScreenshot,
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

export const trackOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const queryParam = Array.isArray(req.params.query) ? req.params.query[0] : req.params.query;
    const query = queryParam || (typeof req.query.q === 'string' ? req.query.q : '');
    if (!query) {
      return sendError(res, 'Tracking query (orderNumber, trackingNumber, or phone) is required', 400);
    }

    const order = await orderService.trackOrder(String(query));
    return sendSuccess(res, 'Consignment located successfully', order);
  } catch (error: any) {
    return sendError(res, error.message || 'Tracking consignment not found', 404);
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { search, status, paymentStatus, page, limit } = req.query;
    const result = await orderService.getAllOrders({
      search: search as string,
      status: status as any,
      paymentStatus: paymentStatus as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 200,
    });

    return sendSuccess(res, 'All orders retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { orderStatus, status, notes } = req.body;
    const finalStatus = orderStatus || status;

    if (!finalStatus) {
      return sendError(res, 'orderStatus is required', 400);
    }

    const order = await orderService.updateOrderStatus(id, finalStatus, notes);
    return sendSuccess(res, 'Order status updated successfully', order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderTracking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { trackingNumber, trackingCourier } = req.body;

    if (!trackingNumber) {
      return sendError(res, 'trackingNumber is required', 400);
    }

    const order = await orderService.updateOrderTracking(id, trackingNumber, trackingCourier);
    return sendSuccess(res, 'Tracking information updated successfully', order);
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    const userId = req.user?.id;
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
    const { paymentMethod, paymentResult, amount } = req.body;

    if (!paymentMethod) {
      return sendError(res, 'paymentMethod is required', 400);
    }

    const result = await paymentService.processPayment({
      orderId: id,
      amount: amount ? Number(amount) : undefined,
      paymentMethod,
      paymentResult,
    });

    return sendSuccess(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const order = await orderService.verifyPayment(id);
    return sendSuccess(res, 'Payment verified successfully', order);
  } catch (error) {
    next(error);
  }
};

export const rejectPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    const order = await orderService.rejectPayment(id, reason);
    return sendSuccess(res, 'Payment rejected', order);
  } catch (error) {
    next(error);
  }
};

export default {
  createOrder,
  getMyOrders,
  getOrderById,
  trackOrder,
  getAllOrders,
  updateOrderStatus,
  updateOrderTracking,
  cancelOrder,
  processOrderPayment,
  verifyPayment,
  rejectPayment,
};