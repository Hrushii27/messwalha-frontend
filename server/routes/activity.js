const express = require('express');
const router = express.Router();

router.get('/user', async (req, res) => {
    // Mock activity for now to satisfy frontend requirements
    res.json({
        data: [
            { id: 1, type: 'PAYMENT', title: 'Payment Successful', desc: '₹2500 for Monthly Plan', time: '2 hours ago' },
            { id: 2, type: 'SUBSCRIPTION', title: 'Plan Renewed', desc: 'Your subscription has been renewed', time: 'Yesterday' }
        ]
    });
});

module.exports = router;
