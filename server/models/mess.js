const db = require('../config/db');

function mapMessFields(mess) {
    if (!mess) return null;
    try {
        const photo = mess.display_photo || mess.image_url || null;
        return {
            ...mess,
            monthlyPrice: mess.monthly_price ? parseFloat(mess.monthly_price) : 0,
            imageUrl: photo,
            displayPhoto: photo, 
            isActive: mess.is_active,
            vegNonVeg: mess.veg_nonveg,
            collegeTags: mess.college_tags,
            upiId: mess.upi_id,
            menuImages: mess.menu_images || [],
            reviewCount: mess.review_count ? parseInt(mess.review_count) : 0,
        };
    } catch (err) {
        console.error('Error in mapMessFields:', err);
        return mess;
    }
}

const Mess = {
    create: async (ownerId, name, address, monthlyPrice, description = '', cuisine = 'Indian', city = '', vegNonveg = 'Both', collegeTags = '', upiId = null, imageUrl = null, menuImages = []) => {
        const result = await db.query(
            'INSERT INTO mess_listings (mess_owner_id, name, address, monthly_price, description, cuisine, city, veg_nonveg, college_tags, status, upi_id, image_url, display_photo, menu_images, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *',
            [ownerId, name, address, monthlyPrice, description, cuisine, city, vegNonveg, collegeTags, 'approved', upiId, imageUrl, imageUrl, menuImages, true]
        );
        return mapMessFields(result.rows[0]);
    },
    update: async (ownerId, data) => {
        const { name, address, description, cuisine, city, vegNonveg, college_tags, status, upi_id, monthlyPrice, imageUrl, displayPhoto, menuImages } = data;
        
        let query = `UPDATE mess_listings SET name = $1, address = $2, description = $3, cuisine = $4, city = $5, veg_nonveg = $6, college_tags = $7`;
        const values = [name, address, description, cuisine, city, vegNonveg, college_tags];
        let paramIdx = 8;

        if (monthlyPrice !== undefined) {
            query += `, monthly_price = $${paramIdx}`;
            values.push(monthlyPrice);
            paramIdx++;
        }

        if (imageUrl !== undefined || displayPhoto !== undefined) {
            const photoUrl = displayPhoto || imageUrl;
            query += `, image_url = $${paramIdx}, display_photo = $${paramIdx + 1}`;
            values.push(photoUrl, photoUrl);
            paramIdx += 2;
        }

        if (upi_id !== undefined) {
            query += `, upi_id = $${paramIdx}`;
            values.push(upi_id);
            paramIdx++;
        }
        
        if (menuImages !== undefined) {
            query += `, menu_images = $${paramIdx}`;
            values.push(menuImages);
            paramIdx++;
        }

        if (status) {
            query += `, status = $${paramIdx}`;
            values.push(status);
            paramIdx++;
        }

        query += ` WHERE mess_owner_id = $${paramIdx} RETURNING *`;
        values.push(ownerId);

        const result = await db.query(query, values);
        return mapMessFields(result.rows[0]);
    },
    findByOwnerId: async (ownerId) => {
        try {
            const result = await db.query('SELECT * FROM mess_listings WHERE mess_owner_id = $1 LIMIT 1', [ownerId]);
            return mapMessFields(result.rows[0]);
        } catch (err) {
            console.error('Error in findByOwnerId:', err);
            throw err;
        }
    },
    updateVisibility: async (ownerId, isActive) => {
        const result = await db.query(
            'UPDATE mess_listings SET is_active = $1 WHERE mess_owner_id = $2 RETURNING *',
            [isActive, ownerId]
        );
        return mapMessFields(result.rows[0]);
    },
    findByNameAndOwner: async (name, ownerId) => {
        const result = await db.query(
            'SELECT * FROM mess_listings WHERE name = $1 AND mess_owner_id = $2',
            [name, ownerId]
        );
        return mapMessFields(result.rows[0]);
    },
    findAllActive: async () => {
        const result = await db.query(`
            SELECT * FROM mess_listings 
            WHERE is_active = TRUE AND status = 'approved'
        `);
        return result.rows.map(mapMessFields);
    },
    findWithFilters: async (filters = {}) => {
        const { sort, foodType, cuisine, maxPrice, minRating, verified } = filters;
        let query = `
            SELECT * FROM mess_listings 
            WHERE is_active = TRUE AND status = 'approved'
        `;
        const values = [];
        let paramIdx = 1;

        if (foodType && foodType !== 'all') {
            // Map 'veg' -> 'Veg', 'non-veg' -> 'Non-Veg', 'nonveg' -> 'Non-Veg'
            let type = foodType.toLowerCase();
            if (type === 'veg') type = 'Veg';
            else if (type === 'non-veg' || type === 'nonveg') type = 'Non-Veg';
            else type = 'Both';
            
            query += ` AND veg_nonveg = $${paramIdx}`;
            values.push(type);
            paramIdx++;
        }

        if (cuisine && cuisine !== 'All' && cuisine !== '') {
            if (cuisine === 'Veg' || cuisine === 'Non-Veg') {
                query += ` AND veg_nonveg = $${paramIdx}`;
                values.push(cuisine);
            } else {
                query += ` AND cuisine = $${paramIdx}`;
                values.push(cuisine);
            }
            paramIdx++;
        }

        if (maxPrice) {
            query += ` AND monthly_price <= $${paramIdx}`;
            values.push(maxPrice);
            paramIdx++;
        }

        if (minRating) {
            query += ` AND rating >= $${paramIdx}`;
            values.push(minRating);
            paramIdx++;
        }

        if (verified === true || verified === 'true') {
            query += ` AND verified = TRUE`;
        }

        // Sorting
        if (sort === 'rating' || sort === 'Best Rated') {
            query += ` ORDER BY rating DESC`;
        } else if (sort === 'price_low' || sort === 'Price: Low to High') {
            query += ` ORDER BY monthly_price ASC`;
        } else if (sort === 'newest' || sort === 'Newest First') {
            query += ` ORDER BY created_at DESC`;
        } else {
            query += ` ORDER BY created_at DESC`; // Default
        }

        const result = await db.query(query, values);
        return result.rows.map(mapMessFields);
    },
    findById: async (id) => {
        try {
            const result = await db.query(`
                SELECT ml.*, mo.name as "ownerName", mo.phone as "mobile"
                FROM mess_listings ml
                LEFT JOIN mess_owners mo ON ml.mess_owner_id = mo.id
                WHERE ml.id = $1
            `, [id]);
            return mapMessFields(result.rows[0]);
        } catch (err) {
            console.error('Error in findById:', err);
            throw err;
        }
    },
    findAllPending: async () => {
        const result = await db.query(`
            SELECT ml.*, mo.name as "ownerName", mo.email as "ownerEmail"
            FROM mess_listings ml
            JOIN mess_owners mo ON ml.mess_owner_id = mo.id
            WHERE ml.status = 'pending'
            ORDER BY ml.created_at DESC
        `);
        return result.rows.map(mapMessFields);
    },
    adminUpdateStatus: async (messId, status) => {
        const result = await db.query(
            "UPDATE mess_listings SET status = $1 WHERE id = $2 RETURNING *",
            [status, messId]
        );
        return mapMessFields(result.rows[0]);
    },
    updateRating: async (messId, avgRating, reviewCount) => {
        const result = await db.query(
            "UPDATE mess_listings SET rating = $1, review_count = $2 WHERE id = $3 RETURNING *",
            [avgRating, reviewCount, messId]
        );
        return mapMessFields(result.rows[0]);
    },
    getDashboardStats: async (ownerId) => {
        const result = await db.query(`
            SELECT 
                ml.rating, 
                ml.review_count as "reviewCount",
                (SELECT COUNT(*) FROM student_subscriptions WHERE mess_id = ml.id AND status = 'active') as "activeStudents",
                (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE mess_id = ml.id AND status = 'SUCCESS') as "totalRevenue"
            FROM mess_listings ml
            WHERE ml.mess_owner_id = $1
            LIMIT 1
        `, [ownerId]);
        return result.rows[0];
    }
};

module.exports = Mess;
