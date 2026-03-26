const db = require('../config/db');

const Notification = {
    create: async (messId, message) => {
        const result = await db.query(
            'INSERT INTO notifications (mess_id, message) VALUES ($1, $2) RETURNING *',
            [messId, message]
        );
        return result.rows[0];
    },
    findByMessId: async (messId) => {
        const result = await db.query(
            'SELECT * FROM notifications WHERE mess_id = $1 ORDER BY created_at DESC',
            [messId]
        );
        return result.rows;
    },
    findAll: async () => {
        const result = await db.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
        return result.rows;
    }
};

module.exports = Notification;
