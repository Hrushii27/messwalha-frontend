const Review = require('../models/review');

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

module.exports = {
    addReview,
    getReviewsByMess
};
