import Order from '../models/Order';
import { PaymentMethod, PaymentStatus } from '../types';

export interface ProcessPaymentInput {
  orderId: string;
  paymentMethod: PaymentMethod;
  paymentResult?: {
    id?: string;
    status?: string;
    updateTime?: string;
    emailAddress?: string;
  };
}

export class PaymentService {
  async processPayment(input: ProcessPaymentInput) {
    const { orderId, paymentMethod, paymentResult } = input;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found for payment processing');
    }

    if (order.paymentStatus === 'completed') {
      throw new Error('Payment has already been completed for this order');
    }

    if (paymentMethod === 'cod') {
      order.paymentMethod = 'cod';
      order.paymentStatus = 'pending';
      await order.save();
      return {
        success: true,
        orderId: order._id,
        paymentStatus: order.paymentStatus,
        message: 'Order confirmed with Cash on Delivery',
      };
    }

    // Online payment methods (card, upi, razorpay, stripe)
    order.paymentMethod = paymentMethod;
    order.paymentStatus = 'completed';
    order.paymentResult = {
      id: paymentResult?.id || `PAY_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      status: paymentResult?.status || 'success',
      updateTime: paymentResult?.updateTime || new Date().toISOString(),
      emailAddress: paymentResult?.emailAddress,
    };

    if (order.orderStatus === 'pending') {
      order.orderStatus = 'processing';
    }

    await order.save();

    return {
      success: true,
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      paymentResult: order.paymentResult,
      message: 'Payment processed successfully',
    };
  }

  async refundPayment(orderId: string, reason?: string) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found for refund');
    }

    if (order.paymentStatus !== 'completed') {
      throw new Error('Only completed payments can be refunded');
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
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      message: 'Payment refunded successfully',
    };
  }
}

export const paymentService = new PaymentService();
export default paymentService;
