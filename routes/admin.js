const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const isAdmin = require('../middleware/adminAuth');

// All routes here are protected by isAdmin
router.use(isAdmin);

router.get('/stats', adminController.getStats);
router.get('/pending-listings', adminController.getPendingListings);
router.post('/approve-listing/:id', adminController.approveListing);
router.post('/reject-listing/:id', adminController.rejectListing);

module.exports = router;
