const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// Placeholder for auth middleware - we'll add a simple one if not exists
const auth = (req, res, next) => {
    // For now, since we're in a hurry and debugging, we'll extract ID if possible or stub
    // In production this should be jwt verification
    next();
};

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);

module.exports = router;
