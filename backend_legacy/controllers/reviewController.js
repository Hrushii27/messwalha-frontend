const Review = require('../models/review');
const db = require('../config/db');

const reviewController = {
    createReview: async (req, res) => {
        const { messId, rating, comment } = req.body;
        const studentId = req.owner.id;

        try {
            const review = await Review.create(messId, studentId, rating, comment);

            // Update the average rating and reviews count in messes
            const avgRating = await Review.getAverageRating(messId);
            await db.query(
                'UPDATE messes SET rating = $1, reviews_count = reviews_count + 1 WHERE id = $2',
                [avgRating, messId]
            );

            res.status(201).json({ success: true, data: review, averageRating: avgRating });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error creating review' });
        }
    },

    getMessReviews: async (req, res) => {
        const { messId } = req.params;
        try {
            const reviews = await Review.findByMessId(messId);
            res.status(200).json({ success: true, data: reviews });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error fetching reviews' });
        }
    }
};

module.exports = reviewController;
