import { Router } from 'express';
import { createSubscription, getMySubscriptions, getOwnerSubscribers, getSubscriptionStatus } from '../controllers/subscriptionController.js';
import { protect, authorize } from '../middleware/auth.js';
const router = Router();
router.post('/', protect, createSubscription);
router.get('/status', protect, getSubscriptionStatus);
router.get('/my-subscriptions', protect, getMySubscriptions);
router.get('/subscribers', protect, authorize('OWNER'), getOwnerSubscribers);
export default router;
//# sourceMappingURL=subscriptionRoutes.js.map