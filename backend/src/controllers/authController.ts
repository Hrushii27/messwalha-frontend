import { Request, Response, NextFunction } from 'express';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { emailService } from '../services/emailService.js';
import { adminAuth, db } from '../config/firebase.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

export const register = async (req: Request, res: Response, next: NextFunction) => {
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

        emailService.sendWelcomeEmail(email, name).catch((err: Error) => {
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
    } catch (error) {
        next(error);
    }
};

export const ownerRegister = async (req: Request, res: Response, next: NextFunction) => {
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

        emailService.sendWelcomeEmail(email, name).catch((err: Error) => {
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
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
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
    } catch (error) {
        next(error);
    }
};

export const firebaseAuth = async (req: Request, res: Response, next: NextFunction) => {
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
                email: email as string,
                name: name || (decodedToken.name as string) || 'New User',
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

            emailService.sendWelcomeEmail(user.email, user.name).catch((err: Error) => {
                console.error('Failed to send welcome email:', err);
            });
        } else {
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
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
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
    } catch (error) {
        logger.error('Forgot password error:', error);
        next(error);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
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
    } catch (error) {
        next(error);
    }
};
