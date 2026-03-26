const db = require('../config/db');

const Favorites = {
    getByUserId: async (userId) => {
        const result = await db.query(`
            SELECT ml.* 
            FROM mess_listings ml
            JOIN favorites f ON ml.id = f.mess_id
            WHERE f.user_id = $1
        `, [userId]);
        return result.rows;
    },

    toggle: async (userId, messId) => {
        // Check if exists
        const check = await db.query(
            'SELECT id FROM favorites WHERE user_id = $1 AND mess_id = $2',
            [userId, messId]
        );

        if (check.rows.length > 0) {
            // Remove
            await db.query(
                'DELETE FROM favorites WHERE user_id = $1 AND mess_id = $2',
                [userId, messId]
            );
            return { isFavorite: false };
        } else {
            // Add
            await db.query(
                'INSERT INTO favorites (user_id, mess_id) VALUES ($1, $2)',
                [userId, messId]
            );
            return { isFavorite: true };
        }
    }
};

module.exports = Favorites;
