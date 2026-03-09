const express = require('express');
const router = express.Router();

// Stub for notifications
router.get('/', async (req, res) => {
    res.json({ data: [] });
});

module.exports = router;
