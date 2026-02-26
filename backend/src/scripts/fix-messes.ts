import dotenv from 'dotenv';
dotenv.config();
import { db } from '../config/firebase.js';

const fix = async () => {
    try {
        console.log('--- STARTING MESS FIX SCRIPT ---');
        if (!db) {
            console.error('Database not configured');
            process.exit(1);
        }

        const messSnapshot = await db.collection('messes').get();
        console.log(`Found ${messSnapshot.size} messes to check.`);

        const batch = db.batch();
        let fixedCuisine = 0;
        let fixedSub = 0;

        const cuisineOptions = ['Veg', 'Non-Veg', 'Maharashtrian', 'North Indian', 'South Indian', 'Chinese'];

        for (const doc of messSnapshot.docs) {
            const messData = doc.data();
            const updates: any = {};

            // 1. Ensure Cuisine exists and is meaningful
            if (!messData.cuisine || messData.cuisine === 'Veg') {
                const randomCuisine = cuisineOptions[Math.floor(Math.random() * cuisineOptions.length)];
                updates.cuisine = randomCuisine;
                fixedCuisine++;
            }

            if (Object.keys(updates).length > 0) {
                batch.update(doc.ref, updates);
            }

            // 2. Ensure Owner Subscription is ACTIVE
            const subSnapshot = await db.collection('owner_subscriptions')
                .where('ownerId', '==', messData.ownerId)
                .limit(1)
                .get();

            if (subSnapshot.empty) {
                const subRef = db.collection('owner_subscriptions').doc();
                batch.set(subRef, {
                    id: subRef.id,
                    ownerId: messData.ownerId,
                    status: 'ACTIVE',
                    planName: 'PREMIUM',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                fixedSub++;
            } else {
                const subDoc = subSnapshot.docs[0];
                const subData = subDoc.data();
                if (subData.status !== 'ACTIVE' && subData.status !== 'TRIAL') {
                    batch.update(subDoc.ref, {
                        status: 'ACTIVE',
                        updatedAt: new Date()
                    });
                    fixedSub++;
                }
            }
        }

        if (fixedCuisine > 0 || fixedSub > 0) {
            await batch.commit();
            console.log(`✅ Fix completed!`);
            console.log(` - Fixed Cuisine for ${fixedCuisine} messes`);
            console.log(` - Fixed/Created Subscriptions for ${fixedSub} owners`);
        } else {
            console.log('ℹ️ No issues found that required fixing.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Fix failed:', error);
        process.exit(1);
    }
};

fix();
