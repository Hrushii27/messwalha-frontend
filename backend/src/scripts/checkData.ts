import { db } from '../config/firebase.js';

const checkData = async () => {
    if (!db) {
        console.error('❌ Database not initialized');
        return;
    }

    try {
        console.log('🔍 Checking users...');
        const usersSnapshot = await db.collection('users').limit(5).get();
        console.log(`Found ${usersSnapshot.size} users`);
        usersSnapshot.forEach(doc => console.log(doc.id, '=>', doc.data().name));

        console.log('🔍 Checking messes...');
        const messSnapshot = await db.collection('messes').get();
        console.log(`Found ${messSnapshot.size} messes`);
        messSnapshot.forEach(doc => console.log(doc.id, '=>', doc.data().name));

        console.log('🔍 Checking subscriptions...');
        const subSnapshot = await db.collection('owner_subscriptions').get();
        console.log(`Found ${subSnapshot.size} subscriptions`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking database:', error);
        process.exit(1);
    }
};

checkData();
