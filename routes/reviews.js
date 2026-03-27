const express = require('express');
const router = express.Router();
const { addReview, getReviewsByMess, respondToReview, getUserReviews, checkUserReviewStatus } = require('../controllers/reviewController');

router.get('/my', (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    next();
}, getUserReviews);

router.get('/check', (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    next();
}, checkUserReviewStatus);

router.get('/:messId', getReviewsByMess);
router.post('/', (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Login required to submit a review' });
    next();
}, addReview);

router.post('/:reviewId/respond', (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    next();
}, respondToReview);
module.exports = router;
