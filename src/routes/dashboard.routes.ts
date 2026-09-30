import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

router.get('/stats', authenticate, requireAdmin, getDashboardStats);
router.get('/', authenticate, requireAdmin, getDashboardStats);

export default router;
