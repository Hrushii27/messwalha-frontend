const axios = require('axios');

async function testSubscribersApi() {
    const url = 'http://localhost:5000/api/subscriptions/subscribers';
    console.log(`Testing GET ${url}...`);
    try {
        const response = await axios.get(url);
        console.log('Response:', response.status, response.data);
    } catch (error) {
        if (error.response) {
            console.log('Error Response:', error.response.status, error.response.data);
            if (error.response.status === 401) {
                console.log('✅ TEST PASSED: Received 401 Unauthorized as expected.');
            } else {
                console.log(`❌ TEST FAILED: Received ${error.response.status} instead of 401.`);
            }
        } else {
            console.error('❌ Network Error:', error.message);
        }
    }
}

testSubscribersApi();
