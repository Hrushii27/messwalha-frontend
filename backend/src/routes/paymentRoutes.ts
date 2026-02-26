import { Router } from 'express';
import { createOrder, verifyPayment, createOwnerOrder, verifyOwnerPayment, getMyPayments } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/owner/create-order', protect, createOwnerOrder);
router.post('/owner/verify', protect, verifyOwnerPayment);
router.get('/my', protect, getMyPayments);

export default router;
