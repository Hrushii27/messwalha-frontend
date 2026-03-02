const db = require('../config/db');

const subscriptionController = {
    // GET /api/subscriptions/my-subscriptions (Student)
    getMySubscriptions: async (req, res) => {
        try {
            const result = await db.query(`
        SELECT ss.*, ml.name as mess_name, ml.location as mess_address, ml.cuisine
        FROM student_subscriptions ss
        JOIN mess_listings ml ON ss.mess_id = ml.id
        WHERE ss.student_id = $1
      `, [req.owner.id]); // req.owner is the user object from authMiddleware

            res.status(200).json({
                success: true,
                data: result.rows.map(row => ({
                    id: row.id,
                    status: row.status,
                    planType: row.plan_type,
                    startDate: row.start_date,
                    endDate: row.end_date,
                    mess: {
                        id: row.mess_id,
                        name: row.mess_name,
                        address: row.mess_address,
                        cuisine: row.cuisine
                    }
                }))
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error fetching subscriptions' });
        }
    },

    // GET /api/subscriptions/subscribers (Owner)
    getSubscribers: async (req, res) => {
        try {
            const result = await db.query(`
        SELECT ss.*, mo.name as student_name, mo.email as student_email
        FROM student_subscriptions ss
        JOIN mess_owners mo ON ss.student_id = mo.id
        JOIN mess_listings ml ON ss.mess_id = ml.id
        WHERE ml.mess_owner_id = $1
      `, [req.owner.id]);

            res.status(200).json({
                success: true,
                data: result.rows.map(row => ({
                    id: row.id,
                    status: row.status,
                    planType: row.plan_type,
                    createdAt: row.created_at,
                    user: {
                        name: row.student_name,
                        email: row.student_email
                    }
                })),
                totalRevenue: result.rows.reduce((sum, row) => sum + 2500, 0) // Mock logic for revenue
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error fetching subscribers' });
        }
    },

    // POST /api/subscriptions/subscribe
    subscribe: async (req, res) => {
        const { messId, planType } = req.body;
        try {
            const result = await db.query(
                'INSERT INTO student_subscriptions (student_id, mess_id, plan_type) VALUES ($1, $2, $3) RETURNING *',
                [req.owner.id, messId, planType || 'monthly']
            );
            res.status(201).json({ success: true, data: result.rows[0] });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error subscribing to mess' });
        }
    }
};

module.exports = subscriptionController;
