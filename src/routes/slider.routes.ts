import { Router } from 'express';
import {
  getSliders,
  getSliderById,
  createSlider,
  updateSlider,
  deleteSlider,
} from '../controllers/slider.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// Public routes
router.get('/', getSliders);
router.get('/:id', getSliderById);

// Admin routes
router.post('/', authenticate, requireAdmin, createSlider);
router.put('/:id', authenticate, requireAdmin, updateSlider);
router.delete('/:id', authenticate, requireAdmin, deleteSlider);

export default router;
