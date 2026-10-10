import { Schema, model } from 'mongoose';
import { ISliderDocument } from '../types';

const sliderSchema = new Schema<ISliderDocument>(
  {
    title: {
      type: String,
      required: [true, 'Slider title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
    },
    badge: {
      type: String,
      trim: true,
      default: '100% PURE & RAW',
    },
    imageUrl: {
      type: String,
      required: [true, 'Slider image or poster URL is required'],
      trim: true,
    },
    mobileImageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    videoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
    linkUrl: {
      type: String,
      trim: true,
      default: '/shop',
    },
    ctaText: {
      type: String,
      trim: true,
      default: 'Shop Collection',
    },
    secondaryCtaText: {
      type: String,
      trim: true,
      default: 'Watch Stories',
    },
    secondaryCtaLink: {
      type: String,
      trim: true,
      default: '/videos',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
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

export const Slider = model<ISliderDocument>('Slider', sliderSchema);
export default Slider;
