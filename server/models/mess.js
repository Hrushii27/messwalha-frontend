const db = require('../config/db');

const Mess = {
    create: async (ownerId, name, address, price, description, cuisine, city, veg_nonveg, college_tags) => {
        const result = await db.query(
            'INSERT INTO mess_listings (mess_owner_id, name, address, monthly_price, description, cuisine, city, veg_nonveg, college_tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [ownerId, name, address, price, description, cuisine, city, veg_nonveg, college_tags]
        );
        return result.rows[0];
    },
    update: async (ownerId, data) => {
        const { name, address, description, cuisine, city, veg_nonveg, college_tags } = data;
        const result = await db.query(
            `UPDATE mess_listings 
             SET name = $1, address = $2, description = $3, cuisine = $4, city = $5, veg_nonveg = $6, college_tags = $7 
             WHERE mess_owner_id = $8 RETURNING *`,
            [name, address, description, cuisine, city, veg_nonveg, college_tags, ownerId]
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
                ml.college_tags as "collegeTags"
            FROM mess_listings ml
            WHERE ml.is_active = TRUE
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
