import { Request } from 'express';
import { Document, Types } from 'mongoose';

export type UserRole = 'customer' | 'admin';

export interface IUserAddress {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  postalCode?: string;
  country?: string;
}

export interface IUser {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  address?: IUserAddress;
  wishlist?: Types.ObjectId[];
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
  name?: string;
}

export interface AuthRequest extends Request {
  user?: IUserPayload;
}

// Category Types
export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICategoryDocument extends ICategory, Document {
  _id: Types.ObjectId;
}

// Product Types matching madhuvan_honey frontend
export interface IProductSizeOption {
  size: string; // e.g. "250g", "500g", "1kg"
  price: number;
  originalPrice: number;
  stock: number;
  sku: string;
}

export interface IProductReview {
  _id?: Types.ObjectId;
  id?: string;
  user?: Types.ObjectId | string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  verified: boolean;
}

export interface INutritionFacts {
  energy: string;
  carbohydrates: string;
  naturalSugars: string;
  proteins: string;
  antioxidants: string;
}

export interface IProduct {
  name: string;
  slug: string;
  tagline?: string;
  description: string;
  story?: string;
  category: Types.ObjectId | ICategoryDocument | string;
  categorySlug?: string;
  price: number;
  originalPrice: number;
  discountPercent?: number;
  discountPrice?: number; // backwards compatibility
  rating: number;
  reviewsCount: number;
  stock: number;
  stockQuantity?: number; // backwards compatibility
  images: string[];
  sizes: IProductSizeOption[];
  selectedSize?: string;
  weight?: string;
  honeyType?: 'raw' | 'organic' | 'wild_forest' | 'multifloral' | 'monofloral' | 'infused' | 'comb';
  origin?: string;
  nectarSource?: string;
  harvestSeason?: string;
  purityScore?: number;
  benefits?: string[];
  nutritionFacts?: INutritionFacts;
  isFeatured: boolean;
  isBestSeller?: boolean;
  isOrganicCertified?: boolean;
  reviews: IProductReview[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductDocument extends IProduct, Document {
  _id: Types.ObjectId;
}

// Order Types matching madhuvan_honey frontend
export interface IShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  postalCode?: string; // backwards compatibility
  country: string;
  notes?: string;
}

export interface IOrderItem {
  productId?: Types.ObjectId | string;
  product?: Types.ObjectId | string; // backwards compatibility
  productName?: string;
  name: string;
  size: string;
  image?: string;
  price: number;
  quantity: number;
}

export type PaymentMethod = 'upi' | 'card' | 'cod' | 'netbanking' | 'razorpay' | 'stripe';
export type PaymentStatus = 'pending' | 'paid' | 'completed' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface IPaymentResult {
  transactionId?: string;
  id?: string;
  status?: string;
  updateTime?: string;
  emailAddress?: string;
  method?: string;
}

export interface IOrder {
  orderNumber: string;
  user?: Types.ObjectId | IUserDocument | string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: IShippingAddress;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  taxPrice?: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentResult?: IPaymentResult;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  trackingCourier?: string;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderDocument extends IOrder, Document {
  _id: Types.ObjectId;
}

// Video Types matching madhuvan_honey frontend
export type VideoCategory = 'harvest' | 'purity' | 'recipe' | 'story';

export interface IVideoItem {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: VideoCategory;
  duration: string;
  taggedProductId?: string;
  taggedProductName?: string;
  taggedProductSlug?: string;
  views: number;
  featuredOnHome: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IVideoItemDocument extends IVideoItem, Document {
  _id: Types.ObjectId;
}

// Store Settings Types matching madhuvan_honey frontend
export interface IStoreSettings {
  storeName: string;
  brandTagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  salesEmail: string;
  address: string;
  hours: string;
  freeShippingThreshold: number;
  shippingFee: number;
  gstPercentage: number;
  socialLinks: {
    instagram: string;
    facebook: string;
    youtube: string;
    twitter: string;
  };
}

export interface IStoreSettingsDocument extends IStoreSettings, Document {
  _id: Types.ObjectId;
}

// Contact Inquiry & Newsletter
export interface IContactInquiry {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IContactInquiryDocument extends IContactInquiry, Document {
  _id: Types.ObjectId;
}

export interface INewsletterSubscriber {
  email: string;
  isActive: boolean;
  subscribedAt: Date;
}

export interface INewsletterSubscriberDocument extends INewsletterSubscriber, Document {
  _id: Types.ObjectId;
}

// Customer Summary for Admin
export interface ICustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  status: 'active' | 'inactive';
  joinedDate: string;
  city: string;
}

// Admin Dashboard Stats
export interface IDashboardStats {
  totalRevenue: number;
  totalOrdersCount: number;
  activeSKUs: number;
  registeredPatrons: number;
  salesTrend: Array<{
    month: string;
    revenue: number;
    jars: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    orderStatus: OrderStatus;
    createdAt: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    image: string;
  }>;
}

// General API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}
