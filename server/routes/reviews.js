const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { addReview, getReviewsByMess } = require('../controllers/reviewController');

// Global middleware for this router can be added here if needed
// For now, only POST is protected via the controller's logic (or we can add it here)
=======
const { addReview, getReviewsByMess, respondToReview, getUserReviews } = require('../controllers/reviewController');

router.get('/my', (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    next();
}, getUserReviews);
>>>>>>> 3188c9a67539e26bc98942bbe963b9995a127f3a

router.get('/:messId', getReviewsByMess);
router.post('/', (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Login required to submit a review' });
    next();
}, addReview);

<<<<<<< HEAD
=======
router.post('/:reviewId/respond', (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    next();
}, respondToReview);

>>>>>>> 3188c9a67539e26bc98942bbe963b9995a127f3a
module.exports = router;
