const db = require('../config/db');

const Review = {
    create: async (messId, studentId, rating, comment) => {
        const result = await db.query(
            'INSERT INTO reviews (mess_id, student_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
            [messId, studentId, rating, comment]
        );
        return result.rows[0];
    },

    findByMessId: async (messId) => {
        const result = await db.query(`
            SELECT r.*, u.name as student_name
            FROM reviews r
            JOIN users u ON r.student_id = u.id
            WHERE r.mess_id = $1
            ORDER BY r.created_at DESC
        `, [messId]);
        return result.rows;
    },

    getAverageRating: async (messId) => {
        const result = await db.query('SELECT AVG(rating) as average_rating FROM reviews WHERE mess_id = $1', [messId]);
        return parseFloat(result.rows[0].average_rating) || 0;
    }
};

module.exports = Review;
