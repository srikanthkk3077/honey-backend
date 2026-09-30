import { Router } from 'express';
import {
  getVideos,
  getVideoById,
  incrementVideoViews,
  createVideo,
  updateVideo,
  deleteVideo,
} from '../controllers/video.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// Public routes
router.get('/', getVideos);
router.get('/:id', getVideoById);
router.post('/:id/view', incrementVideoViews);

// Admin routes
router.post('/', authenticate, requireAdmin, createVideo);
router.put('/:id', authenticate, requireAdmin, updateVideo);
router.delete('/:id', authenticate, requireAdmin, deleteVideo);

export default router;
