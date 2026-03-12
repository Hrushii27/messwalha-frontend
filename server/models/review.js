const db = require('../config/db');

const Review = {
    create: async (messId, userId, rating, comment) => {
        const result = await db.query(
            'INSERT INTO reviews (mess_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
            [messId, userId, rating, comment]
        );
        return result.rows[0];
    },
    findByMessId: async (messId) => {
        const result = await db.query(
            `SELECT r.*, u.name as user_name 
             FROM reviews r 
             JOIN mess_owners u ON r.user_id = u.id 
             WHERE r.mess_id = $1 
             ORDER BY r.created_at DESC`,
            [messId]
        );
        return result.rows;
    }
};

module.exports = Review;
