import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  deleteReview,
  getAllReviews,
  getHomeReviews,
  toggleReviewHome,
} from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// Public routes
// Review routes (must precede /:id)
router.get('/reviews/home', getHomeReviews);
router.get('/reviews/all', getAllReviews);

router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);
router.get('/:id/related', getRelatedProducts);
router.post('/:id/reviews', addReview);

// Protected routes (Admin & Reviewer)
router.delete('/:id/reviews/:reviewId', authenticate, deleteReview);
router.patch('/:id/reviews/:reviewId/toggle-home', authenticate, requireAdmin, toggleReviewHome);
router.post('/', authenticate, requireAdmin, createProduct);
router.put('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

export default router;
