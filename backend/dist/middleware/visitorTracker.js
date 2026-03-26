import admin from 'firebase-admin';
import { db } from '../config/firebase.js';
export const trackVisitor = async (req, res, next) => {
    if (req.method === 'GET' && (req.path === '/' || req.path === '/health' || req.path.startsWith('/api'))) {
        try {
            if (db) {
                await db.collection('platformStats').doc('main').set({
                    totalVisits: admin.firestore.FieldValue.increment(1)
                }, { merge: true });
            }
        }
        catch (error) {
            console.error('Error tracking visitor:', error.message || error);
        }
    }
    next();
};
//# sourceMappingURL=visitorTracker.js.map