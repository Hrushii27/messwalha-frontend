const express = require('express');
const router = express.Router();
const messController = require('../controllers/messController');
const authMiddleware = require('../middleware/auth');
const checkSubscription = require('../middleware/checkSubscription');
const upload = require('../utils/multerConfig');

router.get('/', messController.getAllListings);
router.get('/:id', messController.getListingById);

router.post('/', authMiddleware, checkSubscription, upload.fields([
    { name: 'mess_image', maxCount: 1 },
    { name: 'menu_images', maxCount: 5 }
]), messController.createListing);

router.get('/my-listings', authMiddleware, messController.getMyListings);
router.get('/my', authMiddleware, messController.getMyListings); // Alias for frontend
router.put('/my', authMiddleware, checkSubscription, messController.updateListing); // Alias for frontend
router.delete('/:id', authMiddleware, messController.deleteListing);

module.exports = router;
