import { onRequest } from 'firebase-functions/v2/https';
import app from './app.js';

export const api = onRequest({
    memory: '256MiB',
    maxInstances: 10,
    cors: true,
    region: 'us-central1'
}, app);
