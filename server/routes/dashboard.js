const express = require('express');
const router = express.Router();
const { getOwnerDashboardStats } = require('../controllers/dashboardController');
const authenticateToken = require('../middleware/auth');

router.get('/owner/stats', authenticateToken, getOwnerDashboardStats);

module.exports = router;
