const express = require('express');
const router = express.Router();
const messController = require('../controllers/messController');
const authMiddleware = require('../middleware/auth');

router.get('/', messController.getAllListings);
router.get('/:id', messController.getListingById);
router.post('/', authMiddleware, messController.createListing);
router.get('/my-listings', authMiddleware, messController.getMyListings);
router.get('/my', authMiddleware, messController.getMyListings); // Alias for frontend
router.put('/my', authMiddleware, messController.updateListing); // Alias for frontend
router.put('/my/menu', authMiddleware, messController.updateMenu);
router.delete('/:id', authMiddleware, messController.deleteListing);

module.exports = router;
