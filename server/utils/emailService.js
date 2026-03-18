const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

const sendResetPasswordEmail = async (email, token) => {
    const frontendUrl = process.env.FRONTEND_URL || 'https://messwalha-frontend.vercel.app';
    const resetUrl = `${frontendUrl}/reset-password/${token}`;

    const mailOptions = {
        from: `"MessWalha" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #4f46e5; text-align: center;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
                <p>Please click on the following button to complete the process:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
                </div>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
                <p>This link will expire in 1 hour.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 MessWalha. All rights reserved.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to: ${email}`);
    } catch (error) {
        console.error('❌ Email Send Error:', error);
        throw error;
    }
};

const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: `"MessWalha" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: 'Your Login OTP - MessWalha',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #4f46e5; text-align: center;">Your Login OTP</h2>
                <p>Hello,</p>
                <p>Your one-time password (OTP) for logging into MessWalha is:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5; background: #f3f4f6; padding: 10px 20px; border-radius: 5px;">${otp}</span>
                </div>
                <p>This OTP will expire in 5 minutes. Please do not share this code with anyone.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 MessWalha. All rights reserved.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent to: ${email}`);
    } catch (error) {
        console.error('❌ OTP Email Send Error:', error);
        throw error;
    }
};

module.exports = {
    sendResetPasswordEmail,
    sendOTPEmail
};
