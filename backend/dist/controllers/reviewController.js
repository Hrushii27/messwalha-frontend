import { db } from '../config/firebase.js';
import { AppError } from '../middleware/errorHandler.js';
export const createReview = async (req, res, next) => {
    try {
        if (!db)
            return next(new AppError('Database not configured', 500));
        const { messId, rating, comment, images } = req.body;
        const reviewRef = db.collection('reviews').doc();
        const reviewData = {
            id: reviewRef.id,
            userId: req.user.id,
            messId,
            rating: parseFloat(rating),
            comment,
            images: images || [],
            createdAt: new Date(),
        };
        await reviewRef.set(reviewData);
        // Update mess rating
        const reviewsSnapshot = await db.collection('reviews').where('messId', '==', messId).get();
        if (!reviewsSnapshot.empty) {
            const reviews = reviewsSnapshot.docs.map(doc => doc.data());
            const avgRating = reviews.reduce((acc, current) => acc + current.rating, 0) / reviews.length;
            await db.collection('messes').doc(messId).update({ rating: avgRating });
        }
        res.status(201).json({ success: true, data: reviewData });
    }
    catch (error) {
        next(error);
    }
};
export const getMessReviews = async (req, res, next) => {
    try {
        if (!db)
            return next(new AppError('Database not configured', 500));
        const reviewsSnapshot = await db.collection('reviews')
            .where('messId', '==', req.params.messId)
            .get();
        const reviews = await Promise.all(reviewsSnapshot.docs.map(async (doc) => {
            const reviewData = doc.data();
            const userDoc = await db.collection('users').doc(reviewData.userId).get();
            return {
                ...reviewData,
                user: userDoc.exists ? { name: userDoc.data().name, avatar: userDoc.data().avatar } : null
            };
        }));
        res.status(200).json({ success: true, data: reviews });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=reviewController.js.map