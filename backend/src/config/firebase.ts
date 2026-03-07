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

    // 1. Try local file first (most reliable on Heroku if committed)
    try {
        const possiblePaths = [
            path.join(process.cwd(), 'firebase-service-account.json'),
            path.join(process.cwd(), 'backend', 'firebase-service-account.json'),
            path.join(__dirname, '..', '..', 'firebase-service-account.json'),
            '/app/backend/firebase-service-account.json',
            '/app/firebase-service-account.json'
        ];

        for (const filePath of possiblePaths) {
            if (fs.existsSync(filePath)) {
                serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                console.log(`✅ Loaded Firebase Service Account from local file: ${filePath}`);
                break;
            }
        }
    } catch (fileError) {
        console.warn('⚠️ Error checking local service account files:', fileError);
    }

    // 2. Fallback to Environment Variable
    if (!serviceAccount && b64) {
        console.log(`DEBUG: FIREBASE_SERVICE_ACCOUNT found in ENV, length: ${b64.length}`);

        try {
            // Attempt to parse directly first
            serviceAccount = JSON.parse(b64);
            console.log('✅ Loaded Firebase Service Account from environment (Direct JSON)');
        } catch (jsonError: any) {
            console.warn('⚠️ Direct JSON parse failed, trying repair for private_key newlines...');
            try {
                // Heroku sometimes mangles newlines in JSON strings set via CLI
                const repaired = b64.replace(/\\n/g, '\n');
                serviceAccount = JSON.parse(repaired);
                console.log('✅ Loaded Firebase Service Account from environment (Repaired JSON)');
            } catch (repairError: any) {
                console.warn('⚠️ Repair failed, trying Base64 decode...');
                try {
                    const decoded = Buffer.from(b64.trim(), 'base64').toString('utf8');
                    serviceAccount = JSON.parse(decoded);
                    console.log('✅ Loaded Firebase Service Account from environment (Base64)');
                } catch (b64Error: any) {
                    console.error('❌ ALL Firebase parsing methods failed:', b64Error.message);
                }
            }
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
