import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler.js';
import type { AuthRequest } from '../middleware/auth.js';
import { db } from '../config/firebase.js';

export const getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const [
            usersSnapshot,
            messesSnapshot,
            activeSubsSnapshot,
            paymentsSnapshot,
            platformStatsDoc,
            ownerSubsSnapshot
        ] = await Promise.all([
            db.collection('users').count().get(),
            db.collection('messes').count().get(),
            db.collection('subscriptions').where('status', '==', 'ACTIVE').count().get(),
            db.collection('payments').where('status', '==', 'SUCCESS').get(),
            db.collection('platformStats').doc('main').get(),
            db.collection('owner_subscriptions').get()
        ]);

        const totalRevenue = paymentsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
        const platformStats = platformStatsDoc.exists ? platformStatsDoc.data() : { totalVisits: 0 };

        const ownerSubs = ownerSubsSnapshot.docs.map(doc => doc.data());
        const ownerStats = {
            trial: ownerSubs.filter(s => s.status === 'TRIAL').length,
            active: ownerSubs.filter(s => s.status === 'ACTIVE').length,
            expired: ownerSubs.filter(s => s.status === 'EXPIRED').length,
        };

        res.status(200).json({
            success: true,
            data: {
                users: usersSnapshot.data().count,
                messes: messesSnapshot.data().count,
                activeSubscriptions: activeSubsSnapshot.data().count,
                totalRevenue,
                totalVisits: platformStats!.totalVisits || 0,
                ownerStats
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const usersSnapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
        const users = await Promise.all(usersSnapshot.docs.map(async (doc) => {
            const userData = doc.data();
            const subsSnapshot = await db!.collection('subscriptions').where('userId', '==', doc.id).count().get();
            return {
                id: doc.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                createdAt: userData.createdAt,
                _count: { subscriptions: subsSnapshot.data().count }
            };
        }));

        res.status(200).json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

export const getAllMessesAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const messesSnapshot = await db.collection('messes').orderBy('createdAt', 'desc').get();
        const messes = await Promise.all(messesSnapshot.docs.map(async (doc) => {
            const messData = doc.data();
            const [ownerDoc, subsCount, reviewsCount] = await Promise.all([
                db!.collection('users').doc(messData.ownerId).get(),
                db!.collection('subscriptions').where('messId', '==', doc.id).count().get(),
                db!.collection('reviews').where('messId', '==', doc.id).count().get()
            ]);

            return {
                ...messData,
                owner: ownerDoc.exists ? { name: ownerDoc.data()!.name, email: ownerDoc.data()!.email } : null,
                _count: { subscriptions: subsCount.data().count, reviews: reviewsCount.data().count }
            };
        }));

        res.status(200).json({ success: true, data: messes });
    } catch (error) {
        next(error);
    }
};

export const verifyMess = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const { id } = req.params;
        const { verified } = req.body;

        await db.collection('messes').doc(id as string).update({ verified });

        res.status(200).json({ success: true, message: 'Mess verification status updated' });
    } catch (error) {
        next(error);
    }
};

export const deleteUserAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const { id } = req.params;

        // Prevent self-deletion
        if (id === req.user!.id) {
            return next(new AppError('You cannot delete your own admin account', 400));
        }

        await db.collection('users').doc(id as string).delete();

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};
