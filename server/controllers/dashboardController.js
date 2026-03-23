const Mess = require('../models/mess');

const getOwnerDashboardStats = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const stats = await Mess.getDashboardStats(ownerId);
        
        if (!stats) {
            return res.json({ 
                success: true, 
                data: {
                    rating: 0,
                    reviewCount: 0,
                    activeStudents: 0,
                    totalRevenue: 0
                }
            });
        }

        res.json({ success: true, data: stats });
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};

module.exports = {
    getOwnerDashboardStats
};
