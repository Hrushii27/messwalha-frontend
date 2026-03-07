import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';
import { db } from '../config/firebase.js';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('Not authorized, no token', 401));
        }

        const decoded = verifyToken(token);

        const userDoc = await db.collection('users').doc(decoded.id).get();

        if (!userDoc.exists) {
            return next(new AppError('User not found', 404));
        }

        const user = userDoc.data()!;
        req.user = { id: user.id, role: user.role };
        next();
    } catch (error) {
        return next(new AppError('Not authorized, token failed', 401));
    }
};

export const authenticate = protect;

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError(`User role ${req.user?.role} is not authorized to access this route`, 403));
        }
        next();
    };
};
