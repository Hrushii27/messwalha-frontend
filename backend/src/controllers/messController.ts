import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { db } from '../config/firebase.js';

export const getAllMesses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const { cuisine, verified, minRating } = req.query;

        let query: any = db.collection('messes').where('isVisible', '==', true);

        if (cuisine) {
            query = query.where('cuisine', '==', cuisine as string);
        }
        if (verified === 'true') {
            query = query.where('verified', '==', true);
        }
        if (minRating) {
            query = query.where('rating', '>=', parseFloat(minRating as string));
        }

        const messSnapshot = await query.get();
        const messes = await Promise.all(messSnapshot.docs.map(async (doc: any) => {
            const messData = doc.data();

            // Fetch owner details
            const ownerDoc = await db!.collection('users').doc(messData.ownerId).get();
            const ownerData = ownerDoc.exists ? ownerDoc.data() : null;

            // Fetch owner subscription to check status
            const subSnapshot = await db!.collection('owner_subscriptions')
                .where('ownerId', '==', messData.ownerId)
                .limit(1)
                .get();
            const subData = !subSnapshot.empty ? subSnapshot.docs[0].data() : null;

            // TRIAL and ACTIVE must be visible. If isVisible is true, we simply map it.
            return {
                ...messData,
                owner: ownerData ? { name: ownerData.name, avatar: ownerData.avatar } : null,
                subscriptionStatus: subData ? subData.status : 'TRIAL'
            };
        }));

        const filteredMesses = messes.filter(m => m !== null);

        res.status(200).json({ success: true, count: filteredMesses.length, data: filteredMesses });
    } catch (error) {
        next(error);
    }
};

export const getMessById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const messDoc = await db.collection('messes').doc(req.params.id as string).get();
        if (!messDoc.exists) {
            return next(new AppError('Mess not found', 404));
        }

        const messData = messDoc.data()!;

        // Parallel fetch for related data
        const [ownerDoc, menusSnapshot, reviewsSnapshot] = await Promise.all([
            db.collection('users').doc(messData.ownerId).get(),
            db.collection('menus').where('messId', '==', messData.id).get(),
            db.collection('reviews').where('messId', '==', messData.id).get()
        ]);

        const ownerData = ownerDoc.exists ? ownerDoc.data() : null;
        const menus = menusSnapshot.docs.map(doc => doc.data());

        const reviews = await Promise.all(reviewsSnapshot.docs.map(async (doc) => {
            const reviewData = doc.data();
            const userDoc = await db!.collection('users').doc(reviewData.userId).get();
            const userData = userDoc.exists ? userDoc.data() : null;
            return {
                ...reviewData,
                user: userData ? { name: userData.name, avatar: userData.avatar } : null
            };
        }));

        res.status(200).json({
            success: true,
            data: {
                ...messData,
                owner: ownerData ? { name: ownerData.name, avatar: ownerData.avatar } : null,
                menus,
                reviews
            }
        });
    } catch (error) {
        next(error);
    }
};

export const createMess = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const { name, description, address, latitude, longitude, cuisine, contact, images } = req.body;

        console.log("Creating mess:", req.body);

        // Check if owner already has a mess
        const existingMess = await db.collection('messes').where('ownerId', '==', req.user!.id).limit(1).get();
        if (!existingMess.empty) {
            return next(new AppError('You already added a mess. Please edit your existing mess.', 400));
        }

        const trialStart = new Date();
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 60);

        const messRef = db.collection('messes').doc();
        const messData = {
            id: messRef.id,
            isVisible: true,
            subscriptionStatus: 'TRIAL',
            trialStartDate: trialStart,
            trialEndDate: trialEnd,
            name,
            description,
            address,
            latitude: latitude || null,
            longitude: longitude || null,
            cuisine,
            contact,
            images: images || [],
            ownerId: req.user!.id,
            rating: 0,
            verified: false,
            monthlyPrice: 2500,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await messRef.set(messData);

        console.log("Saved mess:", messData);

        res.status(201).json({ success: true, data: messData });
    } catch (error) {
        next(error);
    }
};

export const getMyMess = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const messSnapshot = await db.collection('messes').where('ownerId', '==', req.user!.id).limit(1).get();

        if (messSnapshot.empty) {
            return next(new AppError('Mess not found for this owner', 404));
        }

        const messDoc = messSnapshot.docs[0];
        const messData = messDoc.data();

        // Parallel fetch for related data
        const [menusSnapshot, reviewsSnapshot] = await Promise.all([
            db.collection('menus').where('messId', '==', messData.id).get(),
            db.collection('reviews').where('messId', '==', messData.id).get()
        ]);

        const menus = menusSnapshot.docs.map(doc => doc.data());
        const reviews = await Promise.all(reviewsSnapshot.docs.map(async (doc) => {
            const reviewData = doc.data();
            const userDoc = await db!.collection('users').doc(reviewData.userId).get();
            const userData = userDoc.exists ? userDoc.data() : null;
            return {
                ...reviewData,
                user: userData ? { name: userData.name, avatar: userData.avatar } : null
            };
        }));

        res.status(200).json({
            success: true,
            data: {
                ...messData,
                menus,
                reviews
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updateMess = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const { name, description, address, cuisine, contact, images } = req.body;

        const messSnapshot = await db.collection('messes').where('ownerId', '==', req.user!.id).limit(1).get();
        if (messSnapshot.empty) {
            return next(new AppError('Mess not found for this owner', 404));
        }

        const messDoc = messSnapshot.docs[0];
        const updateData = {
            name,
            description,
            address,
            cuisine,
            contact,
            images: images || [],
            updatedAt: new Date(),
        };

        await messDoc.ref.update(updateData);

        res.status(200).json({ success: true, data: { ...messDoc.data(), ...updateData } });
    } catch (error) {
        next(error);
    }
};
