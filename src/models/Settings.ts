import { Schema, model } from 'mongoose';
import { IStoreSettingsDocument } from '../types';

const settingsSchema = new Schema<IStoreSettingsDocument>(
  {
    storeName: {
      type: String,
      default: 'Madhuvan Honey',
      trim: true,
    },
    brandTagline: {
      type: String,
      default: '100% Pure, Raw & Forest Harvested Honey',
      trim: true,
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
      trim: true,
    },
    whatsapp: {
      type: String,
      default: '+91 98765 43210',
      trim: true,
    },
    email: {
      type: String,
      default: 'support@madhuvanhoney.com',
      trim: true,
      lowercase: true,
    },
    salesEmail: {
      type: String,
      default: 'orders@madhuvanhoney.com',
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      default: 'Madhuvan Apiaries, Foothills of Jim Corbett & Sunderbans, Uttarakhand 244715, India',
      trim: true,
    },
    hours: {
      type: String,
      default: 'Mon - Sat: 9:00 AM - 7:00 PM IST',
      trim: true,
    },
    freeShippingThreshold: {
      type: Number,
      default: 999,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 79,
      min: 0,
    },
    gstPercentage: {
      type: Number,
      default: 5,
      min: 0,
    },
    socialLinks: {
      instagram: { type: String, default: 'https://instagram.com/madhuvanhoney' },
      facebook: { type: String, default: 'https://facebook.com/madhuvanhoney' },
      youtube: { type: String, default: 'https://youtube.com/@madhuvanhoney' },
      twitter: { type: String, default: 'https://twitter.com/madhuvanhoney' },
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

export const Settings = model<IStoreSettingsDocument>('Settings', settingsSchema);
export default Settings;
