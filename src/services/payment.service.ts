import Order from '../models/Order';
import { PaymentMethod } from '../types';

export interface ProcessPaymentInput {
  orderId?: string;
  amount?: number;
  paymentMethod: PaymentMethod;
  paymentResult?: {
    id?: string;
    transactionId?: string;
    status?: string;
    updateTime?: string;
    emailAddress?: string;
  };
}

export class PaymentService {
  async processPayment(input: ProcessPaymentInput) {
    const { orderId, amount, paymentMethod, paymentResult } = input;
    const transactionId = paymentResult?.transactionId || paymentResult?.id || `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    if (!orderId) {
      // Standalone payment simulation (for checkout direct integration)
      return {
        success: true,
        transactionId,
        amount: amount || 0,
        paymentMethod,
        message: 'Payment simulation verified successfully',
      };
    }

    const isObjectId = orderId.match(/^[0-9a-fA-F]{24}$/);
    const order = isObjectId
      ? await Order.findById(orderId)
      : await Order.findOne({ orderNumber: orderId.toUpperCase() });

    if (!order) {
      throw new Error('Order not found for payment processing');
    }

    if (paymentMethod === 'cod') {
      order.paymentMethod = 'cod';
      order.paymentStatus = 'pending';
      await order.save();
      return {
        success: true,
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        transactionId,
        message: 'Order confirmed with Cash on Delivery',
      };
    }

    // Online payment methods (upi, card, netbanking, razorpay, stripe)
    order.paymentMethod = paymentMethod;
    order.paymentStatus = 'paid';
    order.paymentResult = {
      transactionId,
      id: transactionId,
      status: paymentResult?.status || 'success',
      updateTime: paymentResult?.updateTime || new Date().toISOString(),
      emailAddress: paymentResult?.emailAddress || order.customerEmail,
      method: paymentMethod,
    };

    if (order.orderStatus === 'pending') {
      order.orderStatus = 'processing';
    }

    await order.save();

    return {
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      transactionId,
      paymentResult: order.paymentResult,
      message: 'Payment processed successfully',
    };
  }

  async refundPayment(orderId: string, reason?: string) {
    const isObjectId = orderId.match(/^[0-9a-fA-F]{24}$/);
    const order = isObjectId
      ? await Order.findById(orderId)
      : await Order.findOne({ orderNumber: orderId.toUpperCase() });

    if (!order) {
      throw new Error('Order not found for refund');
    }

    order.paymentStatus = 'refunded';
    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    if (reason) {
      order.notes = order.notes ? `${order.notes} | Refund Reason: ${reason}` : `Refund Reason: ${reason}`;
    }

    await order.save();

    return {
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      message: 'Payment refunded successfully',
    };
  }
}

export const paymentService = new PaymentService();
export default paymentService;
