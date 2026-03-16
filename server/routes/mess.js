const express = require('express');
const router = express.Router();
const Mess = require('../models/mess');
const Subscription = require('../models/subscription');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validation');

const messValidation = [
    body('messName').trim().notEmpty().escape().withMessage('Mess name is required'),
    body('address').trim().notEmpty().escape().withMessage('Address is required'),
    body('pricePerMonth').isNumeric().withMessage('Invalid monthly price'),
    body('pricePerWeek').optional().isNumeric(),
    body('pricePerDay').optional().isNumeric(),
    body('menuText').optional().trim().escape()
];

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
router.post('/', messValidation, validateRequest, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized. Please login again.' });
        }

        const { recaptchaToken } = req.body;
        const { verifyRecaptcha } = require('../utils/securityUtils');
        const isHuman = await verifyRecaptcha(recaptchaToken);
        
        if (!isHuman && process.env.NODE_ENV === 'production') {
            return res.status(403).json({ message: 'reCAPTCHA verification failed. Please try again.' });
        }

        // Map frontend fields (FormData) to backend expectations
        const {
            messName,
            address,
            pricePerMonth,
            pricePerWeek,
            pricePerDay,
            menuText,
            cuisine
        } = req.body;

        const ownerId = req.user.id;

        const sub = await Subscription.findByOwnerId(ownerId);
        if (!sub || (sub.status !== 'trial' && sub.status !== 'active')) {
            return res.status(403).json({ message: 'Subscription expired or inactive. Please pay ₹599 to activate.' });
        }

        // Using fallbacks or renaming for model compatibility
        const name = messName;
        const monthlyPrice = pricePerMonth;
        const description = menuText || '';

        const mess = await Mess.create(
            ownerId, 
            name, 
            address, 
            monthlyPrice, 
            description, 
            cuisine || 'Indian',
            req.body.city || '',
            req.body.veg_nonveg || 'Veg',
            req.body.college_tags || ''
        );
        res.status(201).json({ success: true, data: mess });
    } catch (err) {
        console.error('Error creating mess:', err);
        res.status(500).json({ message: 'Error creating mess listing: ' + err.message });
    }
});

// Get logged-in owner's mess
router.get('/my', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const messes = await Mess.findByOwnerId(req.user.id);
        res.json({ data: messes[0] || null }); // Return first mess or null
    } catch (err) {
        console.error('Error fetching owner mess:', err);
        res.status(500).json({ message: 'Error fetching mess details' });
    }
});

// Update logged-in owner's mess
router.put('/my', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const updatedMess = await Mess.update(req.user.id, req.body);
        res.json({ success: true, data: updatedMess });
    } catch (err) {
        console.error('Error updating owner mess:', err);
        res.status(500).json({ message: 'Error updating mess details: ' + err.message });
    }
});

module.exports = router;
