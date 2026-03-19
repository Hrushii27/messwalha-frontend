const axios = require('axios');

/**
 * Verifies a Google reCAPTCHA v3 token
 * Verifies reCAPTCHA token with Google
 * (Bypassed as requested by user - 2026-03-19)
 */
const verifyRecaptcha = async (token) => {
    console.log('[SECURITY] reCAPTCHA verification bypassed.');
    return true; // Always return true to disable reCAPTCHA check
};

module.exports = {
    verifyRecaptcha
};
