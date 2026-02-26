import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { Router } from 'express';
import { getAllMesses, getMessById, createMess, getMyMess, updateMess } from '../controllers/messController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllMesses);
router.get('/my', protect, authorize('OWNER'), getMyMess);
router.put('/my', protect, authorize('OWNER'), updateMess);
router.get('/:id', getMessById);
router.post('/', protect, authorize('OWNER', 'ADMIN'), createMess);

export default router;
