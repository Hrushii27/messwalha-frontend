const db = require('../config/db');

const StudentSubscription = {
    create: async (userId, messId, planType = 'monthly', days = 30) => {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);

        const result = await db.query(
            'INSERT INTO student_subscriptions (user_id, mess_id, plan_type, end_date, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id, mess_id) DO UPDATE SET end_date = $4, status = $5, plan_type = $3 RETURNING *',
            [userId, messId, planType, endDate, 'active']
        );
        return result.rows[0];
    },

    countActiveByMessId: async (messId) => {
        const result = await db.query(
            "SELECT COUNT(*) FROM student_subscriptions WHERE mess_id = $1 AND status = 'active' AND (end_date > NOW() OR end_date IS NULL)",
            [messId]
        );
        return parseInt(result.rows[0].count);
    },

    findByMessId: async (messId) => {
        try {
            const result = await db.query(
                `SELECT 
                    ss.id,
                    ss.user_id,
                    ss.mess_id,
                    ss.plan_type,
                    ss.status,
                    ss.start_date,
                    ss.end_date,
                    mo.name as user_name,
                    mo.email as user_email 
                 FROM student_subscriptions ss
                 LEFT JOIN mess_owners mo ON ss.user_id = mo.id
                 WHERE ss.mess_id = $1`,
                [messId]
            );
            return result.rows;
        } catch (err) {
            console.error('Database error in findByMessId:', err);
            throw err;
        }
    }
};

module.exports = StudentSubscription;
