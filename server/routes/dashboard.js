const express = require('express');
const router = express.Router();
const { getOwnerDashboardStats } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.get('/owner/stats', authenticate, getOwnerDashboardStats);

module.exports = router;
