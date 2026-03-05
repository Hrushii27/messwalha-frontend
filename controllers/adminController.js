const User = require('../models/user');
const Mess = require('../models/mess');
const db = require('../config/db');

const adminController = {
    getStats: async (req, res) => {
        try {
            const statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM owner_subscriptions WHERE status = 'active') as active_subscriptions,
          (SELECT COUNT(*) FROM owner_subscriptions WHERE status = 'trial') as trial_subscriptions,
          (SELECT COUNT(*) FROM owner_subscriptions WHERE status = 'expired') as expired_subscriptions,
          (SELECT COALESCE(SUM(price), 0) FROM owner_subscriptions WHERE status = 'active') as mrr
        ;
      `;
            const result = await db.query(statsQuery);
            res.status(200).json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error fetching admin stats' });
        }
    }
};

module.exports = adminController;
