const Mess = require('../models/mess');

const getOwnerDashboardStats = async (req, res) => {
    try {
        const ownerId = req.user.id;
        console.log(`[DASHBOARD DEBUG] Fetching stats for OwnerId: ${ownerId}`);
        const stats = await Mess.getDashboardStats(ownerId);
        console.log(`[DASHBOARD DEBUG] Stats result:`, stats);
        
        if (!stats) {
            console.log(`[DASHBOARD DEBUG] No mess found for owner ${ownerId}. Returning default zeros.`);
            return res.json({ 
                success: true, 
                data: { 
                    avgRating: 0.0, 
                    reviewCount: 0, 
                    activeStudents: 0, 
                    totalRevenue: 0 
                } 
            });
        }
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
