const express = require('express');
const router = express.Router();
const { addReview, getReviewsByMess } = require('../controllers/reviewController');

// Global middleware for this router can be added here if needed
// For now, only POST is protected via the controller's logic (or we can add it here)

router.get('/:messId', getReviewsByMess);
router.post('/', (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Login required to submit a review' });
    next();
}, addReview);

module.exports = router;
