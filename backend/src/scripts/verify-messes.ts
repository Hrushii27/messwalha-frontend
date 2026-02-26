import dotenv from 'dotenv';
dotenv.config();
import { db } from '../config/firebase.js';

const verify = async () => {
    try {
        console.log('--- VERIFYING MESS FILTERING ---');
        if (!db) {
            console.error('Database not configured');
            process.exit(1);
        }

        const messSnapshot = await db.collection('messes').get();
        console.log(`Total messes in DB: ${messSnapshot.size}`);

        let visibleCount = 0;

        for (const doc of messSnapshot.docs) {
            const messData = doc.data();

            // Replicate backend filter logic from messController.ts
            const subSnapshot = await db.collection('owner_subscriptions')
                .where('ownerId', '==', messData.ownerId)
                .limit(1)
                .get();

            const subData = !subSnapshot.empty ? subSnapshot.docs[0].data() : null;

            if (subData && (subData.status === 'TRIAL' || subData.status === 'ACTIVE')) {
                visibleCount++;
                console.log(`✅ ${messData.name} is VISIBLE (Status: ${subData.status})`);
            } else {
                console.log(`❌ ${messData.name} is HIDDEN (Status: ${subData ? subData.status : 'NO SUB'})`);
            }
        }

        console.log(`\nFinal result: ${visibleCount} / ${messSnapshot.size} messes are visible.`);
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verify();
