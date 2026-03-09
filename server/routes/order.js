const express = require('express');
const router = express.Router();

router.get('/user', async (req, res) => {
    // Stub orders for now
    res.json({
        data: [
            { id: 1, messName: 'Annapurna Mess', amount: 2500, date: '2024-03-01', status: 'Success' },
            { id: 2, messName: 'Krishna Mess', amount: 600, date: '2024-02-15', status: 'Success' }
        ]
    });
});

module.exports = router;
