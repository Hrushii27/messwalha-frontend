const express = require('express');
const router = express.Router();
const messController = require('../controllers/messController');
const authMiddleware = require('../middleware/auth');

router.get('/', messController.getAllListings);
router.post('/', authMiddleware, messController.createListing);
router.get('/my-listings', authMiddleware, messController.getMyListings);
router.put('/:id', authMiddleware, messController.updateListing);
router.delete('/:id', authMiddleware, messController.deleteListing);

module.exports = router;
