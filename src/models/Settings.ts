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
    heroConfig: {
      eyebrow: { type: String, default: 'FROM FOREST TO FAMILY', trim: true },
      titleLine1: { type: String, default: 'More Than Honey', trim: true },
      titleLine2: { type: String, default: 'A Healthier Lifestyle', trim: true },
      subtitle: {
        type: String,
        default: "Pure honey, collected from forest flowers for your family's better health.",
        trim: true,
      },
      primaryCtaText: { type: String, default: 'SHOP RAW HONEY', trim: true },
      primaryCtaLink: { type: String, default: '/shop', trim: true },
      secondaryCtaText: { type: String, default: 'Watch Our Story', trim: true },
      secondaryCtaLink: { type: String, default: '/videos', trim: true },
      storyVideoUrl: {
        type: String,
        default: 'https://res.cloudinary.com/kisnodzz/video/upload/f_auto,q_auto/v1/madhuvan_honey/videos/WhatsApp-Video-2026-10-02-at-1-1790995078981.mp4',
        trim: true,
      },
      heroImageUrl: {
        type: String,
        default: '/images/brand/hero_illustration_feathered.png',
        trim: true,
      },
      heroMobileImageUrl: {
        type: String,
        default: '',
        trim: true,
      },
      calloutBadgeText: {
        type: String,
        default: 'Pure Honey\nStronger Communities',
        trim: true,
      },
      showCalloutBadge: { type: Boolean, default: true },
      trustBadges: {
        type: [
          {
            id: { type: String, default: '' },
            label: { type: String, default: '' },
            icon: { type: String, default: '' },
            isActive: { type: Boolean, default: true },
          },
        ],
        default: [
          { id: 'natural', label: '100% Natural', icon: 'natural', isActive: true },
          { id: 'no-sugar', label: 'No Added Sugar', icon: 'no-sugar', isActive: true },
          { id: 'lab-tested', label: 'Lab Tested', icon: 'lab-tested', isActive: true },
          { id: 'beekeepers', label: 'Supports Beekeepers', icon: 'beekeepers', isActive: true },
        ],
      },
      showBotanicalAccent: { type: Boolean, default: true },
      backgroundColor: { type: String, default: '#FDDCC3' },
      isActive: { type: Boolean, default: true },
      heroBannerSlides: {
        type: [
          {
            id: { type: String, default: '' },
            imageUrl: { type: String, default: '' },
            mobileImageUrl: { type: String, default: '' },
            titleLine1: { type: String, default: '' },
            titleLine2: { type: String, default: '' },
            subtitle: { type: String, default: '' },
            eyebrow: { type: String, default: '' },
            primaryCtaText: { type: String, default: '' },
            primaryCtaLink: { type: String, default: '' },
            secondaryCtaText: { type: String, default: '' },
            secondaryCtaLink: { type: String, default: '' },
            backgroundColor: { type: String, default: '' },
            isActive: { type: Boolean, default: true },
            order: { type: Number, default: 0 },
          },
        ],
        default: [],
      },
      heroDisplayMode: {
        type: String,
        enum: ['hero', 'carousel'],
        default: 'hero',
      },
    },
    
    shopConfig: {
      eyebrow: { type: String, default: 'PURE • NATURAL • RAW', trim: true },
      title: { type: String, default: 'Our Honey Collection', trim: true },
      subtitle: {
        type: String,
        default: "Nature's finest. Straight from the forest to your home.",
        trim: true,
      },
      heroGraphicUrl: {
        type: String,
        default: '/images/shop/shop_hero_bg_jar_forest.jpg',
        trim: true,
      },
      heroBackgroundImageUrl: {
        type: String,
        default: '/images/shop/shop_hero_bg_jar_forest.jpg',
        trim: true,
      },
      heroBannerMode: {
        type: String,
        enum: ['dynamic', 'static'],
        default: 'dynamic',
      },
      heroBgPosition: {
        type: String,
        enum: ['right', 'center', 'left'],
        default: 'right',
      },
      heroScriptText: {
        type: String,
        default: 'Pure Honey Pure Life',
        trim: true,
      },
      trustBadges: {
        type: [
          {
            title: { type: String, default: '' },
            subtitle: { type: String, default: '' },
            icon: { type: String, default: '' },
          },
        ],
        default: [
          { title: '100% Natural', subtitle: 'No Additives', icon: 'leaf' },
          { title: 'Lab Tested', subtitle: 'for Purity', icon: 'shield' },
          { title: 'Supports', subtitle: 'Immunity', icon: 'bee' },
        ],
      },
      sidebarPromo: {
        title: { type: String, default: 'Pure Honey Better Health', trim: true },
        buttonText: { type: String, default: 'Learn More →', trim: true },
        linkUrl: { type: String, default: '/about', trim: true },
        imageUrl: { type: String, default: '/images/shop/sidebar_promo.png', trim: true },
        isActive: { type: Boolean, default: true },
      },
      bottomTrustItems: {
        type: [
          {
            title: { type: String, default: '' },
            subtitle: { type: String, default: '' },
            icon: { type: String, default: '' },
          },
        ],
        default: [
          { title: '100% Natural', subtitle: 'No Preservatives', icon: 'leaf' },
          { title: 'Lab Tested', subtitle: 'for Purity', icon: 'flask' },
          { title: 'Fast & Safe', subtitle: 'Delivery', icon: 'truck' },
          { title: 'Trusted by', subtitle: 'Thousands of Families', icon: 'shield' },
        ],
      },
    },
    paymentConfig: {
      upiId: { type: String, default: 'madhuvanhoney@upi', trim: true },
      upiQrCode: { type: String, default: '', trim: true },
      accountHolderName: { type: String, default: 'Madhuvan Honey Apiaries', trim: true },
      accountNumber: { type: String, default: '9876543210123', trim: true },
      ifscCode: { type: String, default: 'HDFC0001234', trim: true },
      bankName: { type: String, default: 'HDFC Bank', trim: true },
      branchName: { type: String, default: 'Forest Greens Branch', trim: true },
      accountType: { type: String, default: 'Current Account', trim: true },
      paymentInstructions: {
        type: String,
        default: 'Scan QR code or send to UPI ID, then enter the 12-digit UTR transaction number.',
        trim: true,
      },
      isUpiActive: { type: Boolean, default: true },
      isBankTransferActive: { type: Boolean, default: true },
      isCodActive: { type: Boolean, default: true },
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
