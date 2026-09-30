import Order from '../models/Order';
import Product from '../models/Product';
import { IOrderItem, IShippingAddress, OrderStatus, PaymentMethod } from '../types';

export interface CreateOrderInput {
  orderItems: Array<{
    product: string;
    quantity: number;
  }>;
  shippingAddress: IShippingAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export class OrderService {
  async createOrder(userId: string, input: CreateOrderInput) {
    const { orderItems, shippingAddress, paymentMethod, notes } = input;

    if (!orderItems || orderItems.length === 0) {
      throw new Error('No order items provided');
    }

    const populatedItems: IOrderItem[] = [];
    let itemsPrice = 0;

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }

      if (!product.isActive) {
        throw new Error(`Product "${product.name}" is currently unavailable`);
      }

      if (product.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stockQuantity}`);
      }

      const activePrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;

      populatedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: activePrice,
        image: product.images[0] || '',
      });

      itemsPrice += activePrice * item.quantity;

      // Decrement stock
      product.stockQuantity -= item.quantity;
      await product.save();
    }

    // Shipping calculation: Free shipping above 500, else 50
    const shippingPrice = itemsPrice >= 500 ? 0 : 50;
    // 5% standard GST on natural honey products
    const taxPrice = Math.round(itemsPrice * 0.05 * 100) / 100;
    const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

    const order = await Order.create({
      user: userId,
      orderItems: populatedItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      orderStatus: 'pending',
      notes,
    });

    return order;
  }

  async getOrderById(orderId: string, userId?: string, isAdmin = false) {
    const order = await Order.findById(orderId)
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name slug images weight');

    if (!order) {
      throw new Error('Order not found');
    }

    const orderUserId = (order.user as any)._id
      ? (order.user as any)._id.toString()
      : order.user.toString();

    if (!isAdmin && userId && orderUserId !== userId) {
      throw new Error('Unauthorized access to this order');
    }

    return order;
  }

  async getUserOrders(userId: string, page = 1, limit = 10) {
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find({ user: userId })
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments({ user: userId }),
    ]);

    return {
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getAllOrders(filters: {
    status?: OrderStatus;
    paymentStatus?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, paymentStatus, page = 1, limit = 20 } = filters;
    const query: any = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async updateOrderStatus(orderId: string, orderStatus: OrderStatus) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.orderStatus = orderStatus;
    if (orderStatus === 'delivered') {
      order.deliveredAt = new Date();
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'completed';
      }
    } else if (orderStatus === 'cancelled') {
      order.cancelledAt = new Date();
      // Restore stock if cancelled
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: item.quantity },
        });
      }
    }

    await order.save();
    return order;
  }

  async cancelOrder(orderId: string, userId: string, isAdmin = false, reason?: string) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (!isAdmin && order.user.toString() !== userId) {
      throw new Error('Unauthorized to cancel this order');
    }

    if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
      throw new Error(`Cannot cancel an order that is already ${order.orderStatus}`);
    }

    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    if (reason) {
      order.notes = order.notes ? `${order.notes} | Cancellation Reason: ${reason}` : `Cancellation: ${reason}`;
    }

    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: item.quantity },
      });
    }

    await order.save();
    return order;
  }
}

export const orderService = new OrderService();
export default orderService;
