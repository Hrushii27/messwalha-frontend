const Mess = require('../models/mess');

const getOwnerDashboardStats = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const stats = await Mess.getDashboardStats(ownerId);
        res.json({ success: true, data: stats });
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

const getMessDashboardStats = async (req, res) => {
    try {
        const { messId } = req.params;
        const stats = await Mess.getDashboardStatsById(messId);
        res.json({ success: true, data: stats });
    } catch (err) {
        console.error('Error fetching mess stats:', err);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

module.exports = {
    getOwnerDashboardStats,
    getMessDashboardStats
};
