const db = require('../config/db');

const Mess = {
    create: async (ownerId, name, address, price, description, cuisine) => {
        const result = await db.query(
            'INSERT INTO mess_listings (mess_owner_id, name, address, monthly_price, description, cuisine) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [ownerId, name, address, price, description, cuisine]
        );
        return result.rows[0];
    },
    findByOwnerId: async (ownerId) => {
        const result = await db.query('SELECT * FROM mess_listings WHERE mess_owner_id = $1', [ownerId]);
        return result.rows;
    },
    updateVisibility: async (ownerId, isActive) => {
        const result = await db.query(
            'UPDATE mess_listings SET is_active = $1 WHERE mess_owner_id = $2 RETURNING *',
            [isActive, ownerId]
        );
        return result.rows;
    },
    findAllActive: async () => {
        // Map database names to frontend names (optional if we want clean JSON)
        const result = await db.query(`
            SELECT 
                id, 
                name, 
                address, 
                cuisine, 
                monthly_price as "monthlyPrice", 
                description, 
                rating, 
                verified, 
                image_url as "imageUrl", 
                is_active as "isActive"
            FROM mess_listings 
            WHERE is_active = TRUE
        `);
        return result.rows;
    },
    findById: async (id) => {
        const result = await db.query(`
            SELECT 
                ml.id, 
                ml.name, 
                ml.address, 
                ml.city,
                ml.cuisine, 
                ml.monthly_price as "monthlyPrice", 
                ml.description, 
                ml.rating, 
                ml.verified, 
                ml.image_url as "imageUrl", 
                ml.is_active as "isActive",
                mo.name as "ownerName",
                mo.phone as "mobile"
            FROM mess_listings ml
            LEFT JOIN mess_owners mo ON ml.mess_owner_id = mo.id
            WHERE ml.id = $1
        `, [id]);
        return result.rows[0];
    }
};

module.exports = Mess;
