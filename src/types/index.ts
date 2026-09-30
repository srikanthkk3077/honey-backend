import { Request } from 'express';
import { Document, Types } from 'mongoose';

export type UserRole = 'customer' | 'admin';

export interface IUserAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface IUser {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  address?: IUserAddress;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: IUserPayload;
}

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICategoryDocument extends ICategory, Document {
  _id: Types.ObjectId;
}

export interface IProduct {
  name: string;
  slug: string;
  description: string;
  category: Types.ObjectId | ICategoryDocument | string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  weight: string;
  honeyType: 'raw' | 'organic' | 'wild_forest' | 'multifloral' | 'monofloral' | 'infused' | 'comb';
  origin?: string;
  images: string[];
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductDocument extends IProduct, Document {
  _id: Types.ObjectId;
}

export interface IOrderItem {
  product: Types.ObjectId | IProductDocument | string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type PaymentMethod = 'cod' | 'card' | 'upi' | 'razorpay' | 'stripe';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface IPaymentResult {
  id?: string;
  status?: string;
  updateTime?: string;
  emailAddress?: string;
}

export interface IOrder {
  user: Types.ObjectId | IUserDocument | string;
  orderItems: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentResult?: IPaymentResult;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  orderStatus: OrderStatus;
  deliveredAt?: Date;
  cancelledAt?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderDocument extends IOrder, Document {
  _id: Types.ObjectId;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}
