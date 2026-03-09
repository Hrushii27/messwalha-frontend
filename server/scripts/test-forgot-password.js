const axios = require('axios');
require('dotenv').config({ path: './server/.env' });

const API_URL = 'http://localhost:5000/api';
const TEST_EMAIL = 'hrushikeshjagtap143@gmail.com';

async function testForgotPassword() {
    console.log('🧪 Starting Forgot Password Test (PostgreSQL)...');

    try {
        // 1. Request forgot password
        console.log(`1. Requesting reset for ${TEST_EMAIL}...`);
        const forgotRes = await axios.post(`${API_URL}/auth/forgot-password`, { email: TEST_EMAIL });
        console.log('✅ Forgot password response:', forgotRes.data);

        // 2. Since we can't easily check the DB from here without importing the models, 
        // we'll assume it worked if we got success and check the logs.
        // In a real test, we would query the database here.

        console.log('\n⚠️ NOTE: To complete the test, you need a reset token from the database or logs.');
        console.log('Query: SELECT reset_password_token FROM mess_owners WHERE email = \'' + TEST_EMAIL + '\';');

    } catch (error) {
        console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
    }
}

testForgotPassword();
