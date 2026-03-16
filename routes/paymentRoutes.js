const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

router.post('/create-order', authMiddleware, paymentController.createOrder);
router.post('/owner/create-order', authMiddleware, paymentController.createOrder); // Alias
router.post('/verify', authMiddleware, paymentController.verifyPayment);
router.post('/owner/verify', authMiddleware, paymentController.verifyPayment); // Alias
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
