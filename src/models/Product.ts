import { Schema, model } from 'mongoose';
import { IProductDocument } from '../types';

const productSizeOptionSchema = new Schema(
  {
    size: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const productReviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    verified: { type: Boolean, default: false },
    showOnHome: { type: Boolean, default: false },
    userRole: { type: String, default: 'Verified Patron' },
    location: { type: String, default: 'Verified Buyer' },
    avatar: { type: String, default: '' },
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

const nutritionFactsSchema = new Schema(
  {
    energy: { type: String, default: '304 kcal per 100g' },
    carbohydrates: { type: String, default: '82.4g' },
    naturalSugars: { type: String, default: '80.1g' },
    proteins: { type: String, default: '0.3g' },
    antioxidants: { type: String, default: 'Rich in polyphenols and flavonoids' },
  },
  { _id: false }
);

const productSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    story: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    categorySlug: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      required: [true, 'Original MRP price is required'],
      min: [0, 'Original price cannot be negative'],
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    stockQuantity: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [productSizeOptionSchema],
      default: [],
    },
    selectedSize: {
      type: String,
      default: '500g',
    },
    weight: {
      type: String,
      default: '500g',
    },
    honeyType: {
      type: String,
      enum: ['raw', 'organic', 'wild_forest', 'multifloral', 'monofloral', 'infused', 'comb'],
      default: 'raw',
    },
    origin: {
      type: String,
      trim: true,
      default: 'Indian Forest Reserve',
    },
    nectarSource: {
      type: String,
      trim: true,
      default: 'Wild Native Flora',
    },
    harvestSeason: {
      type: String,
      trim: true,
      default: 'Spring Bloom',
    },
    purityScore: {
      type: Number,
      default: 99.8,
      min: 0,
      max: 100,
    },
    benefits: {
      type: [String],
      default: [],
    },
    nutritionFacts: {
      type: nutritionFactsSchema,
      default: () => ({}),
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isOrganicCertified: {
      type: Boolean,
      default: true,
    },
    reviews: {
      type: [productReviewSchema],
      default: [],
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
        // Sync backwards compatible fields
        if (ret.stockQuantity === undefined && ret.stock !== undefined) {
          ret.stockQuantity = ret.stock;
        }
        delete ret.__v;
        return ret;
      },
    },
  }
);

productSchema.pre('save', function () {
  // Synchronize stock and stockQuantity
  if (this.stock !== undefined && this.stockQuantity !== this.stock) {
    this.stockQuantity = this.stock;
  }
  // Calculate discountPercent if not set
  if (this.originalPrice > this.price && (!this.discountPercent || this.discountPercent === 0)) {
    this.discountPercent = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
});

productSchema.index({ name: 'text', description: 'text', tagline: 'text', origin: 'text' });

export const Product = model<IProductDocument>('Product', productSchema);
export default Product;
