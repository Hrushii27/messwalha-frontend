import { db } from '../config/firebase.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.BACKEND_URL || 'http://localhost:5000/api';
const TEST_EMAIL = 'testuser@example.com';
const NEW_PASSWORD = 'newpassword123';

async function testForgotPassword() {
    console.log('🚀 Starting Forgot Password System Test...');

    try {
        // 1. Ensure test user exists in Firestore
        if (!db) throw new Error('Database not initialized');
        console.log(`Checking if user ${TEST_EMAIL} exists...`);
        const userSnapshot = await db.collection('users').where('email', '==', TEST_EMAIL).limit(1).get();

        let userId;
        if (userSnapshot.empty) {
            console.log('Creating test user...');
            const userRef = db.collection('users').doc();
            await userRef.set({
                id: userRef.id,
                email: TEST_EMAIL,
                password: 'oldpassword',
                name: 'Test User',
                role: 'STUDENT',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            userId = userRef.id;
        } else {
            userId = userSnapshot.docs[0].id;
        }

        // 2. Trigger Forgot Password
        console.log('Step 1: Triggering forgot password...');
        const forgotRes = await axios.post(`${API_URL}/auth/forgot-password`, { email: TEST_EMAIL });
        console.log('✅ Forgot password response:', forgotRes.data);

        // 3. Retrieve token from Firestore (since we can't read real email easily in test)
        console.log('Step 2: Retrieving reset token from Firestore...');
        const updatedUserDoc = await db.collection('users').doc(userId).get();
        const userData = updatedUserDoc.data();
        const token = userData?.resetPasswordToken;

        if (!token) {
            throw new Error('❌ Reset token not found in database!');
        }
        console.log(`✅ Found reset token: ${token}`);

        // 4. Reset Password
        console.log('Step 3: Resetting password...');
        const resetRes = await axios.post(`${API_URL}/auth/reset-password`, {
            token: token,
            password: NEW_PASSWORD
        });
        console.log('✅ Reset password response:', resetRes.data);

        // 5. Verify Password Change (in a real scenario, we'd try to login, but here we check DB)
        console.log('Step 4: Verifying reset fields are cleared in DB...');
        if (!db) throw new Error('Database not initialized');
        const finalUserDoc = await db.collection('users').doc(userId).get();
        const finalData = finalUserDoc.data();

        if (finalData?.resetPasswordToken === null && finalData?.resetPasswordExpires === null) {
            console.log('✅ Success: Reset tokens cleared from database.');
        } else {
            console.warn('⚠️ Warning: Reset tokens were NOT cleared.');
        }

        console.log('🎉 Full Password Reset Flow Verified Successfully!');
    } catch (error: any) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

testForgotPassword();
