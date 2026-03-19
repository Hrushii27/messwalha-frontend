const Owner = require('../models/owner');
const Subscription = require('../models/subscription');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendResetPasswordEmail, sendOTPEmail } = require('../utils/emailService');
const Otp = require('../models/otp');
const { body, validationResult } = require('express-validator');
const { verifyRecaptcha } = require('../utils/securityUtils');
const { logSecurityEvent } = require('../middleware/activityLogger');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authController = {
    register: async (req, res) => {
        const { name, email, phone, password, role, recaptchaToken } = req.body;
        
        // 1. Check for Validation Errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 'ERROR', errors: errors.array() });
        }

        // 2. Verify reCAPTCHA
        const isHuman = await verifyRecaptcha(recaptchaToken);
        if (!isHuman && process.env.NODE_ENV === 'production') {
            return res.status(403).json({ status: 'ERROR', message: 'reCAPTCHA verification failed' });
        }

        console.log(`📝 Attempting registration for: ${email}, role: ${role || 'STUDENT'}`);
        try {
            // Check if user exists
            const existingOwner = await Owner.findByEmail(email);
            if (existingOwner) {
                console.warn(`⚠️ Registration failed: User ${email} already exists`);
                return res.status(400).json({ message: 'User already exists' });
            }

            const userRole = role || 'STUDENT';

            // Hash the password correctly
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // Create user
            console.log('🔨 Creating database entry...');
            const owner = await Owner.create(name, email, phone, passwordHash, userRole);
            console.log(`✅ User created with ID: ${owner.id}`);

            // Automatically assign 90-day trial only for OWNERS
            if (userRole === 'OWNER') {
                console.log('🎁 Creating 90-day trial subscription...');
                await Subscription.createTrial(owner.id);
            }

            const token = jwt.sign({ id: owner.id, role: userRole }, process.env.JWT_SECRET, { expiresIn: '1d' });
            res.status(201).json({
                message: userRole === 'OWNER' ? 'Owner registered and 90-day trial started' : 'User registered successfully',
                token,
                owner
            });
        } catch (err) {
            console.error('❌ Registration Error:', err);
            res.status(500).json({ message: `Server error during registration: ${err.message}` });
        }
    },
    ownerRegister: async (req, res) => {
        const { 
            name, email, phone, password, 
            messName, location, city, monthlyPrice,
            recaptchaToken 
        } = req.body;
        
        // 1. Verify reCAPTCHA (Basic check, extend validation as needed)
        const isHuman = await verifyRecaptcha(recaptchaToken);
        if (!isHuman && process.env.NODE_ENV === 'production') {
            return res.status(403).json({ status: 'ERROR', message: 'reCAPTCHA verification failed' });
        }

        console.log(`📝 Attempting OWNER registration for: ${email}`);
        try {
            // Check if user exists
            const existingOwner = await Owner.findByEmail(email);
            if (existingOwner) {
                console.warn(`⚠️ Registration failed: User ${email} already exists`);
                return res.status(400).json({ message: 'User already exists' });
            }

            // Hash the password
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // Create Owner user
            console.log('🔨 Creating owner entry...');
            const owner = await Owner.create(name, email, phone, passwordHash, 'OWNER');
            
            // Start 60-day Trial
            console.log('🎁 Creating 60-day trial subscription...');
            await Subscription.createTrial(owner.id);

            // Create Initial Mess Listing (Pending Status)
            const Mess = require('../models/mess'); // Lazy load to avoid circular deps if any
            console.log('🏠 Creating initial pending mess listing...');
            
            // Defaulting some fields until the owner fully fills them out in the dashboard
            await Mess.create(
                owner.id, 
                messName, 
                location, // using location as address
                monthlyPrice || 0, 
                'Newly registered mess. Details pending.', // description
                'Indian', // default cuisine
                city || 'Pune', 
                'Both', // veg_nonveg
                '' // college_tags
            );

            const token = jwt.sign({ id: owner.id, role: 'OWNER' }, process.env.JWT_SECRET, { expiresIn: '1d' });
            res.status(201).json({
                message: 'Owner registered, trial started, and mess listing created (pending approval).',
                token,
                owner
            });
        } catch (err) {
            console.error('❌ Owner Registration Error:', err);
            res.status(500).json({ message: `Server error during owner registration: ${err.message}` });
        }
    },
    login: async (req, res) => {
        const { email, password, recaptchaToken } = req.body;

        // 1. Check for Validation Errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 'ERROR', errors: errors.array() });
        }

        // 2. Verify reCAPTCHA
        const isHuman = await verifyRecaptcha(recaptchaToken);
        if (!isHuman && process.env.NODE_ENV === 'production') {
            return res.status(403).json({ status: 'ERROR', message: 'reCAPTCHA verification failed' });
        }

        console.log(`🔑 Login attempt for: ${email}`);
        try {
            const owner = await Owner.findByEmail(email);
            if (!owner) {
                console.warn(`❌ Login failed: No user found with email ${email}`);
                return res.status(400).json({ message: 'Invalid credentials - no user' });
            }

            console.log('🔍 User found, verifying password...');
            const isPasswordValid = await bcrypt.compare(password, owner.password_hash);
            if (!isPasswordValid) {
                console.warn('❌ Login failed: Incorrect password');
                logSecurityEvent('AUTH_FAILURE', { email, reason: 'WRONG_PASSWORD', ip: req.ip });
                return res.status(400).json({ message: 'Invalid credentials - password' });
            }

            console.log('✅ Password verified, generating token...');
            const token = jwt.sign({ id: owner.id, role: owner.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
            res.json({ token, owner });
        } catch (err) {
            console.error('❌ Login Error:', err);
            res.status(500).json({ message: `Server error during login: ${err.message}` });
        }
    },
    forgotPassword: async (req, res) => {
        const { email } = req.body;
        console.log(`📧 Forgot password requested for: ${email}`);
        try {
            const owner = await Owner.findByEmail(email);
            if (!owner) {
                console.warn(`⚠️ Forgot password failed: No user found with email ${email}`);
                return res.status(404).json({ message: 'No user found with that email address' });
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetExpires = new Date();
            resetExpires.setHours(resetExpires.getHours() + 1);

            await Owner.updateResetToken(email, resetToken, resetExpires);
            await sendResetPasswordEmail(email, resetToken);

            res.status(200).json({ success: true, message: 'Password reset email sent' });
        } catch (err) {
            console.error('❌ Forgot Password Error:', err);
            res.status(500).json({ message: 'Server error' });
        }
    },
    resetPassword: async (req, res) => {
        const { token, password } = req.body;
        console.log(`🔄 Resetting password with token: ${token.substring(0, 10)}...`);
        try {
            const owner = await Owner.findByResetToken(token);
            if (!owner) {
                console.warn(`⚠️ Reset password failed: Token invalid or expired`);
                return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
            }

            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            await Owner.updatePassword(owner.id, passwordHash);
            console.log(`✅ Password reset successful for user ID: ${owner.id}`);

            res.status(200).json({ success: true, message: 'Password has been reset' });
        } catch (err) {
            console.error('❌ Reset Password Error:', err);
            res.status(500).json({ message: 'Server error' });
        }
    },
    sendOTP: async (req, res) => {
        const { email } = req.body;
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        try {
            await Otp.create(email, otpCode);
            await sendOTPEmail(email, otpCode);
            res.json({ success: true, message: 'OTP sent successfully' });
        } catch (err) {
            console.error('❌ Send OTP Error:', err);
            res.status(500).json({ message: 'Failed to send OTP' });
        }
    },
    verifyOTP: async (req, res) => {
        const { email, otp } = req.body;
        console.log(`[DEBUG] Verifying OTP for ${email}. Entered code: ${otp}`);

        try {
            const record = await Otp.verify(email, otp);
            if (!record) {
                console.warn(`[DEBUG] OTP verification failed for ${email}. Record not found or expired.`);
                await Otp.incrementAttempts(email);
                return res.status(400).json({ message: 'Invalid or expired OTP' });
            }

            console.log(`[DEBUG] OTP verified for ${email}. Stored record:`, record);

            let user = await Owner.findByEmail(email);
            if (!user) {
                console.log(`[DEBUG] Auto-registering new user via OTP: ${email}`);
                // Auto-register as Student if not exists
                user = await Owner.create(email.split('@')[0], email, '', 'OTP_AUTH_NO_PASSWORD', 'STUDENT');
            }

            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
            res.json({ token, owner: user });
        } catch (err) {
            console.error('❌ Verify OTP Error:', err);
            res.status(500).json({ message: 'OTP verification failed' });
        }
    },
    googleLogin: async (req, res) => {
        const { token } = req.body;
        console.log('🌐 Google login attempt...');

        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            const payload = ticket.getPayload();
            const { sub: googleId, email, name, picture } = payload;

            console.log(`✅ Google token verified for: ${email}`);

            let user = await Owner.findByGoogleId(googleId);
            
            if (!user) {
                console.log(`🔍 User with Google ID ${googleId} not found. Checking by email...`);
                user = await Owner.findByEmail(email);
                
                if (user) {
                    console.log(`🔗 Linking existing user ${email} with Google ID`);
                    await Owner.updateProfile(user.id, { google_id: googleId, profile_picture: picture });
                } else {
                    console.log(`🆕 Creating new user via Google: ${email}`);
                    // Use a random placeholder for password since it's NOT NULL in DB
                    const randomPassword = crypto.randomBytes(16).toString('hex');
                    const passwordHash = await bcrypt.hash(randomPassword, 10);
                    user = await Owner.create(name, email, '', passwordHash, 'STUDENT');
                    await Owner.updateProfile(user.id, { google_id: googleId, profile_picture: picture });
                }
            }

            const jwtToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
            res.json({ token: jwtToken, owner: user });
        } catch (err) {
            console.error('❌ Google Login Error:', err);
            res.status(401).json({ message: 'Google authentication failed' });
        }
    }
};

module.exports = authController;
