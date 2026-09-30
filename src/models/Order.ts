import { Schema, model } from 'mongoose';
import { IOrderDocument } from '../types';

const orderItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      default: '500g',
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true, default: '' },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    postalCode: { type: String, trim: true, default: '' },
    country: { type: String, default: 'India', trim: true },
    notes: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(val: any[]) => val.length > 0, 'Order must contain at least one item'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'cod', 'netbanking', 'razorpay', 'stripe'],
      required: true,
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentResult: {
      transactionId: { type: String, default: '' },
      id: { type: String, default: '' },
      status: { type: String, default: '' },
      updateTime: { type: String, default: '' },
      emailAddress: { type: String, default: '' },
      method: { type: String, default: '' },
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'processing',
    },
    trackingNumber: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    trackingCourier: {
      type: String,
      trim: true,
      default: 'Delhivery Express',
    },
    deliveredAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        // Support backwards compatibility
        ret.orderItems = ret.items;
        ret.itemsPrice = ret.subtotal;
        ret.shippingPrice = ret.shippingFee;
        ret.totalPrice = ret.total;
        delete ret.__v;
        return ret;
      },
    },
  }
);

orderSchema.index({ customerEmail: 1, customerPhone: 1, orderStatus: 1, createdAt: -1 });

export const Order = model<IOrderDocument>('Order', orderSchema);
export default Order;
