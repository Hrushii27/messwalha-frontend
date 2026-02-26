import { Router } from 'express';
import { createReview, getMessReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/:messId', getMessReviews);
router.post('/', protect, createReview);

export default router;
