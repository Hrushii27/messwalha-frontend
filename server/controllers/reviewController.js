const Review = require('../models/review');
const db = require('../config/db');

const addReview = async (req, res) => {
    try {
        const { mess_id, rating, comment } = req.body;
        const userId = req.user.id;

        if (!mess_id || !rating) {
            return res.status(400).json({ message: 'Mess ID and rating are required' });
        }

        const review = await Review.create(mess_id, userId, rating, comment);
        res.status(201).json({ success: true, data: review });
    } catch (err) {
        console.error('Error adding review:', err);
        res.status(500).json({ message: 'Error adding review' });
    }
};

const getReviewsByMess = async (req, res) => {
    try {
        const { messId } = req.params;
        const reviews = await Review.findByMessId(messId);
        res.json({ success: true, data: reviews });
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({ message: 'Error fetching reviews' });
    }
};

const respondToReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { response } = req.body;
        const ownerId = req.user.id;

        // Verify that the owner owns the mess for this review
        const review = await db.query(
            'SELECT r.* FROM reviews r JOIN mess_listings ml ON r.mess_id = ml.id WHERE r.id = $1 AND ml.mess_owner_id = $2',
            [reviewId, ownerId]
        );

        if (review.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized to respond to this review' });
        }

        const updatedReview = await Review.respond(reviewId, response);
        res.json({ success: true, data: updatedReview });
    } catch (err) {
        console.error('Error responding to review:', err);
        res.status(500).json({ message: 'Error responding to review' });
    }
};

const getUserReviews = async (req, res) => {
    try {
        const userId = req.user.id;
        const reviews = await Review.findByUserId(userId);
        res.json({ success: true, data: reviews });
    } catch (err) {
        console.error('Error fetching user reviews:', err);
        res.status(500).json({ message: 'Error fetching reviews' });
    }
};

module.exports = {
    addReview,
    getReviewsByMess,
    respondToReview,
    getUserReviews
};
