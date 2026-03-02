const db = require('../config/db');

const Listing = {
    create: async (ownerId, name, location, price, description, images = [], cuisine = '', rating = 0, verified = false) => {
        const result = await db.query(
            'INSERT INTO mess_listings (mess_owner_id, name, location, monthly_price, description, images, cuisine, rating, verified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [ownerId, name, location, price, description, images, cuisine, rating, verified]
        );
        return result.rows[0];
    },

    findByOwnerId: async (ownerId) => {
        const result = await db.query('SELECT * FROM mess_listings WHERE mess_owner_id = $1', [ownerId]);
        return result.rows;
    },

    update: async (id, ownerId, data) => {
        const { name, location, monthly_price, description, is_active, images, cuisine, rating, verified } = data;
        const result = await db.query(
            'UPDATE mess_listings SET name = $1, location = $2, monthly_price = $3, description = $4, is_active = $5, images = $6, cuisine = $7, rating = $8, verified = $9, updated_at = CURRENT_TIMESTAMP WHERE id = $10 AND mess_owner_id = $11 RETURNING *',
            [name, location, monthly_price, description, is_active, images, cuisine, rating, verified, id, ownerId]
        );
        return result.rows[0];
    },

    findAllActive: async () => {
        const result = await db.query(`
            SELECT ml.*, mo.name as owner_name 
            FROM mess_listings ml
            JOIN mess_owners mo ON ml.mess_owner_id = mo.id
            JOIN subscriptions s ON mo.id = s.mess_owner_id
            WHERE ml.is_active = TRUE 
            AND (s.status = 'active' OR s.status = 'trial')
        `);
        return result.rows;
    },

    delete: async (id, ownerId) => {
        const result = await db.query('DELETE FROM mess_listings WHERE id = $1 AND mess_owner_id = $2 RETURNING id', [id, ownerId]);
        return result.rows[0];
    },

    deactivateByOwnerId: async (ownerId) => {
        await db.query('UPDATE mess_listings SET is_active = FALSE WHERE mess_owner_id = $1', [ownerId]);
    },

    findById: async (id) => {
        const result = await db.query(`
            SELECT ml.*, mo.name as owner_name, mo.email as owner_email
            FROM mess_listings ml
            JOIN mess_owners mo ON ml.mess_owner_id = mo.id
            WHERE ml.id = $1
        `, [id]);
        return result.rows[0];
    }
};

module.exports = Listing;
