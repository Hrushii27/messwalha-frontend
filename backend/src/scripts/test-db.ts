console.log('--- DB TEST START ---');
import dotenv from 'dotenv';
const result = dotenv.config();
console.log('Dotenv config result:', result.error ? 'ERROR' : 'SUCCESS');
console.log('Raw Env Check - FIREBASE_SERVICE_ACCOUNT exists:', !!process.env.FIREBASE_SERVICE_ACCOUNT);
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log('Raw Env Length:', process.env.FIREBASE_SERVICE_ACCOUNT.length);
}

import { config } from '../config/environment.js';
console.log('Imported Config - FIREBASE_SERVICE_ACCOUNT exists:', !!config.FIREBASE_SERVICE_ACCOUNT);

import { db } from '../config/firebase.js';

const test = async () => {
    try {
        console.log('Testing Firestore connection and listing messes...');
        if (!db) {
            console.error('❌ DB object is null/undefined after import');
            process.exit(1)
        }
        const messesSnapshot = await db.collection('messes').get();
        console.log('✅ Connection successful. Found messes:', messesSnapshot.size);
        messesSnapshot.forEach(doc => {
            console.log(` - ${doc.data().name} (${doc.id})`);
        });
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed during get():', error);
        process.exit(1);
    }
};

test();
