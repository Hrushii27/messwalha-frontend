import type { Response, NextFunction } from 'express';
import { db } from '../config/firebase.js';
import type { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const toggleFavorite = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const { messId } = req.params;
        const userId = req.user!.id;

        const favoriteSnapshot = await db.collection('favorites')
            .where('userId', '==', userId)
            .where('messId', '==', messId)
            .limit(1)
            .get();

        if (!favoriteSnapshot.empty) {
            // Remove from favorites
            await favoriteSnapshot.docs[0].ref.delete();
            return res.status(200).json({ success: true, isFavorite: false, message: 'Removed from favorites' });
        } else {
            // Add to favorites
            const favoriteRef = db.collection('favorites').doc();
            await favoriteRef.set({
                id: favoriteRef.id,
                userId,
                messId,
                createdAt: new Date(),
            });
            return res.status(201).json({ success: true, isFavorite: true, message: 'Added to favorites' });
        }
    } catch (error) {
        next(error);
    }
};

export const getUserFavorites = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const userId = req.user!.id;
        const favoriteSnapshot = await db.collection('favorites')
            .where('userId', '==', userId)
            .get();

        const favoriteMessIds = favoriteSnapshot.docs.map(doc => doc.data().messId);

        if (favoriteMessIds.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        // Fetch mess details for all favorited IDs
        // Firestore 'in' query supports up to 10-30 IDs usually, doing it in chunks or simple loop for now
        const messes: any[] = [];
        for (const messId of favoriteMessIds) {
            const messDoc = await db.collection('messes').doc(messId).get();
            if (messDoc.exists) {
                messes.push(messDoc.data());
            }
        }

        res.status(200).json({ success: true, count: messes.length, data: messes });
    } catch (error) {
        next(error);
    }
};
