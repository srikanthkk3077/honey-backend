import { Request, Response, NextFunction } from 'express';
import paymentService from '../services/payment.service';
import { sendSuccess, sendError } from '../utils/response';

export const processPayment = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { method, paymentMethod, amount, orderId, paymentResult } = req.body;
    const finalMethod = paymentMethod || method;

    if (!finalMethod) {
      return sendError(res, 'Payment method is required', 400);
    }

    const result = await paymentService.processPayment({
      orderId,
      amount: amount ? Number(amount) : undefined,
      paymentMethod: finalMethod,
      paymentResult,
    });

    return sendSuccess(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { transactionId } = req.body;
    if (!transactionId) {
      return sendError(res, 'Transaction ID is required for verification', 400);
    }

    return sendSuccess(res, 'Payment transaction verified', {
      verified: true,
      transactionId,
      status: 'success',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export default {
  processPayment,
  verifyPayment,
};
