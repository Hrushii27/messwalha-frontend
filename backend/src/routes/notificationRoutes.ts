import { Router } from 'express';
import { getMyNotifications, markAsRead, deleteNotification } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getMyNotifications);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
