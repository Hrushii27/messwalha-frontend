const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

router.get('/stats', authMiddleware, adminController.getStats);

module.exports = router;
