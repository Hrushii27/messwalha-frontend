import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseApp: admin.app.App;

console.log('Firebase initialization module loading...');

try {
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT;
    let serviceAccount: any = null;

    if (b64) {
        try {
            const rawJson = Buffer.from(b64.trim(), 'base64').toString('utf8');
            serviceAccount = JSON.parse(rawJson);
            console.log('✅ Loaded Firebase Service Account from environment');
        } catch (e) {
            console.warn('⚠️ Direct JSON parse from ENV failed, attempting structural repair...');
            try {
                const rawJson = Buffer.from(b64.trim(), 'base64').toString('utf8');
                const repairedJson = rawJson.replace(/: "(.*?)"/gs, (match, p1) => {
                    return `: "${p1.replace(/\n/g, '\\n')}"`;
                });
                serviceAccount = JSON.parse(repairedJson);
                console.log('✅ Loaded Firebase Service Account from environment (with repair)');
            } catch (repairError) {
                console.warn('⚠️ Failed to parse FIREBASE_SERVICE_ACCOUNT from environment even after repair');
            }
        }
    }

    // Fallback to local file if env is missing or invalid
    if (!serviceAccount) {
        try {
            // Check multiple possible locations for the JSON file
            const possiblePaths = [
                path.join(process.cwd(), 'firebase-service-account.json'),
                path.join(process.cwd(), 'backend', 'firebase-service-account.json'),
                path.join(process.cwd(), 'app', 'backend', 'firebase-service-account.json'), // Common on Heroku/Docker
                path.join(__dirname, '..', '..', 'firebase-service-account.json'),
                path.join(__dirname, '..', '..', '..', 'firebase-service-account.json'),
                '/app/backend/firebase-service-account.json', // Heroku absolute path
                '/app/firebase-service-account.json'
            ];

            console.log('Searching for Firebase service account file in paths:', possiblePaths.length);

            for (const filePath of possiblePaths) {
                if (fs.existsSync(filePath)) {
                    serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    console.log(`✅ Loaded Firebase Service Account from local file: ${filePath}`);
                    break;
                } else {
                    // console.debug(`Path not found: ${filePath}`);
                }
            }
        } catch (fileError) {
            console.error('❌ Failed to load service account file:', fileError);
        }
    }

    if (serviceAccount) {
        if (!admin.apps.length) {
            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('✅ Firebase Admin initialized successfully (Project:', serviceAccount.project_id, ')');
        } else {
            firebaseApp = admin.app();
            console.log('✅ Firebase Admin already initialized');
        }
    } else {
        console.warn('⚠️ No Firebase Service Account found. Firebase features will be limited.');
    }
} catch (error) {
    console.error('❌ CRITICAL: Error initializing Firebase Admin SDK:', error);
}

export const adminAuth: admin.auth.Auth | null = (typeof firebaseApp! !== 'undefined' && firebaseApp!) ? firebaseApp.auth() : null;
export const db: admin.firestore.Firestore | null = (typeof firebaseApp! !== 'undefined' && firebaseApp!) ? firebaseApp.firestore() : null;
export default firebaseApp!;
