import { Router, Request, Response, NextFunction } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  trackOrder,
  getAllOrders,
  updateOrderStatus,
  updateOrderTracking,
  cancelOrder,
  processOrderPayment,
} from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { verifyToken } from '../utils/generateToken';

const router = Router();

// Optional authentication middleware (allows both guest and authenticated users)
const optionalAuth = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = verifyToken(token);
    } catch {
      // Ignore invalid token for optional auth
    }
  }
  next();
};

// Customer & Public routes
router.post('/', optionalAuth, createOrder);
router.get('/track/:query', trackOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/:id', optionalAuth, getOrderById);
router.put('/:id/cancel', optionalAuth, cancelOrder);
router.post('/:id/pay', optionalAuth, processOrderPayment);

// Admin order routes
router.get('/admin/all', authenticate, requireAdmin, getAllOrders);
router.get('/', authenticate, requireAdmin, getAllOrders);
router.put('/:id/status', authenticate, requireAdmin, updateOrderStatus);
router.put('/:id/tracking', authenticate, requireAdmin, updateOrderTracking);

export default router;
