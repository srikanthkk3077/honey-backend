import Order from '../models/Order';
import Product from '../models/Product';
import Settings from '../models/Settings';
import { IOrderItem, IShippingAddress, OrderStatus, PaymentMethod } from '../types';

export interface CreateOrderInput {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress: IShippingAddress;
  paymentMethod: PaymentMethod;
  items?: Array<{
    productId?: string;
    product?: string;
    name?: string;
    productName?: string;
    size?: string;
    image?: string;
    price?: number;
    quantity: number;
  }>;
  orderItems?: Array<{
    productId?: string;
    product?: string;
    name?: string;
    productName?: string;
    size?: string;
    image?: string;
    price?: number;
    quantity: number;
  }>;
  notes?: string;
  utrNumber?: string;
  paymentScreenshot?: string;
}

export class OrderService {
  async createOrder(userId: string | null, input: CreateOrderInput) {
    const rawItems = input.items || input.orderItems || [];
    if (!rawItems || rawItems.length === 0) {
      throw new Error('No items provided in order');
    }

    const { shippingAddress, paymentMethod, notes, utrNumber, paymentScreenshot } = input;
    if (!shippingAddress) {
      throw new Error('Shipping address is required');
    }

    const customerName = input.customerName || shippingAddress.fullName;
    const customerEmail = (input.customerEmail || shippingAddress.email).toLowerCase();
    const customerPhone = input.customerPhone || shippingAddress.phone;

    // Get store settings for shipping threshold
    const storeSettings = await Settings.findOne();
    const freeShippingThreshold = storeSettings?.freeShippingThreshold ?? 999;
    const standardShippingFee = storeSettings?.shippingFee ?? 79;

    const populatedItems: IOrderItem[] = [];
    let subtotal = 0;
    let discount = 0;

    for (const item of rawItems) {
      const prodId = item.productId || item.product;
      const isObjectId = typeof prodId === 'string' && /^[0-9a-fA-F]{24}$/.test(prodId);
      let product = isObjectId ? await Product.findById(prodId) : null;
      if (!product && item.slug) {
        product = await Product.findOne({ slug: item.slug });
      }
      if (!product && (item.name || item.productName)) {
        product = await Product.findOne({ name: item.name || item.productName });
      }

      let itemPrice = Number(item.price) || 0;
      let itemName = item.name || item.productName || 'Madhuvan Pure Honey';
      let itemImage = item.image || '';
      let itemSize = item.size || '500g';

      if (product) {
        itemName = product.name;
        itemImage = product.images[0] || itemImage;

        // Check if size specific pricing exists
        if (product.sizes && product.sizes.length > 0) {
          const matchedSize = product.sizes.find((s) => s.size === itemSize) || product.sizes[0];
          itemPrice = matchedSize.price;
          if (matchedSize.originalPrice > matchedSize.price) {
            discount += (matchedSize.originalPrice - matchedSize.price) * item.quantity;
          }

          // Decrement size stock
          matchedSize.stock = Math.max(0, matchedSize.stock - item.quantity);
        } else {
          itemPrice = product.price;
          if (product.originalPrice > product.price) {
            discount += (product.originalPrice - product.price) * item.quantity;
          }
        }

        // Decrement overall product stock
        product.stock = Math.max(0, product.stock - item.quantity);
        product.stockQuantity = product.stock;
        await product.save();
      }

      populatedItems.push({
        productId: product?._id || (prodId as any),
        product: product?._id || (prodId as any),
        productName: itemName,
        name: itemName,
        size: itemSize,
        image: itemImage,
        price: itemPrice,
        quantity: item.quantity,
      });

      subtotal += itemPrice * item.quantity;
    }

    const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : standardShippingFee;
    const taxPrice = Math.round(subtotal * 0.05 * 100) / 100;
    const total = subtotal + shippingFee;

    // Generate unique order number
    let orderNumber = `MDH-${Math.floor(1000 + Math.random() * 9000)}`;
    let exists = await Order.findOne({ orderNumber });
    while (exists) {
      orderNumber = `MDH-${Math.floor(1000 + Math.random() * 9000)}`;
      exists = await Order.findOne({ orderNumber });
    }

    const trackingNumber = `MDH-TRK-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderData: any = {
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress: {
        ...shippingAddress,
        fullName: shippingAddress.fullName || customerName,
        email: (shippingAddress.email || customerEmail).toLowerCase(),
        phone: shippingAddress.phone || customerPhone,
      },
      items: populatedItems,
      subtotal,
      discount,
      shippingFee,
      taxPrice,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'verification_pending',
      utrNumber: utrNumber || '',
      paymentScreenshot: paymentScreenshot || '',
      orderStatus: 'processing',
      trackingNumber,
      trackingCourier: 'Delhivery Express',
      notes: notes || '',
    };

    if (userId) {
      orderData.user = userId;
    }

    const order = await Order.create(orderData);

    return order;
  }

  async getOrderById(orderId: string, userId?: string, isAdmin = false) {
    const isObjectId = orderId.match(/^[0-9a-fA-F]{24}$/);
    const order = isObjectId
      ? await Order.findById(orderId).populate('user', 'name email phone avatar')
      : await Order.findOne({ orderNumber: orderId.toUpperCase() }).populate('user', 'name email phone avatar');

    if (!order) {
      throw new Error('Order not found');
    }

    if (!isAdmin && userId && order.user) {
      const orderUserId = (order.user as any)._id
        ? (order.user as any)._id.toString()
        : order.user.toString();

      if (orderUserId !== userId) {
        throw new Error('Unauthorized access to this order');
      }
    }

    return order;
  }

  async trackOrder(query: string) {
    const clean = query.trim();
    if (!clean) {
      throw new Error('Please provide an order number, tracking code, or phone number to track');
    }

    const order = await Order.findOne({
      $or: [
        { orderNumber: new RegExp(`^${clean}$`, 'i') },
        { trackingNumber: new RegExp(`^${clean}$`, 'i') },
        { customerPhone: clean },
      ],
    }).sort('-createdAt');

    if (!order) {
      throw new Error(`No consignment found matching "${query}"`);
    }

    return order;
  }

  async getUserOrders(userId: string, page = 1, limit = 10) {
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find({ user: userId })
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments({ user: userId }),
    ]);

    return {
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getAllOrders(filters: {
    search?: string;
    status?: OrderStatus;
    paymentStatus?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, status, paymentStatus, page = 1, limit = 20 } = filters;
    const query: any = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { trackingNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email phone')
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async updateOrderStatus(orderId: string, orderStatus: OrderStatus, notes?: string) {
    const isObjectId = orderId.match(/^[0-9a-fA-F]{24}$/);
    const order = isObjectId
      ? await Order.findById(orderId)
      : await Order.findOne({ orderNumber: orderId.toUpperCase() });

    if (!order) {
      throw new Error('Order not found');
    }

    order.orderStatus = orderStatus;
    if (notes) {
      order.notes = order.notes ? `${order.notes} | ${notes}` : notes;
    }

    if (orderStatus === 'delivered') {
      order.deliveredAt = new Date();
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'paid';
      }
    } else if (orderStatus === 'cancelled') {
      order.cancelledAt = new Date();
      // Restore inventory
      for (const item of order.items) {
        if (item.productId || item.product) {
          const prodId = item.productId || item.product;
          await Product.findByIdAndUpdate(prodId, {
            $inc: { stock: item.quantity, stockQuantity: item.quantity },
          });
        }
      }
    }

    await order.save();
    return order;
  }

  async updateOrderTracking(orderId: string, trackingNumber: string, trackingCourier?: string) {
    const isObjectId = orderId.match(/^[0-9a-fA-F]{24}$/);
    const order = isObjectId
      ? await Order.findById(orderId)
      : await Order.findOne({ orderNumber: orderId.toUpperCase() });

    if (!order) {
      throw new Error('Order not found');
    }

    order.trackingNumber = trackingNumber.trim();
    if (trackingCourier) {
      order.trackingCourier = trackingCourier.trim();
    }
    if (order.orderStatus === 'pending' || order.orderStatus === 'processing') {
      order.orderStatus = 'shipped';
    }

    await order.save();
    return order;
  }

  async cancelOrder(orderId: string, userId?: string, isAdmin = false, reason?: string) {
    const isObjectId = orderId.match(/^[0-9a-fA-F]{24}$/);
    const order = isObjectId
      ? await Order.findById(orderId)
      : await Order.findOne({ orderNumber: orderId.toUpperCase() });

    if (!order) {
      throw new Error('Order not found');
    }

    if (!isAdmin && userId && order.user && order.user.toString() !== userId) {
      throw new Error('Unauthorized to cancel this order');
    }

    if (order.orderStatus === 'delivered') {
      throw new Error('Delivered orders cannot be cancelled');
    }

    if (order.orderStatus === 'cancelled') {
      throw new Error('Order is already cancelled');
    }

    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Customer requested cancellation';

    // Restore inventory
    for (const item of order.items) {
      if (item.productId || item.product) {
        const prodId = item.productId || item.product;
        await Product.findByIdAndUpdate(prodId, {
          $inc: { stock: item.quantity, stockQuantity: item.quantity },
        });
      }
    }

    await order.save();
    return order;
  }

  async verifyPayment(orderId: string) {
    const isObjectId = orderId.match(/^[0-9a-fA-F]{24}$/);
    const order = isObjectId
      ? await Order.findById(orderId)
      : await Order.findOne({ orderNumber: orderId.toUpperCase() });
    if (!order) { throw new Error('Order not found'); }
    (order as any).paymentStatus = 'paid';
    (order as any).paymentVerifiedAt = new Date();
    await order.save();
    return order;
  }

  async rejectPayment(orderId: string, reason?: string) {
    const isObjectId = orderId.match(/^[0-9a-fA-F]{24}$/);
    const order = isObjectId
      ? await Order.findById(orderId)
      : await Order.findOne({ orderNumber: orderId.toUpperCase() });
    if (!order) { throw new Error('Order not found'); }
    (order as any).paymentStatus = 'rejected';
    (order as any).paymentRejectedReason = reason || 'Payment not verified';
    await order.save();
    return order;
  }
}

export const orderService = new OrderService();
export default orderService;
