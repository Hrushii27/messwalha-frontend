import { Router } from 'express';
import { getMyChats, getChatMessages, createOrGetChat } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getMyChats);
router.get('/:chatId/messages', protect, getChatMessages);
router.post('/', protect, createOrGetChat);

export default router;
