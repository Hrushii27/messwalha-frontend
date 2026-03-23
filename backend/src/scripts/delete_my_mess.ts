import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { db } from '../config/firebase.js';

async function run() {
    try {
        if (!db) {
            console.error('Database not initialized (check .env FIREBASE_SERVICE_ACCOUNT)');
            process.exit(1);
        }

        console.log('Searching for users named SAI...');
        const usersSnapshot = await db.collection('users').get();
        let targetUserIds = [];

        usersSnapshot.forEach(doc => {
            const user = doc.data();
            if (user.name && user.name.toUpperCase().includes('SAI')) {
                targetUserIds.push(doc.id);
                console.log(`Found user: ${user.name} (ID: ${doc.id})`);
            }
        });

        if (targetUserIds.length > 0) {
            let totalDeleted = 0;
            for (const uid of targetUserIds) {
                console.log(`Searching for messes owned by ${uid}...`);
                const messesSnapshot = await db.collection('messes').where('ownerId', '==', uid).get();
                
                if (!messesSnapshot.empty) {
                    for (const doc of messesSnapshot.docs) {
                        await doc.ref.delete();
                        console.log(`✅ Deleted mess: ${doc.id}`);
                        totalDeleted++;
                    }
                }
            }
            console.log(`Successfully deleted ${totalDeleted} messes for user(s) SAI.`);
        } else {
            console.log('User SAI not found. Attempting to wipe all messes for local testing mode...');
            const messesSnapshot = await db.collection('messes').get();
            let totalDeleted = 0;
            for (const doc of messesSnapshot.docs) {
                await doc.ref.delete();
                console.log(`✅ Deleted mess: ${doc.id}`);
                totalDeleted++;
            }
            console.log(`Wiped ${totalDeleted} messes.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error running script:', error);
        process.exit(1);
    }
}

run();
