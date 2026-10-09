import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

import { getDashboardStats } from '../controllers/dashboard.controller';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
  getAllReviews,
  getHomeReviews,
  deleteReview,
  toggleReviewHome,
} from '../controllers/product.controller';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
} from '../controllers/category.controller';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderTracking,
  cancelOrder,
} from '../controllers/order.controller';
import {
  getAllCustomers,
  getCustomerById,
  updateCustomerStatus,
  getCustomerStats,
} from '../controllers/customer.controller';
import {
  createVideo,
  updateVideo,
  deleteVideo,
  getVideos,
  getVideoById,
} from '../controllers/video.controller';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import {
  getAllInquiries,
  updateInquiryStatus,
  getAllSubscribers,
} from '../controllers/contact.controller';
import {
  getSliders,
  getSliderById,
  createSlider,
  updateSlider,
  deleteSlider,
} from '../controllers/slider.controller';

const router = Router();

// Secure all admin routes with authentication & admin role check
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard', getDashboardStats);

// Products
router.get('/products/reviews/all', getAllReviews);
router.get('/products/reviews/home', getHomeReviews);
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Reviews Management
router.delete('/products/:id/reviews/:reviewId', deleteReview);
router.patch('/products/:id/reviews/:reviewId/toggle-home', toggleReviewHome);

// Categories
router.get('/categories', getAllCategories);
router.get('/categories/:id', getCategoryById);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Orders
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/tracking', updateOrderTracking);
router.put('/orders/:id/cancel', cancelOrder);

// Customers
router.get('/customers/stats', getCustomerStats);
router.get('/customers', getAllCustomers);
router.get('/customers/:id', getCustomerById);
router.put('/customers/:id/status', updateCustomerStatus);

// Videos
router.get('/videos', getVideos);
router.get('/videos/:id', getVideoById);
router.post('/videos', createVideo);
router.put('/videos/:id', updateVideo);
router.delete('/videos/:id', deleteVideo);

// Sliders
router.get('/sliders', getSliders);
router.get('/sliders/:id', getSliderById);
router.post('/sliders', createSlider);
router.put('/sliders/:id', updateSlider);
router.delete('/sliders/:id', deleteSlider);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Inquiries & Subscribers
router.get('/inquiries', getAllInquiries);
router.put('/inquiries/:id', updateInquiryStatus);
router.get('/subscribers', getAllSubscribers);

export default router;
