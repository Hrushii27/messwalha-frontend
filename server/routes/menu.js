const express = require('express');
const router = express.Router();

router.get('/today', async (req, res) => {
    // Stub menu for now
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
