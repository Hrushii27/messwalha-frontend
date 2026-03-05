const db = require('../config/db');

const Mess = {
    create: async (data) => {
        const {
            owner_id,
            mess_name,
            owner_name,
            mobile,
            address,
            city,
            cuisine,
            price_per_month,
            price_per_week,
            price_per_day,
            menu_text,
            mess_image,
            menu_images
        } = data;

        const result = await db.query(
            `INSERT INTO messes (
                owner_id, mess_name, owner_name, mobile, address, 
                city, cuisine,
                price_per_month, price_per_week, price_per_day, 
                menu_text, mess_image, menu_images
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
            [
                owner_id, mess_name, owner_name, mobile, address,
                city, cuisine,
                price_per_month, price_per_week, price_per_day,
                menu_text, mess_image, menu_images || []
            ]
        );
        return result.rows[0];
    },

    findAllActive: async (filters = {}) => {
        const { cuisine, maxPrice } = filters;
        let query = 'SELECT * FROM messes WHERE is_active = TRUE';
        const values = [];
        let index = 1;

        if (cuisine && cuisine.toLowerCase() !== 'all') {
            query += ` AND LOWER(cuisine) = $${index++}`;
            values.push(cuisine.toLowerCase());
        }

        if (maxPrice) {
            query += ` AND price_per_month <= $${index++}`;
            values.push(parseInt(maxPrice));
        }

        query += ' ORDER BY city ASC, created_at DESC';

        const result = await db.query(query, values);
        return result.rows;
    },

    findById: async (id) => {
        const result = await db.query('SELECT * FROM messes WHERE id = $1', [id]);
        return result.rows[0];
    },

    findByOwnerId: async (ownerId) => {
        const result = await db.query('SELECT * FROM messes WHERE owner_id = $1', [ownerId]);
        return result.rows;
    },

    update: async (id, ownerId, data) => {
        const fields = [];
        const values = [];
        let index = 1;

        for (const [key, value] of Object.entries(data)) {
            fields.push(`${key} = $${index++}`);
            values.push(value);
        }

        values.push(id);
        values.push(ownerId);

        const query = `UPDATE messes SET ${fields.join(', ')} WHERE id = $${index++} AND owner_id = $${index} RETURNING *`;
        const result = await db.query(query, values);
        return result.rows[0];
    },

    delete: async (id, ownerId) => {
        const result = await db.query('DELETE FROM messes WHERE id = $1 AND owner_id = $2 RETURNING id', [id, ownerId]);
        return result.rows[0];
    },

    deactivateByOwnerId: async (ownerId) => {
        await db.query('UPDATE messes SET is_active = FALSE WHERE owner_id = $1', [ownerId]);
    }
};

module.exports = Mess;
