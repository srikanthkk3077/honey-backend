import { Schema, model } from 'mongoose';
import { IVideoItemDocument } from '../types';

const videoSchema = new Schema<IVideoItemDocument>(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      required: [true, 'Thumbnail URL is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['harvest', 'purity', 'recipe', 'story'],
      default: 'story',
      index: true,
    },
    duration: {
      type: String,
      default: '1:00',
      trim: true,
    },
    taggedProductId: {
      type: String,
      default: '',
    },
    taggedProductName: {
      type: String,
      default: '',
    },
    taggedProductSlug: {
      type: String,
      default: '',
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    featuredOnHome: {
      type: Boolean,
      default: false,
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

export const Video = model<IVideoItemDocument>('Video', videoSchema);
export default Video;
