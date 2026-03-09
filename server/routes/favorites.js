const express = require('express');
const router = express.Router();

// Stub for favorites
router.get('/', async (req, res) => {
    res.json({ data: [] });
});

router.post('/', async (req, res) => {
    res.json({ message: 'Added to favorites (Stub)' });
});

module.exports = router;
