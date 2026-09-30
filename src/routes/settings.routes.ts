import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// Public: Get store settings (rates, phone, threshold)
router.get('/', getSettings);

// Admin: Update store settings
router.put('/', authenticate, requireAdmin, updateSettings);

export default router;
