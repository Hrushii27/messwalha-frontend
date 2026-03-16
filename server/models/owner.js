const db = require('../config/db');

const Owner = {
    create: async (name, email, phone, passwordHash, role = 'STUDENT') => {
        const result = await db.query(
            'INSERT INTO mess_owners (name, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, email, phone, passwordHash, role]
        );
        return result.rows[0];
    },
    findByEmail: async (email) => {
        const result = await db.query('SELECT * FROM mess_owners WHERE email = $1', [email]);
        return result.rows[0];
    },
    findById: async (id) => {
        const result = await db.query('SELECT * FROM mess_owners WHERE id = $1', [id]);
        return result.rows[0];
    },
    findByResetToken: async (token) => {
        const result = await db.query(
            'SELECT * FROM mess_owners WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
            [token]
        );
        return result.rows[0];
    },
    updateResetToken: async (email, token, expires) => {
        const result = await db.query(
            'UPDATE mess_owners SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3 RETURNING *',
            [token, expires, email]
        );
        return result.rows[0];
    },
    updatePassword: async (id, passwordHash) => {
        const result = await db.query(
            'UPDATE mess_owners SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2 RETURNING *',
            [passwordHash, id]
        );
        return result.rows[0];
    },
    findByGoogleId: async (googleId) => {
        const result = await db.query('SELECT * FROM mess_owners WHERE google_id = $1', [googleId]);
        return result.rows[0];
    },
    updateProfile: async (id, data) => {
        const { google_id, profile_picture } = data;
        const result = await db.query(
            'UPDATE mess_owners SET google_id = COALESCE($1, google_id), profile_picture = COALESCE($2, profile_picture) WHERE id = $3 RETURNING *',
            [google_id, profile_picture, id]
        );
        return result.rows[0];
    }
};

module.exports = Owner;
