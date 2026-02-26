import type { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase.js';
import type { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const createMenu = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const { messId, day, items } = req.body;

        // Verify mess ownership
        const messDoc = await db.collection('messes').doc(messId as string).get();
        if (!messDoc.exists || messDoc.data()?.ownerId !== req.user!.id) {
            return next(new AppError('Unauthorized', 403));
        }

        const menuRef = db.collection('menus').doc();
        const menuData = {
            id: menuRef.id,
            messId,
            day,
            items,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await menuRef.set(menuData);

        res.status(201).json({ success: true, data: menuData });
    } catch (error) {
        next(error);
    }
};

export const updateMenu = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const { items } = req.body;
        const { id } = req.params;
        if (!id) return next(new AppError('Menu ID is required', 400));

        const menuRef = db.collection('menus').doc(id as string);
        const menuDoc = await menuRef.get();

        if (!menuDoc.exists) {
            return next(new AppError('Menu not found', 404));
        }

        const menuData = menuDoc.data()!;
        const messDoc = await db.collection('messes').doc(menuData.messId).get();

        if (!messDoc.exists || messDoc.data()?.ownerId !== req.user!.id) {
            return next(new AppError('Unauthorized', 403));
        }

        await menuRef.update({
            items,
            updatedAt: new Date()
        });

        res.status(200).json({ success: true, message: 'Menu updated successfully' });
    } catch (error) {
        next(error);
    }
};
