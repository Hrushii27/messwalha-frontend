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
    },
    getPendingListings: async (req, res) => {
        try {
            const Mess = require('../models/mess');
            const listings = await Mess.findAllPending();
            res.json({ success: true, data: listings });
        } catch (err) {
            console.error('Error fetching pending listings:', err);
            res.status(500).json({ message: 'Error fetching pending mess listings' });
        }
    },

    approveListing: async (req, res) => {
        const { id } = req.params;
        try {
            const Mess = require('../models/mess');
            const Notification = require('../models/notification');
            const mess = await Mess.adminUpdateStatus(id, 'approved');
            
            // Enable mess visibility
            await Mess.updateVisibility(mess.mess_owner_id, true);

            // Create notification for owner
            await Notification.create(id, `Congratulations! Your mess listing "${mess.name}" has been approved and is now live.`);

            res.json({ success: true, message: 'Mess approved and owner notified.', data: mess });
        } catch (err) {
            console.error('Error approving mess:', err);
            res.status(500).json({ message: 'Error approving mess listing' });
        }
    },

    rejectListing: async (req, res) => {
        const { id } = req.params;
        const { reason } = req.body;
        try {
            const Mess = require('../models/mess');
            const Notification = require('../models/notification');
            const mess = await Mess.adminUpdateStatus(id, 'rejected');

            // Create notification for owner
            await Notification.create(id, `Your mess listing was rejected. Reason: ${reason || 'N/A'}. Please update your details and contact support.`);

            res.json({ success: true, message: 'Mess rejected and owner notified.', data: mess });
        } catch (err) {
            console.error('Error rejecting mess:', err);
            res.status(500).json({ message: 'Error rejecting mess listing' });
        }
    }
};

module.exports = adminController;
