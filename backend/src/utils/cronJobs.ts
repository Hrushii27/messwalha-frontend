import { db } from '../config/firebase.js';

export const checkExpiredTrials = async () => {
    try {
        if (!db) return;

        console.log('[CRON] Checking for expired trials...');
        const now = new Date();

        const snapshot = await db.collection('owner_subscriptions')
            .where('status', '==', 'TRIAL')
            .where('trialEndDate', '<', now)
            .get();

        if (snapshot.empty) {
            console.log('[CRON] No expired trials found.');
            return;
        }

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, {
                status: 'EXPIRED',
                updatedAt: new Date()
            });
        });

        await batch.commit();
        console.log(`[CRON] ${snapshot.size} trials updated to EXPIRED.`);
    } catch (error) {
        console.error('[CRON] Error checking expired trials:', error);
    }
};
