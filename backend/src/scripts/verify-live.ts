import axios from 'axios';

const API_URL = 'https://messwalha-api-pg-360404ae0804.herokuapp.com/api';
const TEST_EMAIL = 'verify_live@example.com';

async function verifyLive() {
    console.log('🌐 Verifying Live API...');
    try {
        const res = await axios.post(`${API_URL}/auth/forgot-password`, { email: TEST_EMAIL });
        console.log('✅ Success! Response:', res.status, res.data);
    } catch (error: any) {
        console.error('❌ Failed! Error:', error.response?.status, error.response?.data || error.message);
    }
}

verifyLive();
