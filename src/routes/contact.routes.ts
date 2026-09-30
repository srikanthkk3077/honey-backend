import { Router } from 'express';
import {
  submitContact,
  getAllInquiries,
  updateInquiryStatus,
  subscribeNewsletter,
  getAllSubscribers,
} from '../controllers/contact.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// Public routes
router.post('/', submitContact);
router.post('/newsletter', subscribeNewsletter);
router.post('/subscribe', subscribeNewsletter);

// Admin routes
router.get('/inquiries', authenticate, requireAdmin, getAllInquiries);
router.put('/inquiries/:id', authenticate, requireAdmin, updateInquiryStatus);
router.get('/subscribers', authenticate, requireAdmin, getAllSubscribers);

export default router;
