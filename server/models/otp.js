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
            'SELECT * FROM otp_verifications WHERE user_email = $1 AND otp_code = $2 AND expires_at > NOW()',
            [email, code]
        );
        return result.rows[0];
    },
    incrementAttempts: async (email) => {
        await db.query('UPDATE otp_verifications SET attempts = attempts + 1 WHERE user_email = $1', [email]);
    }
};

module.exports = Otp;
