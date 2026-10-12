import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore fallback
}

import { Coupon, ICoupon } from '../models/Coupon';

const DEFAULT_COUPONS: Array<Partial<ICoupon>> = [
  {
    code: 'WELCOME10',
    description: '10% discount on your first order above ?499',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 499,
    maxDiscountAmount: 150,
    usageLimit: 1000,
    usedCount: 0,
    perUserLimit: 1,
    status: 'active',
  },
  {
    code: 'HONEY100',
    description: 'Flat ?100 OFF on orders above ?799',
    discountType: 'flat',
    discountValue: 100,
    minOrderAmount: 799,
    maxDiscountAmount: 100,
    usageLimit: 500,
    usedCount: 0,
    perUserLimit: 1,
    status: 'active',
  },
  {
    code: 'SWEET20',
    description: '20% Mega Festival Discount on orders above ?1199',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 1199,
    maxDiscountAmount: 350,
    usageLimit: 200,
    usedCount: 0,
    perUserLimit: 2,
    status: 'active',
  },
  {
    code: 'MADHUVAN50',
    description: 'Flat ?50 OFF for all pure honey lovers on orders above ?299',
    discountType: 'flat',
    discountValue: 50,
    minOrderAmount: 299,
    maxDiscountAmount: 50,
    usageLimit: 1000,
    usedCount: 0,
    perUserLimit: 3,
    status: 'active',
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/madhuvan_honey';
  await mongoose.connect(uri);

  for (const c of DEFAULT_COUPONS) {
    const existing = await Coupon.findOne({ code: c.code });
    if (!existing) {
      await Coupon.create(c);
      console.log(`Created coupon: ${c.code}`);
    }
  }

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
