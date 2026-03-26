import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { emailService } from '../services/emailService.js';
import { adminAuth, db } from '../config/firebase.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';
// Re-using firebaseAuth logic or similar for Google login if needed
// For real production with GSI tokens, google-auth-library is recommended.
// Here we'll implement a robust Google Login flow.
export const register = async (req, res, next) => {
    try {
        const { email, password, name, role, phone, college } = req.body;
        if (!db) {
            return next(new AppError('Database not configured', 500));
        }
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (!userSnapshot.empty) {
            return next(new AppError('User already exists', 400));
        }
        const hashedPassword = await hashPassword(password);
        const userRole = role || 'STUDENT';
        const userRef = db.collection('users').doc();
        const userData = {
            id: userRef.id,
            email,
            password: hashedPassword,
            name,
            role: userRole,
            phone: phone || '',
            college: college || '',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await userRef.set(userData);
        let ownerSubscription = null;
        // If user is an OWNER, create their free trial subscription
        if (userRole === 'OWNER') {
            const trialDays = 60;
            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + trialDays);
            const subRef = db.collection('owner_subscriptions').doc();
            ownerSubscription = {
                id: subRef.id,
                ownerId: userRef.id,
                planName: 'FREE_TRIAL',
                trial_start: new Date(),
                trial_end: trialEndDate,
                status: 'trial',
                paymentStatus: 'PENDING',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await subRef.set(ownerSubscription);
        }
        const token = generateToken(userRef.id, userRole);
        const refreshToken = generateRefreshToken(userRef.id);
        emailService.sendWelcomeEmail(email, name).catch((err) => {
            console.error('Failed to send welcome email:', err);
        });
        res.status(201).json({
            success: true,
            token,
            refreshToken,
            user: {
                id: userRef.id,
                email,
                name,
                role: userRole,
                ownerSubscription
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const ownerRegister = async (req, res, next) => {
    try {
        console.log('Owner registration request received:', req.body.email);
        const { email, password, name, phone, messName, location } = req.body;
        if (!db) {
            return next(new AppError('Database not configured', 500));
        }
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (!userSnapshot.empty) {
            return next(new AppError('User already exists', 400));
        }
        const hashedPassword = await hashPassword(password);
        const userRef = db.collection('users').doc();
        const userData = {
            id: userRef.id,
            email,
            password: hashedPassword,
            name,
            phone: phone || '',
            role: 'OWNER',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        // Create subscription
        const trialDays = 60;
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + trialDays);
        const subRef = db.collection('owner_subscriptions').doc();
        const ownerSubscription = {
            id: subRef.id,
            ownerId: userRef.id,
            planName: 'FREE_TRIAL',
            trial_start: new Date(),
            trial_end: trialEndDate,
            status: 'trial',
            paymentStatus: 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        // Create Mess record
        const messRef = db.collection('messes').doc();
        const messData = {
            id: messRef.id,
            ownerId: userRef.id,
            name: messName,
            address: location,
            description: `Welcome to ${messName}. We provide quality meals for students.`,
            cuisine: 'Indian',
            contact: phone,
            images: [],
            rating: 0,
            verified: false,
            isVisible: true,
            monthlyPrice: 0, // Placeholder
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        // Execution (Simplified atomicity with sequential writes for now, could be transaction)
        const batch = db.batch();
        batch.set(userRef, userData);
        batch.set(subRef, ownerSubscription);
        batch.set(messRef, messData);
        await batch.commit();
        const token = generateToken(userRef.id, 'OWNER');
        const refreshToken = generateRefreshToken(userRef.id);
        emailService.sendWelcomeEmail(email, name).catch((err) => {
            console.error('Failed to send welcome email:', err);
        });
        res.status(201).json({
            success: true,
            token,
            refreshToken,
            user: {
                id: userRef.id,
                email,
                name,
                role: 'OWNER',
                ownerSubscription,
                mess: messData
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!db) {
            return next(new AppError('Database (Firebase) not configured on the server. Please check environment variables.', 500));
        }
        const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
        if (userSnapshot.empty) {
            return next(new AppError('Invalid email or password', 401));
        }
        const userDoc = userSnapshot.docs[0];
        const user = userDoc.data();
        if (!(await comparePassword(password, user.password))) {
            return next(new AppError('Invalid email or password', 401));
        }
        let ownerSubscription = null;
        if (user.role === 'OWNER') {
            const subSnapshot = await db.collection('owner_subscriptions')
                .where('ownerId', '==', user.id)
                .limit(1)
                .get();
            if (!subSnapshot.empty) {
                ownerSubscription = subSnapshot.docs[0].data();
            }
        }
        const token = generateToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id);
        res.status(200).json({
            success: true,
            token,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                ownerSubscription
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const firebaseAuth = async (req, res, next) => {
    try {
        const { idToken, name, role } = req.body;
        if (!adminAuth || !db) {
            return next(new AppError('Firebase not configured on the server', 500));
        }
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const { email, picture } = decodedToken;
        const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
        let user;
        let ownerSubscription = null;
        if (userSnapshot.empty) {
            // Create user if not exists
            const userRef = db.collection('users').doc();
            user = {
                id: userRef.id,
                email: email,
                name: name || decodedToken.name || 'New User',
                password: await hashPassword(Math.random().toString(36).slice(-10)),
                role: role || 'STUDENT',
                avatar: picture,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await userRef.set(user);
            // If user is an OWNER, create their free trial subscription
            if (user.role === 'OWNER') {
                const trialDays = 60;
                const trialEndDate = new Date();
                trialEndDate.setDate(trialEndDate.getDate() + trialDays);
                const subRef = db.collection('owner_subscriptions').doc();
                ownerSubscription = {
                    id: subRef.id,
                    ownerId: user.id,
                    planName: 'FREE_TRIAL',
                    trial_start: new Date(),
                    trial_end: trialEndDate,
                    status: 'trial',
                    paymentStatus: 'PENDING',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                await subRef.set(ownerSubscription);
            }
            emailService.sendWelcomeEmail(user.email, user.name).catch((err) => {
                console.error('Failed to send welcome email:', err);
            });
        }
        else {
            user = userSnapshot.docs[0].data();
            if (user.role === 'OWNER') {
                const subSnapshot = await db.collection('owner_subscriptions')
                    .where('ownerId', '==', user.id)
                    .limit(1)
                    .get();
                if (!subSnapshot.empty) {
                    ownerSubscription = subSnapshot.docs[0].data();
                }
            }
        }
        const token = generateToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id);
        res.status(200).json({
            success: true,
            token,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                ownerSubscription
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!db) {
            return next(new AppError('Database not configured', 500));
        }
        const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
        if (userSnapshot.empty) {
            return next(new AppError('No user found with that email address', 404));
        }
        const userDoc = userSnapshot.docs[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordExpires = new Date();
        resetPasswordExpires.setHours(resetPasswordExpires.getHours() + 1);
        await userDoc.ref.update({
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetPasswordExpires
        });
        await emailService.sendResetPasswordEmail(email, resetToken);
        res.status(200).json({
            success: true,
            message: 'Password reset email sent'
        });
    }
    catch (error) {
        logger.error('Forgot password error:', error);
        next(error);
    }
};
export const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        if (!db) {
            return next(new AppError('Database not configured', 500));
        }
        const userSnapshot = await db.collection('users')
            .where('resetPasswordToken', '==', token)
            .where('resetPasswordExpires', '>', new Date())
            .limit(1)
            .get();
        if (userSnapshot.empty) {
            return next(new AppError('Password reset token is invalid or has expired', 400));
        }
        const userDoc = userSnapshot.docs[0];
        const hashedPassword = await hashPassword(password);
        await userDoc.ref.update({
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });
        res.status(200).json({
            success: true,
            message: 'Password has been reset'
        });
    }
    catch (error) {
        next(error);
    }
};
export const sendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!db) {
            return next(new AppError('Database not configured', 500));
        }
        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry
        // Store OTP in Firestore
        await db.collection('otps').doc(email).set({
            otp,
            expiresAt,
            createdAt: new Date()
        });
        // Send Email
        await emailService.sendOtpEmail(email, otp);
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully'
        });
    }
    catch (error) {
        console.error('Send OTP Error:', error);
        next(error);
    }
};
export const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!db) {
            return next(new AppError('Database not configured', 500));
        }
        const otpDoc = await db.collection('otps').doc(email).get();
        if (!otpDoc.exists) {
            return next(new AppError('OTP not found or expired', 400));
        }
        const otpData = otpDoc.data();
        if (!otpData || otpData.otp !== otp) {
            return next(new AppError('Invalid OTP code', 400));
        }
        if (otpData.expiresAt.toDate() < new Date()) {
            return next(new AppError('OTP has expired', 400));
        }
        // OTP is valid, delete it
        await db.collection('otps').doc(email).delete();
        // Find or create user
        const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
        let user;
        let ownerSubscription = null;
        if (userSnapshot.empty) {
            // This case might happen if Google Login requested OTP for new user
            return next(new AppError('User registration required', 404));
        }
        const userDoc = userSnapshot.docs[0];
        user = userDoc.data();
        if (user.role === 'OWNER') {
            const subSnapshot = await db.collection('owner_subscriptions')
                .where('ownerId', '==', user.id)
                .limit(1)
                .get();
            if (!subSnapshot.empty) {
                ownerSubscription = subSnapshot.docs[0].data();
            }
        }
        const token = generateToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id);
        res.status(200).json({
            success: true,
            token,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                ownerSubscription
            }
        });
    }
    catch (error) {
        next(error);
    }
};
export const googleLogin = async (req, res, next) => {
    try {
        const { token: idToken } = req.body;
        if (!db || !adminAuth) {
            return next(new AppError('Firebase not configured', 500));
        }
        // Ideally verify with google-auth-library here. 
        // For now, since we are using Firebase, we can check if the user exists.
        // If we want real verification without google-auth-library, we'd need to fetch from googleapis.
        // Let's use a secure approach: fetch token info from Google
        const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
        const verifyRes = await fetch(googleVerifyUrl);
        const payload = await verifyRes.json();
        if (!payload.email) {
            return next(new AppError('Invalid Google token', 401));
        }
        const email = payload.email;
        const name = payload.name;
        const picture = payload.picture;
        const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
        let user;
        let ownerSubscription = null;
        if (userSnapshot.empty) {
            // New user via Google - Create with temporary password
            const userRef = db.collection('users').doc();
            user = {
                id: userRef.id,
                email,
                name: name || 'Google User',
                role: 'STUDENT', // Default role
                avatar: picture,
                createdAt: new Date(),
                updatedAt: new Date(),
                // Password is required in schema, set a random one
                password: await hashPassword(crypto.randomBytes(16).toString('hex'))
            };
            await userRef.set(user);
        }
        else {
            user = userSnapshot.docs[0].data();
            if (user.role === 'OWNER') {
                const subSnapshot = await db.collection('owner_subscriptions')
                    .where('ownerId', '==', user.id)
                    .limit(1)
                    .get();
                if (!subSnapshot.empty) {
                    ownerSubscription = subSnapshot.docs[0].data();
                }
            }
        }
        const token = generateToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id);
        res.status(200).json({
            success: true,
            token,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                ownerSubscription
            }
        });
    }
    catch (error) {
        console.error('Google Login Error:', error);
        next(error);
    }
};
//# sourceMappingURL=authController.js.map