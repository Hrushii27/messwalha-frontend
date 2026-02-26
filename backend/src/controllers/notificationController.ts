import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { db } from '../config/firebase.js';
import { AppError } from '../middleware/errorHandler.js';

export const getMyNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const snapshot = await db.collection('notifications')
            .where('userId', '==', req.user!.id)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const { id } = req.params;
        const userId = req.user!.id;

        if (id === 'all') {
            const snapshot = await db.collection('notifications')
                .where('userId', '==', userId)
                .where('read', '==', false)
                .get();

            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.update(doc.ref, { read: true });
            });
            await batch.commit();
        } else {
            // Ensure the notification belongs to the user before updating
            const notificationRef = db.collection('notifications').doc(id as string);
            const notificationDoc = await notificationRef.get();

            if (!notificationDoc.exists || notificationDoc.data()?.userId !== userId) {
                return next(new AppError('Notification not found or unauthorized', 404));
            }
            await notificationRef.update({ read: true });
        }

        res.status(200).json({ success: true, message: 'Notifications updated' });
    } catch (error) {
        next(error);
    }
};

export const deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const { id } = req.params;
        const userId = req.user!.id;

        // Ensure the notification belongs to the user before deleting
        const notificationRef = db.collection('notifications').doc(id as string);
        const notificationDoc = await notificationRef.get();

        if (!notificationDoc.exists || notificationDoc.data()?.userId !== userId) {
            return next(new AppError('Notification not found or unauthorized', 404));
        }

        await notificationRef.delete();

        res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        next(error);
    }
};
