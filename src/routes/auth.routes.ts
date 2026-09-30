import { Router } from 'express';
import { register, login, adminLogin, getProfile, updateProfile, changePassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/admin-login', adminLogin);

// Protected user profile endpoints
router.get('/me', authenticate, getProfile);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;
