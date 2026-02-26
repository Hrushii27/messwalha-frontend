import dotenv from 'dotenv';
dotenv.config();
import { db } from '../config/firebase.js';

const analyze = async () => {
    try {
        console.log('--- MESS STATUS ANALYSIS ---');
        if (!db) {
            console.error('Database not configured');
            process.exit(1);
        }

        const messSnapshot = await db.collection('messes').get();
        console.log(`Total messes in DB: ${messSnapshot.size}`);

        let passed = 0;
        let missingOwner = 0;
        let missingSub = 0;
        let expiredSub = 0;

        for (const doc of messSnapshot.docs) {
            const messData = doc.data();

            // 1. Check Owner
            const ownerDoc = await db.collection('users').doc(messData.ownerId).get();
            if (!ownerDoc.exists) {
                missingOwner++;
                continue;
            }

            // 2. Check Subscription
            const subSnapshot = await db.collection('owner_subscriptions')
                .where('ownerId', '==', messData.ownerId)
                .limit(1)
                .get();

            if (subSnapshot.empty) {
                missingSub++;
                continue;
            }

            const subData = subSnapshot.docs[0].data();
            if (subData.status === 'TRIAL' || subData.status === 'ACTIVE') {
                passed++;
            } else {
                expiredSub++;
            }
        }

        console.log('\nResults:');
        console.log(`✅ Passed Filter: ${passed}`);
        console.log(`❌ Missing Owner: ${missingOwner}`);
        console.log(`❌ Missing Subscription: ${missingSub}`);
        console.log(`❌ Inactive/Expired Subscription: ${expiredSub}`);

        process.exit(0);
    } catch (error) {
        console.error('Analysis failed:', error);
        process.exit(1);
    }
};

analyze();
