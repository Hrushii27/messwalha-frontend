const db = require('../config/db');

const Mess = {
    create: async (data) => {
        const {
            mess_owner_id,
            mess_name,
            owner_name,
            mobile,
            address,
            price_per_month,
            price_per_week,
            price_per_day,
            menu_text,
            mess_image,
            menu_images
        } = data;

        const result = await db.query(
            `INSERT INTO messes (
                mess_owner_id, mess_name, owner_name, mobile, address, 
                price_per_month, price_per_week, price_per_day, 
                menu_text, mess_image, menu_images
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [
                mess_owner_id, mess_name, owner_name, mobile, address,
                price_per_month, price_per_week, price_per_day,
                menu_text, mess_image, menu_images || []
            ]
        );
        return result.rows[0];
    },

    findAllActive: async () => {
        const result = await db.query(
            'SELECT * FROM messes WHERE is_active = TRUE ORDER BY created_at DESC'
        );
        return result.rows;
    },

    findById: async (id) => {
        const result = await db.query('SELECT * FROM messes WHERE id = $1', [id]);
        return result.rows[0];
    },

    findByOwnerId: async (ownerId) => {
        const result = await db.query('SELECT * FROM messes WHERE mess_owner_id = $1', [ownerId]);
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

        const query = `UPDATE messes SET ${fields.join(', ')} WHERE id = $${index++} AND mess_owner_id = $${index} RETURNING *`;
        const result = await db.query(query, values);
        return result.rows[0];
    },

    delete: async (id, ownerId) => {
        const result = await db.query('DELETE FROM messes WHERE id = $1 AND mess_owner_id = $2 RETURNING id', [id, ownerId]);
        return result.rows[0];
    }
};

module.exports = Mess;
