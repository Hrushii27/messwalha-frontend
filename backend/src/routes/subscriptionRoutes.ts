import { Router } from 'express';
import { createSubscription, getMySubscriptions, getOwnerSubscribers } from '../controllers/subscriptionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, createSubscription);
router.get('/my-subscriptions', protect, getMySubscriptions);
router.get('/subscribers', protect, authorize('OWNER'), getOwnerSubscribers);

export default router;
