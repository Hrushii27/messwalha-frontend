const db = require('../config/db');

const User = {
    create: async (name, email, phone, password, role = 'OWNER') => {
        const result = await db.query(
            'INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role, created_at',
            [name, email, phone || '', password, role]
        );
        return result.rows[0];
    },

    findByEmail: async (email) => {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    },

    findById: async (id) => {
        const result = await db.query('SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1', [id]);
        return result.rows[0];
    }
};

module.exports = User;
