import { Router } from 'express';
import {
  getAllCustomers,
  getCustomerById,
  updateCustomerStatus,
  getCustomerStats,
} from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// All customer management routes are protected for admin
router.use(authenticate, requireAdmin);

router.get('/stats', getCustomerStats);
router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.patch('/:id/status', updateCustomerStatus);

export default router;
