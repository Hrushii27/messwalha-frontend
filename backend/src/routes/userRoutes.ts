import { Router } from 'express';
import { getProfile, updateProfile, changePassword, uploadAvatar, getActivity } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);
router.post('/upload-avatar', uploadAvatar);
router.get('/activity', getActivity);

export default router;
