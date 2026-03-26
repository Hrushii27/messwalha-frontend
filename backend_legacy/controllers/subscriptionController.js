const db = require('../config/db');

const subscriptionController = {
    // GET /api/subscriptions/my-subscriptions (Student)
    getMySubscriptions: async (req, res) => {
        try {
            const result = await db.query(`
        SELECT ss.*, m.mess_name, m.address as mess_address, m.price_per_month
        FROM student_subscriptions ss
        JOIN messes m ON ss.mess_id = m.id
        WHERE ss.student_id = $1
      `, [req.owner.id]);

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
                        monthlyPrice: row.price_per_month
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
        SELECT ss.*, u.name as student_name, u.email as student_email
        FROM student_subscriptions ss
        JOIN users u ON ss.student_id = u.id
        JOIN messes m ON ss.mess_id = m.id
        WHERE m.owner_id = $1
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
                totalRevenue: result.rows.reduce((sum, row) => sum + 2500, 0)
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
                'INSERT INTO student_subscriptions (student_id, mess_id, plan_type, status) VALUES ($1, $2, $3, $4) RETURNING *',
                [req.owner.id, messId, planType || 'monthly', 'active']
            );
            res.status(201).json({ success: true, data: result.rows[0] });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error subscribing to mess' });
        }
    },

    // GET /api/subscriptions/status (Owner)
    getStatus: async (req, res) => {
        try {
            const sub = await db.query('SELECT * FROM owner_subscriptions WHERE owner_id = $1', [req.owner.id]);
            if (sub.rows.length === 0) {
                return res.status(200).json({ success: true, data: null });
            }
            res.status(200).json({ success: true, data: sub.rows[0] });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error fetching status' });
        }
    }
};

module.exports = subscriptionController;
