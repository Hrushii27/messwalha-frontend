import { Router } from 'express';
import { createMenu, updateMenu } from '../controllers/menuController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, authorize('OWNER'), createMenu);
router.put('/:id', protect, authorize('OWNER'), updateMenu);

export default router;
