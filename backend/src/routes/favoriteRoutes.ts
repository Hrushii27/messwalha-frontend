import { Router } from 'express';
import { toggleFavorite, getUserFavorites } from '../controllers/favoriteController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/toggle/:messId', toggleFavorite);
router.get('/', getUserFavorites);

export default router;
