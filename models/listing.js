const db = require('../config/db');

const Listing = {
    create: async (ownerId, name, location, price, description, images = [], cuisine = '', menus = []) => {
        const result = await db.query(
            'INSERT INTO mess_listings (mess_owner_id, name, location, monthly_price, description, images, cuisine, menus) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [ownerId, name, location, price, description, images, cuisine, JSON.stringify(menus)]
        );
        return result.rows[0];
    },

    findByOwnerId: async (ownerId) => {
        const result = await db.query('SELECT * FROM mess_listings WHERE mess_owner_id = $1', [ownerId]);
        return result.rows;
    },

    update: async (id, ownerId, data) => {
        const { name, location, price, description, images, cuisine, menus } = data;
        const result = await db.query(
            'UPDATE mess_listings SET name = $1, location = $2, monthly_price = $3, description = $4, images = $5, cuisine = $6, menus = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 AND mess_owner_id = $9 RETURNING *',
            [name, location, price, description, images, cuisine, JSON.stringify(menus || []), id, ownerId]
        );
        return result.rows[0];
    },

    findAllActive: async () => {
        const result = await db.query(`
            SELECT ml.*, mo.name as owner_name, ml.menus
            FROM mess_listings ml
            JOIN mess_owners mo ON ml.mess_owner_id = mo.id
            JOIN subscriptions s ON mo.id = s.mess_owner_id
            WHERE ml.is_active = TRUE
AND(s.status = 'active' OR s.status = 'trial')
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
            SELECT ml.*, mo.name as owner_name, mo.email as owner_email, ml.menus
            FROM mess_listings ml
            JOIN mess_owners mo ON ml.mess_owner_id = mo.id
            WHERE ml.id = $1
    `, [id]);
        return result.rows[0];
    }
};

module.exports = Listing;
