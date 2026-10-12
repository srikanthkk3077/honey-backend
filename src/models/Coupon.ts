import { Schema, model, Document, Types } from 'mongoose';

export type DiscountType = 'percentage' | 'flat';
export type CouponStatus = 'active' | 'inactive' | 'expired';

export interface ICoupon {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  applicableProducts?: Types.ObjectId[];
  status: CouponStatus;
  expiresAt?: Date | undefined;
  createdBy?: Types.ObjectId | undefined;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICouponDocument extends ICoupon, Document {
  _id: Types.ObjectId;
}

const couponSchema = new Schema<ICouponDocument>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: true,
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usageLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: 0,
    },
    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
    },
    expiresAt: {
      type: Date,
      default: undefined,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: undefined,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc: any, ret: any) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

couponSchema.index({ expiresAt: 1 });

export const Coupon = model<ICouponDocument>('Coupon', couponSchema);
export default Coupon;
