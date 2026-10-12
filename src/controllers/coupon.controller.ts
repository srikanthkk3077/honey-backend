import { Response, NextFunction } from 'express';
import { Coupon } from '../models/Coupon';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

// --- Validate & Apply Coupon (Customer) ---------------------------------------
export const validateCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { code, cartTotal, userEmail } = req.body;

    if (!code || !cartTotal) {
      return sendError(res, 'Coupon code and cart total are required', 400);
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) {
      return sendError(res, 'Invalid coupon code', 404);
    }

    if (coupon.status !== 'active') {
      return sendError(res, 'This coupon is no longer active', 400);
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      await Coupon.findByIdAndUpdate(coupon._id, { status: 'expired' });
      return sendError(res, 'This coupon has expired', 400);
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return sendError(res, 'This coupon has reached its usage limit', 400);
    }

    if (cartTotal < coupon.minOrderAmount) {
      return sendError(
        res,
        `Minimum order amount of Rs.${coupon.minOrderAmount} required to use this coupon`,
        400
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, cartTotal);
    discountAmount = Math.round(discountAmount * 100) / 100;

    return sendSuccess(res, 'Coupon applied successfully', {
      couponId: coupon._id.toString(),
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      minOrderAmount: coupon.minOrderAmount,
    });
  } catch (error) {
    next(error);
  }
};

// --- Admin: Get All Coupons ----------------------------------------------------
export const getAllCoupons = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (search) query.code = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [coupons, total] = await Promise.all([
      Coupon.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Coupon.countDocuments(query),
    ]);

    return sendSuccess(res, 'Coupons fetched successfully', {
      coupons,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// --- Admin: Get Single Coupon -------------------------------------------------
export const getCouponById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return sendError(res, 'Coupon not found', 404);
    return sendSuccess(res, 'Coupon fetched', coupon);
  } catch (error) {
    next(error);
  }
};

// --- Admin: Create Coupon -----------------------------------------------------
export const createCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      perUserLimit,
      status,
      expiresAt,
    } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return sendError(res, 'code, discountType, and discountValue are required', 400);
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return sendError(res, `Coupon code "${code.toUpperCase()}" already exists`, 400);
    }

    const couponData: any = {
      code: code.toUpperCase().trim(),
      description,
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: Number(maxDiscountAmount) || 0,
      usageLimit: Number(usageLimit) || 0,
      perUserLimit: Number(perUserLimit) || 1,
      status: status || 'active',
    };

    if (expiresAt) couponData.expiresAt = new Date(expiresAt);
    if (req.user?.id) couponData.createdBy = req.user.id;

    const coupon = await Coupon.create(couponData);

    return sendSuccess(res, 'Coupon created successfully', coupon, 201);
  } catch (error) {
    next(error);
  }
};

// --- Admin: Update Coupon -----------------------------------------------------
export const updateCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return sendError(res, 'Coupon not found', 404);

    const fields = [
      'description', 'discountType', 'discountValue', 'minOrderAmount',
      'maxDiscountAmount', 'usageLimit', 'perUserLimit', 'status',
    ];

    for (const f of fields) {
      if (req.body[f] !== undefined) {
        (coupon as any)[f] = req.body[f];
      }
    }

    if (req.body.expiresAt !== undefined) {
      coupon.expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : undefined;
    }

    if (req.body.code && req.body.code.toUpperCase().trim() !== coupon.code) {
      const dup = await Coupon.findOne({ code: req.body.code.toUpperCase().trim() });
      if (dup) return sendError(res, 'Coupon code already exists', 400);
      coupon.code = req.body.code.toUpperCase().trim();
    }

    await coupon.save();
    return sendSuccess(res, 'Coupon updated successfully', coupon);
  } catch (error) {
    next(error);
  }
};

// --- Admin: Delete Coupon -----------------------------------------------------
export const deleteCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return sendError(res, 'Coupon not found', 404);
    return sendSuccess(res, 'Coupon deleted successfully');
  } catch (error) {
    next(error);
  }
};

// --- Admin: Toggle Coupon Status ----------------------------------------------
export const toggleCouponStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return sendError(res, 'Coupon not found', 404);
    coupon.status = coupon.status === 'active' ? 'inactive' : 'active';
    await coupon.save();
    return sendSuccess(res, `Coupon ${coupon.status === 'active' ? 'activated' : 'deactivated'}`, coupon);
  } catch (error) {
    next(error);
  }
};

// Customer: Get Active Coupons (Public)
export const getActiveCoupons = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const now = new Date();
    const allActive = await Coupon.find({
      status: 'active',
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } },
      ],
    })
      .select('code description discountType discountValue minOrderAmount maxDiscountAmount expiresAt usageLimit usedCount')
      .sort({ minOrderAmount: 1 });

    const available = allActive.filter((c) => c.usageLimit === 0 || c.usedCount < c.usageLimit);

    return sendSuccess(res, 'Active coupons fetched successfully', available);
  } catch (error) {
    next(error);
  }
};
