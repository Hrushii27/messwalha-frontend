import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const filePath = 'c:/Users/Admin/.gemini/antigravity/playground/sonic-pinwheel/messwalha/backend/firebase-service-account.json';
const json = fs.readFileSync(filePath, 'utf8');
const b64 = Buffer.from(json).toString('base64');

console.log(`Setting FIREBASE_SERVICE_ACCOUNT on Heroku (Base64 length: ${b64.length})...`);
try {
    const output = execSync(`heroku config:set FIREBASE_SERVICE_ACCOUNT=${b64} --app messwalha-api-pg`, { encoding: 'utf8' });
    console.log(output);
} catch (error: any) {
    console.error('Failed to set config var:', error.message);
    if (error.stdout) console.log('Stdout:', error.stdout);
    if (error.stderr) console.log('Stderr:', error.stderr);
}
