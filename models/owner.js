const db = require('../config/db');

const Owner = {
    create: async (name, email, phone, passwordHash, role = 'OWNER') => {
        const result = await db.query(
            'INSERT INTO mess_owners (name, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role, created_at',
            [name, email, phone, passwordHash, role]
        );
        return result.rows[0];
    },

    findByEmail: async (email) => {
        const result = await db.query('SELECT * FROM mess_owners WHERE email = $1', [email]);
        return result.rows[0];
    },

    findById: async (id) => {
        const result = await db.query('SELECT id, name, email, phone, role, created_at FROM mess_owners WHERE id = $1', [id]);
        return result.rows[0];
    }
};

module.exports = Owner;
