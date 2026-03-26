const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    console.log('🧪 Starting backend verification test...');

    try {
        // 1. Health check
        const health = await axios.get(`${API_URL}/health`);
        console.log('✅ Backend Health:', health.data.status);

        // 2. Fetch all messes to get a valid messId
        const messesRes = await axios.get(`${API_URL}/messes`);
        const messes = messesRes.data.data;
        if (messes.length === 0) {
            console.log('⚠ No messes found to test with.');
            return;
        }

        const testMessId = messes[0].id;
        console.log(`📡 Using Mess ID: ${testMessId} for tests`);

        // 3. Test GET Reviews
        const reviewsRes = await axios.get(`${API_URL}/reviews/${testMessId}`);
        console.log('✅ GET /api/reviews/:id:', reviewsRes.data.success ? 'Success' : 'Failed');
        console.log(`📝 Found ${reviewsRes.data.data.length} reviews`);

        // 4. Test GET Notifications
        const notifRes = await axios.get(`${API_URL}/notifications/${testMessId}`);
        console.log('✅ GET /api/notifications/:id:', notifRes.data.success ? 'Success' : 'Failed');
        console.log(`📢 Found ${notifRes.data.data.length} notifications`);

        console.log('🏁 Verification complete! (Mock auth required for POST tests)');
    } catch (err) {
        console.error('❌ Verification failed:', err.message);
        if (err.response) {
            console.error('Response data:', err.response.data);
        }
    }
};

runTest();
