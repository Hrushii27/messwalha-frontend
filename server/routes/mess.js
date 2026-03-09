const express = require('express');
const router = express.Router();
const Mess = require('../models/mess');
const Subscription = require('../models/subscription');

// Public route to get all active messes
router.get('/', async (req, res) => {
    try {
        const messes = await Mess.findAllActive();
        res.json({ data: messes }); // Frontend expects { data: [...] }
    } catch (err) {
        console.error('Error fetching messes:', err);
        res.status(500).json({ message: 'Error fetching active messes' });
    }
});

// Protected CRUD for mess owners
router.post('/', async (req, res) => {
    const { ownerId, name, address, monthlyPrice, description, cuisine } = req.body;
    try {
        const sub = await Subscription.findByOwnerId(ownerId);
        if (!sub || (sub.status !== 'trial' && sub.status !== 'active')) {
            return res.status(403).json({ message: 'Subscription expired or inactive. Please pay ₹599 to activate.' });
        }
        const mess = await Mess.create(ownerId, name, address, monthlyPrice, description, cuisine);
        res.status(201).json(mess);
    } catch (err) {
        console.error('Error creating mess:', err);
        res.status(500).json({ message: 'Error creating mess listing' });
    }
});

module.exports = router;
