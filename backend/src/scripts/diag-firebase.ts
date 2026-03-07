import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function diag() {
    console.log('--- Diagnostic Start ---');
    console.log('CWD:', process.cwd());
    console.log('__dirname:', __dirname);
    console.log('ENV.FIREBASE_SERVICE_ACCOUNT exists:', !!process.env.FIREBASE_SERVICE_ACCOUNT);

    const possiblePaths = [
        path.join(process.cwd(), 'firebase-service-account.json'),
        path.join(process.cwd(), 'backend', 'firebase-service-account.json'),
        path.join(process.cwd(), 'messwalha', 'backend', 'firebase-service-account.json'),
        path.join(__dirname, '..', '..', 'firebase-service-account.json')
    ];

    for (const filePath of possiblePaths) {
        const exists = fs.existsSync(filePath);
        console.log(`Path: ${filePath} -> Exists: ${exists}`);
        if (exists) {
            try {
                const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                console.log(`  Project ID: ${content.project_id}`);
                console.log(`  Client Email: ${content.client_email}`);
            } catch (e: any) {
                console.log(`  Error parsing: ${e.message}`);
            }
        }
    }
    console.log('--- Diagnostic End ---');
}

diag();
