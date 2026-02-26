import dotenv from 'dotenv';
dotenv.config();
import { db } from '../config/firebase.js';

const diagnose = async () => {
    try {
        console.log('--- DIAGNOSIS ---');
        if (!db) {
            console.error('Database not configured');
            process.exit(1);
        }

        // Access internal project ID if available
        const projectId = (db as any)._repository?._databaseId?.projectId || 'Unknown';
        console.log(`Current Project ID: ${projectId}`);

        const messSnapshot = await db.collection('messes').get();
        console.log(`Messes Found: ${messSnapshot.size}`);

        for (const doc of messSnapshot.docs) {
            const data = doc.data();
            console.log(` - [${doc.id}] ${data.name} (Cuisine: ${data.cuisine || 'MISSING'})`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Diagnosis failed:', error);
        process.exit(1);
    }
};

diagnose();
