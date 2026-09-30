import { Router } from 'express';
import { processPayment, verifyPayment } from '../controllers/payment.controller';

const router = Router();

router.post('/process', processPayment);
router.post('/verify', verifyPayment);

export default router;
