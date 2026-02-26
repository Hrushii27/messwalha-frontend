import type { Request, Response, NextFunction } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../config/environment.js';
import type { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { emailService } from '../services/emailService.js';
import { db } from '../config/firebase.js';

const razorpay = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID!,
    key_secret: config.RAZORPAY_KEY_SECRET!,
});

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const { messId, planType, amount } = req.body;

        // Development Bypass
        const isMockEnabled = config.NODE_ENV !== 'production' && (config.RAZORPAY_KEY_ID === 'rzp_test_dummy_id' || !config.RAZORPAY_KEY_ID);

        if (isMockEnabled) {
            const mockOrderId = `mock_order_${Date.now()}`;

            const paymentRef = db.collection('payments').doc();
            await paymentRef.set({
                id: paymentRef.id,
                userId: req.user!.id,
                messId,
                amount: parseFloat(amount),
                transactionId: mockOrderId,
                status: 'PENDING',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            return res.status(200).json({
                success: true,
                orderId: mockOrderId,
                amount: amount * 100,
                currency: 'INR',
                isTestMode: true
            });
        }

        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        const paymentRef = db.collection('payments').doc();
        await paymentRef.set({
            id: paymentRef.id,
            userId: req.user!.id,
            messId,
            amount: parseFloat(amount),
            transactionId: order.id,
            status: 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: options.amount,
            currency: options.currency,
        });
    } catch (error) {
        next(error);
    }
};

export const createOwnerOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const amount = 599;

        // Development Bypass
        const isMockEnabled = config.NODE_ENV !== 'production' && (config.RAZORPAY_KEY_ID === 'rzp_test_dummy_id' || !config.RAZORPAY_KEY_ID);

        if (isMockEnabled) {
            const mockOrderId = `mock_owner_order_${Date.now()}`;

            const paymentRef = db.collection('payments').doc();
            await paymentRef.set({
                id: paymentRef.id,
                userId: req.user!.id,
                messId: null,
                amount: parseFloat(amount.toString()),
                transactionId: mockOrderId,
                status: 'PENDING',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            return res.status(200).json({
                success: true,
                orderId: mockOrderId,
                amount: amount * 100,
                currency: 'INR',
                isTestMode: true
            });
        }

        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: `owner_rcpt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        const paymentRef = db.collection('payments').doc();
        await paymentRef.set({
            id: paymentRef.id,
            userId: req.user!.id,
            messId: null,
            amount: parseFloat(amount.toString()),
            transactionId: order.id,
            status: 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: options.amount,
            currency: options.currency,
        });
    } catch (error) {
        next(error);
    }
};

export const verifyPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, messId, planType } = req.body;

        const isMockOrder = razorpay_order_id?.startsWith('mock_order_');

        if (!isMockOrder) {
            const body = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', config.RAZORPAY_KEY_SECRET!)
                .update(body.toString())
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                return next(new AppError('Invalid payment signature', 400));
            }
        }

        await db.runTransaction(async (transaction) => {
            const paymentSnapshot = await db!.collection('payments')
                .where('transactionId', '==', razorpay_order_id)
                .limit(1)
                .get();

            if (paymentSnapshot.empty) {
                throw new AppError('Payment record not found', 404);
            }

            const paymentDoc = paymentSnapshot.docs[0];
            transaction.update(paymentDoc.ref, { status: 'SUCCESS', updatedAt: new Date() });

            const subRef = db!.collection('subscriptions').doc();
            transaction.set(subRef, {
                id: subRef.id,
                userId: req.user!.id,
                messId,
                planType,
                startDate: new Date(),
                endDate: calculateEndDate(planType),
                status: 'ACTIVE',
                paymentId: razorpay_payment_id || razorpay_order_id,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        });

        // Email Notification
        try {
            const [userDoc, messDoc] = await Promise.all([
                db.collection('users').doc(req.user!.id).get(),
                db.collection('messes').doc(messId).get()
            ]);

            if (userDoc.exists && messDoc.exists) {
                const user = userDoc.data()!;
                const mess = messDoc.data()!;
                const endDate = calculateEndDate(planType).toISOString();
                emailService.sendSubscriptionNotice(user.email, mess.name, endDate).catch((err: Error) => {
                    console.error('Failed to send subscription notice email:', err);
                });
            }
        } catch (emailError) {
            console.error('Error preparing subscription email:', emailError);
        }

        res.status(200).json({ success: true, message: 'Payment verified and subscription created' });
    } catch (error) {
        next(error);
    }
};

export const verifyOwnerPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const isMockOrder = razorpay_order_id?.startsWith('mock_owner_order_');

        if (!isMockOrder) {
            const body = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', config.RAZORPAY_KEY_SECRET!)
                .update(body.toString())
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                return next(new AppError('Invalid payment signature', 400));
            }
        }

        const nextBillingDate = new Date();
        nextBillingDate.setDate(nextBillingDate.getDate() + 30);

        await db.runTransaction(async (transaction) => {
            const subSnapshot = await db!.collection('owner_subscriptions')
                .where('ownerId', '==', req.user!.id)
                .limit(1)
                .get();

            if (subSnapshot.empty) {
                throw new AppError('Owner subscription record not found', 404);
            }

            const paymentSnapshot = await db!.collection('payments')
                .where('transactionId', '==', razorpay_order_id)
                .limit(1)
                .get();

            if (paymentSnapshot.empty) {
                throw new AppError('Payment record not found', 404);
            }

            transaction.update(subSnapshot.docs[0].ref, {
                status: 'ACTIVE',
                planName: 'BASIC_599',
                paymentStatus: 'PAID',
                nextBillingDate: nextBillingDate,
                updatedAt: new Date()
            });

            transaction.update(paymentSnapshot.docs[0].ref, {
                status: 'SUCCESS',
                transactionId: razorpay_payment_id || razorpay_order_id,
                updatedAt: new Date()
            });
        });

        // Email Notification
        try {
            const userDoc = await db.collection('users').doc(req.user!.id).get();
            if (userDoc.exists) {
                const user = userDoc.data()!;
                const subject = 'Your MessWalha Owner Account is now Professional! 🚀';
                const html = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #f97316;">Professional Upgrade Confirmed</h2>
                        <p>Hi <strong>${user.name}</strong>,</p>
                        <p>Your owner account has been successfully upgraded to the <strong>Professional Plan</strong> (₹599/month).</p>
                        <p>You now have access to:</p>
                        <ul>
                            <li>Advanced Analytics</li>
                            <li>Customer Support Tools</li>
                            <li>Platform Fee Savings</li>
                        </ul>
                        <div style="margin: 20px 0;">
                            <a href="${config.FRONTEND_URL}/owner/dashboard" style="background: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Owner Dashboard</a>
                        </div>
                    </div>
                `;
                emailService.sendMail(user.email, subject, html).catch((err: Error) => {
                    console.error('Failed to send owner upgrade email:', err);
                });
            }
        } catch (emailError) {
            console.error('Error preparing owner upgrade email:', emailError);
        }

        res.status(200).json({ success: true, message: 'Owner account upgraded to Professional' });
    } catch (error) {
        next(error);
    }
};

export const getMyPayments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const snapshot = await db.collection('payments')
            .where('userId', '==', req.user!.id)
            .where('status', '==', 'SUCCESS')
            .orderBy('createdAt', 'desc')
            .get();

        const payments = snapshot.docs.map(doc => doc.data());

        res.status(200).json({ success: true, data: payments });
    } catch (error) {
        next(error);
    }
};

const calculateEndDate = (planType: string) => {
    const date = new Date();
    if (planType === 'MONTHLY') date.setMonth(date.getMonth() + 1);
    else if (planType === 'QUARTERLY') date.setMonth(date.getMonth() + 3);
    else if (planType === 'YEARLY') date.setFullYear(date.getFullYear() + 1);
    else if (planType === 'WEEKLY') date.setDate(date.getDate() + 7);
    else if (planType === 'DAILY') date.setDate(date.getDate() + 1);
    return date;
};
