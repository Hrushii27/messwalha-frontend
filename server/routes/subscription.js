const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

router.get('/', subscriptionController.getSubscriptions);
router.get('/status', subscriptionController.getStatus);
router.post('/order', subscriptionController.createOrder);
router.post('/webhook', subscriptionController.handleWebhook);

module.exports = router;
