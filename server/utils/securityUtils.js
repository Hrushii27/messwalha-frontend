const axios = require('axios');

/**
 * Verifies a Google reCAPTCHA v3 token
 * @param {string} token - The token from the frontend
 * @returns {Promise<boolean>} - True if verified as human
 */
const verifyRecaptcha = async (token) => {
    // Skip verification if secret key is missing (e.g. dynamic dev environments)
    if (!process.env.RECAPTCHA_SECRET) {
        console.warn('⚠️ RECAPTCHA_SECRET is missing. Skipping verification.');
        return true; 
    }
    
    if (!token) return false;

    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${token}`
        );
        
        return response.data.success;
    } catch (err) {
        console.error('reCAPTCHA Verification Error:', err.message);
        return false;
    }
};

module.exports = {
    verifyRecaptcha
};
