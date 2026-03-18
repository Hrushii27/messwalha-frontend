import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { db } from '../config/firebase.js';

export const createSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const { messId, planType } = req.body;

        // Calculate end date based on plan type
        const startDate = new Date();
        let endDate = new Date();
        if (planType === 'MONTHLY') endDate.setMonth(startDate.getMonth() + 1);
        else if (planType === 'QUARTERLY') endDate.setMonth(startDate.getMonth() + 3);
        else if (planType === 'YEARLY') endDate.setFullYear(startDate.getFullYear() + 1);

        const subRef = db.collection('subscriptions').doc();
        const subscription = {
            id: subRef.id,
            userId: req.user!.id,
            messId,
            planType,
            startDate,
            endDate,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await subRef.set(subscription);

        res.status(201).json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
};

export const getMySubscriptions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const subSnapshot = await db.collection('subscriptions').where('userId', '==', req.user!.id).get();

        const subscriptions = await Promise.all(subSnapshot.docs.map(async (doc) => {
            const subData = doc.data();
            const messDoc = await db!.collection('messes').doc(subData.messId).get();

            // Helper to handle Firestore Timestamps or generic dates
            const toISOString = (val: any) => {
                if (!val) return null;
                if (val.toDate && typeof val.toDate === 'function') return val.toDate().toISOString();
                return new Date(val).toISOString();
            };

            return {
                ...subData,
                startDate: toISOString(subData.startDate),
                endDate: toISOString(subData.endDate),
                createdAt: toISOString(subData.createdAt),
                mess: messDoc.exists ? messDoc.data() : null
            };
        }));

        res.status(200).json({ success: true, data: subscriptions });
    } catch (error) {
        next(error);
    }
};

export const getOwnerSubscribers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const messSnapshot = await db.collection('messes').where('ownerId', '==', req.user!.id).limit(1).get();
        if (messSnapshot.empty) {
            return next(new AppError('Mess not found', 404));
        }
        const mess = messSnapshot.docs[0].data();

        const [subscribersSnapshot, paymentsSnapshot] = await Promise.all([
            db.collection('subscriptions')
                .where('messId', '==', mess.id)
                .orderBy('createdAt', 'desc')
                .get(),
            db.collection('payments')
                .where('messId', '==', mess.id)
                .where('status', '==', 'SUCCESS')
                .get()
        ]);

        const toISOString = (val: any) => {
            if (!val) return null;
            if (val.toDate && typeof val.toDate === 'function') return val.toDate().toISOString();
            return new Date(val).toISOString();
        };

        const subscribers = await Promise.all(subscribersSnapshot.docs.map(async (doc) => {
            const subData = doc.data();
            const userDoc = await db!.collection('users').doc(subData.userId).get();
            const userData = userDoc.exists ? userDoc.data() : null;
            return {
                ...subData,
                startDate: toISOString(subData.startDate),
                endDate: toISOString(subData.endDate),
                createdAt: toISOString(subData.createdAt),
                user: userData ? { name: userData.name, email: userData.email, avatar: userData.avatar } : null
            };
        }));

        const totalRevenue = paymentsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

        res.status(200).json({
            success: true,
            count: subscribers.length,
            totalRevenue,
            data: subscribers
        });
    } catch (error) {
        next(error);
    }
};

export const getSubscriptionStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const subSnapshot = await db.collection('owner_subscriptions')
            .where('ownerId', '==', req.user!.id)
            .limit(1)
            .get();

        if (subSnapshot.empty) {
            // First time owners get a 60-day trial automatically
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + 60);

            const newSubRef = db.collection('owner_subscriptions').doc();
            const newSub = {
                id: newSubRef.id,
                ownerId: req.user!.id,
                status: 'trial',
                planName: 'FREE_TRIAL',
                trial_end: trialEnd,
                trial_end_date: trialEnd, // Duplicate for frontend compatibility
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await newSubRef.set(newSub);
            return res.status(200).json({ success: true, data: newSub });
        }

        const subData = subSnapshot.docs[0].data();
        
        // Helper to handle Firestore Timestamps
        const toDate = (val: any) => {
            if (!val) return null;
            if (val.toDate && typeof val.toDate === 'function') return val.toDate();
            return new Date(val);
        };

        const trial_end = toDate(subData.trial_end);
        const subscription_end = toDate(subData.subscription_end);
        const now = new Date();

        let status = subData.status || 'inactive';
        if (status === 'trial' && trial_end && trial_end < now) {
            status = 'expired';
        } else if (status === 'active' && subscription_end && subscription_end < now) {
            status = 'expired';
        }

        const subscription = {
            ...subData,
            status,
            trial_end,
            trial_end_date: trial_end, // Add for compatibility
            subscription_end,
            nextBillingDate: toDate(subData.nextBillingDate),
            isActive: status === 'trial' || status === 'active'
        };

        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
};
