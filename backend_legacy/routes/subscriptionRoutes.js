const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/auth');

router.get('/my-subscriptions', authMiddleware, subscriptionController.getMySubscriptions);
router.get('/subscribers', authMiddleware, subscriptionController.getSubscribers);
router.get('/status', authMiddleware, subscriptionController.getStatus);
router.post('/subscribe', authMiddleware, subscriptionController.subscribe);

module.exports = router;
