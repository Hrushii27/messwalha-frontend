const express = require('express');
const router = express.Router();
const { getOwnerDashboardStats, getMessDashboardStats } = require('../controllers/dashboardController');
const authenticateToken = require('../middleware/auth');

router.get('/owner/stats', authenticateToken, getOwnerDashboardStats);
router.get('/:messId', getMessDashboardStats);

module.exports = router;
