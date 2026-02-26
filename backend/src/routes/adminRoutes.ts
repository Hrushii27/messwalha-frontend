import { Router } from 'express';
import { getStats, getAllUsers, getAllMessesAdmin, verifyMess, deleteUserAdmin } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// All routes here are restricted to ADMIN only
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/messes', getAllMessesAdmin);
router.put('/messes/:id/verify', verifyMess);
router.delete('/users/:id', deleteUserAdmin);

export default router;
