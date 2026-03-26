const express = require('express');
const router = express.Router();
const Favorites = require('../models/favorites');

// Get user's favorites
router.get('/', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const favorites = await Favorites.getByUserId(req.user.id);
        res.json({ success: true, data: favorites });
    } catch (err) {
        console.error('Error fetching favorites:', err);
        res.status(500).json({ message: 'Error fetching favorites' });
    }
});

// Toggle favorite (supports POST with body or current frontend param style)
router.post('/', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const messId = req.body.mess_id || req.body.messId;
        if (!messId) {
            return res.status(400).json({ message: 'Mess ID required' });
        }

        const result = await Favorites.toggle(req.user.id, messId);
        res.json({ success: true, ...result });
    } catch (err) {
        console.error('Error toggling favorite:', err);
        res.status(500).json({ message: 'Error updating favorite' });
    }
});

// Support for current frontend toggle endpoint
router.post('/toggle/:id', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const result = await Favorites.toggle(req.user.id, req.params.id);
        res.json({ success: true, ...result });
    } catch (err) {
        console.error('Error toggling favorite:', err);
        res.status(500).json({ message: 'Error updating favorite' });
    }
});

module.exports = router;
