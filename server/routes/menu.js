const express = require('express');
const router = express.Router();

router.get('/:messId', async (req, res) => {
    try {
        // Return empty array for now as we use the 'description' field for text-based menu
        // In the future, this can fetch from a mess_menus table
        res.json({
            success: true,
            data: [] 
        });
    } catch (err) {
        console.error('Error fetching menu:', err);
        res.status(500).json({ message: 'Error fetching menu' });
    }
});

router.get('/today', async (req, res) => {
    // Stub for globally featured today's menu if needed
    res.json({
        data: {
            breakfast: 'Poha & Chai',
            lunch: 'Rice, Dal, 2 Sabzi, Chapati, Curd',
            dinner: 'Special Paneer, Chapati, Salad',
            messName: 'Annapurna Mess'
        }
    });
});

module.exports = router;
