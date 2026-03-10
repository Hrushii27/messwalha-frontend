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

// Get single mess by ID
router.get('/:id', async (req, res) => {
    try {
        const mess = await Mess.findById(req.params.id);
        if (!mess) {
            return res.status(404).json({ message: 'Mess not found' });
        }
        res.json({ data: mess });
    } catch (err) {
        console.error('Error fetching mess by ID:', err);
        res.status(500).json({ message: 'Error fetching mess details' });
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
