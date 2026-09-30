import { Schema, model } from 'mongoose';
import { INewsletterSubscriberDocument } from '../types';

const newsletterSchema = new Schema<INewsletterSubscriberDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const NewsletterSubscriber = model<INewsletterSubscriberDocument>('NewsletterSubscriber', newsletterSchema);
export default NewsletterSubscriber;
