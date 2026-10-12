import { Router } from 'express';
import {
  validateCoupon,
  getActiveCoupons,
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
} from '../controllers/coupon.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// Public / Customer
router.get('/active', getActiveCoupons);
router.post('/validate', validateCoupon);

// Admin only
router.get('/', authenticate, requireAdmin, getAllCoupons);
router.post('/', authenticate, requireAdmin, createCoupon);
router.get('/:id', authenticate, requireAdmin, getCouponById);
router.put('/:id', authenticate, requireAdmin, updateCoupon);
router.delete('/:id', authenticate, requireAdmin, deleteCoupon);
router.patch('/:id/toggle', authenticate, requireAdmin, toggleCouponStatus);

export default router;
