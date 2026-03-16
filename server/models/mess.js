const db = require('../config/db');

const Mess = {
    create: async (ownerId, name, address, monthlyPrice, description = '', cuisine = 'Indian', city = '', vegNonveg = 'Both', collegeTags = '', upiId = null) => {
        const result = await db.query(
            'INSERT INTO mess_listings (mess_owner_id, name, address, monthly_price, description, cuisine, city, veg_nonveg, college_tags, status, upi_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [ownerId, name, address, monthlyPrice, description, cuisine, city, vegNonveg, collegeTags, 'pending', upiId]
        );
        return result.rows[0];
    },
    update: async (ownerId, data) => {
        const { name, address, description, cuisine, city, veg_nonveg, college_tags, status } = data;
        let query = `UPDATE mess_listings SET name = $1, address = $2, description = $3, cuisine = $4, city = $5, veg_nonveg = $6, college_tags = $7`;
        const values = [name, address, description, cuisine, city, veg_nonveg, college_tags];
        
        if (status) {
            query += `, status = $8`;
            values.push(status);
            query += ` WHERE mess_owner_id = $9 RETURNING *`;
            values.push(ownerId);
        } else {
            query += ` WHERE mess_owner_id = $8 RETURNING *`;
            values.push(ownerId);
        }

        const result = await db.query(query, values);
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
                ml.veg_nonveg as "vegNonVeg",
                ml.college_tags as "collegeTags",
                ml.status
            FROM mess_listings ml
            WHERE ml.is_active = TRUE AND ml.status = 'approved'
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
                ml.monthly_price::float as "monthlyPrice", 
                ml.description, 
                ml.rating::float as "rating", 
                ml.verified, 
                ml.image_url as "imageUrl", 
                ml.is_active as "isActive",
                ml.veg_nonveg as "vegNonVeg",
                ml.college_tags as "collegeTags",
                ml.status,
                mo.name as "ownerName",
                mo.phone as "mobile"
            FROM mess_listings ml
            LEFT JOIN mess_owners mo ON ml.mess_owner_id = mo.id
            WHERE ml.id = $1
        `, [id]);
        return result.rows[0];
    },
    findAllPending: async () => {
        const result = await db.query(`
            SELECT ml.*, mo.name as "ownerName", mo.email as "ownerEmail"
            FROM mess_listings ml
            JOIN mess_owners mo ON ml.mess_owner_id = mo.id
            WHERE ml.status = 'pending'
            ORDER BY ml.created_at DESC
        `);
        return result.rows;
    },
    adminUpdateStatus: async (messId, status) => {
        const result = await db.query(
            "UPDATE mess_listings SET status = $1 WHERE id = $2 RETURNING *",
            [status, messId]
        );
        return result.rows[0];
    }
};

module.exports = Mess;
