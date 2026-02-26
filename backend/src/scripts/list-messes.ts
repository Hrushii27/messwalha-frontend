import dotenv from 'dotenv';
dotenv.config();
import { db } from '../config/firebase.js';

const list = async () => {
    try {
        if (!db) process.exit(1);
        const snapshot = await db.collection('messes').get();
        console.log(`TOTAL: ${snapshot.size}`);
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`${data.name} | ${data.cuisine}`);
        });
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
};
list();
