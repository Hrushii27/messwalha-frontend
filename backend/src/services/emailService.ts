import nodemailer from 'nodemailer';
import { config } from '../config/environment.js';
import { logger } from '../utils/logger.js';

class EmailService {
    private transporter;

    constructor() {
        // Create a transporter using environment variables
        // If no SMTP settings are provided, it will use a mock/log-based approach for development
        if (config.EMAIL_HOST && config.EMAIL_USER && config.EMAIL_PASS) {
            this.transporter = nodemailer.createTransport({
                host: config.EMAIL_HOST,
                port: Number(config.EMAIL_PORT),
                secure: Number(config.EMAIL_PORT) === 465, // Use SSL for port 465
                auth: {
                    user: config.EMAIL_USER,
                    pass: config.EMAIL_PASS,
                },
            });
            logger.info('Email service initialized with real SMTP settings');
        } else {
            logger.warn('Email service: No SMTP settings found. Emails will be logged to console instead.');
            this.transporter = null;
        }
    }

    public async sendMail(to: string, subject: string, html: string) {
        if (!this.transporter) {
            logger.info(`📧 [MOCK EMAIL] To: ${to} | Subject: ${subject}`);
            logger.info(`Content: ${html}`);
            return true;
        }

        try {
            const info = await this.transporter.sendMail({
                from: `"MessWalha" <${config.EMAIL_USER}>`,
                to,
                subject,
                html,
            });
            logger.info(`Email sent: ${info.messageId}`);
            return true;
        } catch (error) {
            logger.error('Failed to send email:', error);
            return false;
        }
    }

    async sendWelcomeEmail(email: string, name: string) {
        const subject = 'Welcome to MessWalha! 🍱';
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="color: #f97316;">Welcome, ${name}!</h1>
                <p>We're excited to have you on MessWalha. Start discovering your next favorite food mess today!</p>
                <div style="margin: 20px 0;">
                    <a href="${config.FRONTEND_URL}" style="background: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                </div>
                <p>If you're a Mess Owner, don't forget to list your mess to start receiving subscriptions.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">You're receiving this because you signed up for MessWalha.</p>
            </div>
        `;
        return this.sendMail(email, subject, html);
    }

    async sendSubscriptionNotice(email: string, messName: string, endDate: string) {
        const subject = `Your subscription to ${messName} is active!`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #10b981;">Subscription Confirmed</h2>
                <p>Your subscription to <strong>${messName}</strong> has been successfully activated.</p>
                <p>Valid until: <strong>${new Date(endDate).toLocaleDateString()}</strong></p>
                <p>Enjoy your meals!</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">MessWalha - Digitalizing Local Messes</p>
            </div>
        `;
        return this.sendMail(email, subject, html);
    }

    async sendExpiryAlert(email: string, messName: string, daysLeft: number) {
        const subject = `Notice: Subscription to ${messName} expires in ${daysLeft} days`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #ef4444;">Subscription Expiry Alert</h2>
                <p>Your subscription to <strong>${messName}</strong> will expire in ${daysLeft} days.</p>
                <p>Please renew it soon to continue enjoying uninterrupted meals.</p>
                <div style="margin: 20px 0;">
                    <a href="${config.FRONTEND_URL}/dashboard" style="background: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Renew Now</a>
                </div>
            </div>
        `;
        return this.sendMail(email, subject, html);
    }

    async sendResetPasswordEmail(email: string, token: string) {
        const resetUrl = `${config.FRONTEND_URL}/reset-password/${token}`;
        const subject = 'Password Reset Request - MessWalha';
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #f97316;">Password Reset Request</h2>
                <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
                <p>Please click on the following button to complete the process:</p>
                <div style="margin: 30px 0;">
                    <a href="${resetUrl}" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                </div>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
                <p>This link will expire in 1 hour.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">MessWalha - Digitalizing Local Messes</p>
            </div>
        `;
        return this.sendMail(email, subject, html);
    }
}

export const emailService = new EmailService();
