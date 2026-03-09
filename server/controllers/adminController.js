const db = require('../config/db');

const adminController = {
    getStats: async (req, res) => {
        try {
            const totalOwners = await db.query('SELECT COUNT(*) FROM mess_owners');
            const trialUsers = await db.query("SELECT COUNT(*) FROM subscriptions WHERE status = 'trial'");
            const activeUsers = await db.query("SELECT COUNT(*) FROM subscriptions WHERE status = 'active'");
            const expiredUsers = await db.query("SELECT COUNT(*) FROM subscriptions WHERE status = 'expired'");

            // Calculate MRR (Monthly Recurring Revenue) - simplified version
            const mrrResult = await db.query("SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND plan_type = 'basic_599'");
            const mrr = mrrResult.rows[0].count * 599;

            res.json({
                totalOwners: totalOwners.rows[0].count,
                trialUsers: trialUsers.rows[0].count,
                activePaidUsers: activeUsers.rows[0].count,
                expiredUsers: expiredUsers.rows[0].count,
                monthlyRecurringRevenue: mrr
            });
        } catch (err) {
            res.status(500).json({ message: 'Error fetching admin stats' });
        }
    }
};

module.exports = adminController;
