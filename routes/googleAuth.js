const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const Owner = require('../models/owner');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { name, email, picture, sub: googleId } = ticket.getPayload();

        let user = await Owner.findByGoogleId(googleId);

        if (!user) {
            // Check if user exists by email first (to link accounts)
            user = await Owner.findByEmail(email);
            if (user) {
                // Link account
                user = await Owner.updateProfile(user.id, { google_id: googleId, profile_picture: picture });
            } else {
                // Create new user (Student by default)
                user = await Owner.create(name, email, '', 'GOOGLE_AUTH_NO_PASSWORD', 'STUDENT');
                user = await Owner.updateProfile(user.id, { google_id: googleId, profile_picture: picture });
            }
        }

        // Generate and send OTP for 2-step verification
        const Otp = require('../models/otp');
        const { sendOTPEmail } = require('../utils/emailService');
        
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.create(email, otpCode);
        await sendOTPEmail(email, otpCode);

        // Do not issue JWT yet. Instruct frontend to ask for OTP.
        res.json({
            requireOtp: true,
            email: email,
            message: 'Google verified. Please check your email for the OTP to complete login.'
        });

    } catch (err) {
        console.error('❌ Google Auth Error:', err);
        res.status(401).json({ message: 'Google Authentication failed' });
    }
});

module.exports = router;
