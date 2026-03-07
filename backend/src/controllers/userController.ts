import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase.js';
import { AppError } from '../middleware/errorHandler.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;

        if (!db) {
            return next(new AppError('Database not configured', 500));
        }

        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return next(new AppError('User not found', 404));
        }

        const userData = userDoc.data();
        if (userData) {
            delete userData.password;
        }

        res.status(200).json({
            success: true,
            data: userData
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { name, phone } = req.body;

        if (!db) {
            return next(new AppError('Database not configured', 500));
        }

        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return next(new AppError('User not found', 404));
        }

        const updateData: any = {
            updatedAt: new Date()
        };

        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;

        await userRef.update(updateData);

        const updatedUser = (await userRef.get()).data();
        if (updatedUser) {
            delete updatedUser.password;
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { currentPassword, newPassword } = req.body;

        if (!db) {
            return next(new AppError('Database not configured', 500));
        }

        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        const user = userDoc.data();

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Verify current password
        const isMatch = await comparePassword(currentPassword, user.password);
        if (!isMatch) {
            return next(new AppError('Incorrect current password', 401));
        }

        // Hash and update new password
        const hashedPassword = await hashPassword(newPassword);
        await userRef.update({
            password: hashedPassword,
            updatedAt: new Date()
        });

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { avatarUrl } = req.body; // In a real app, this would be a file upload to S3/Firebase Storage

        if (!db) {
            return next(new AppError('Database not configured', 500));
        }

        if (!avatarUrl) {
            return next(new AppError('Avatar URL is required', 400));
        }

        const userRef = db.collection('users').doc(userId);
        await userRef.update({
            avatar: avatarUrl,
            updatedAt: new Date()
        });

        res.status(200).json({
            success: true,
            message: 'Avatar updated successfully',
            avatar: avatarUrl
        });
    } catch (error) {
        next(error);
    }
};

export const getActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;

        if (!db) {
            return next(new AppError('Database not configured', 500));
        }

        // Fetch recent activities from a hypothetical 'activities' collection
        const activitiesSnapshot = await db.collection('activities')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        const activities = activitiesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Mock activities if none found for demonstration
        if (activities.length === 0) {
            return res.status(200).json({
                success: true,
                data: [
                    { id: '1', type: 'PROFILE_UPDATE', message: 'Profile information updated', createdAt: new Date() },
                    { id: '2', type: 'LOGIN', message: 'Login session started', createdAt: new Date(Date.now() - 86400000) }
                ]
            });
        }

        res.status(200).json({
            success: true,
            data: activities
        });
    } catch (error) {
        next(error);
    }
};
