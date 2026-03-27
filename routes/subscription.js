const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authenticateToken = require('../middleware/auth');

router.get('/', subscriptionController.getSubscriptions);

// Debug route (Temporal)
router.get('/debug/:messId', async (req, res) => {
    try {
        const StudentSubscription = require('../models/studentSubscription');
        const subscribers = await StudentSubscription.findByMessId(req.params.messId);
        res.json({ success: true, count: subscribers.length, data: subscribers });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message, stack: err.stack });
    }
});

router.get('/status', authenticateToken, subscriptionController.getStatus);
router.get('/subscribers', authenticateToken, subscriptionController.getSubscribers);
router.post('/start-trial', subscriptionController.startTrial);
router.post('/order', subscriptionController.createOrder);
router.post('/verify-payment', subscriptionController.verifyPayment);
router.post('/webhook', subscriptionController.handleWebhook);

module.exports = router;
