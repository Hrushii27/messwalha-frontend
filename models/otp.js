const db = require('../config/db');

const Otp = {
    create: async (email, code) => {
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);

        await db.query('DELETE FROM otp_verifications WHERE user_email = $1', [email]);
        
        const result = await db.query(
            'INSERT INTO otp_verifications (user_email, otp_code, expires_at) VALUES ($1, $2, $3) RETURNING *',
            [email, code, expiresAt]
        );
        return result.rows[0];
    },
    verify: async (email, code) => {
        const result = await db.query(
            'SELECT * FROM otp_verifications WHERE user_email = $1 AND otp_code = $2',
            [email, code]
        );
        const record = result.rows[0];
        if (record) {
            const isExpired = new Date(record.expires_at) < new Date();
            console.log(`[DEBUG] OTP Found. Expires: ${record.expires_at}, Current: ${new Date().toISOString()}, Expired: ${isExpired}`);
            return isExpired ? null : record;
        }
        return null;
    },
    incrementAttempts: async (email) => {
        await db.query('UPDATE otp_verifications SET attempts = attempts + 1 WHERE user_email = $1', [email]);
    }
};

module.exports = Otp;
