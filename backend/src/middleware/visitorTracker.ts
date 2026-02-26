import type { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { db } from '../config/firebase.js';

export const trackVisitor = async (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && (req.path === '/' || req.path === '/health' || req.path.startsWith('/api'))) {
        try {
            if (db) {
                await db.collection('platformStats').doc('main').set({
                    totalVisits: admin.firestore.FieldValue.increment(1)
                }, { merge: true });
            }
        } catch (error: any) {
            console.error('Error tracking visitor:', error.message || error);
        }
    }
    next();
};
