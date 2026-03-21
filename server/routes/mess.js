const express = require('express');
const router = express.Router();
const Mess = require('../models/mess');
const Subscription = require('../models/subscription');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const upload = require('../utils/multer');

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

// Get logged-in owner's mess
router.get('/my', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const mess = await Mess.findByOwnerId(req.user.id);
        res.json({ data: mess }); 
    } catch (err) {
        console.error('Error fetching owner mess:', err);
        res.status(500).json({ message: 'Error fetching mess details: ' + err.message });
    }
});

// Update logged-in owner's mess
router.put('/my', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const sub = await Subscription.findByOwnerId(req.user.id);
        if (!sub || (sub.status !== 'trial' && sub.status !== 'active')) {
            return res.status(403).json({ message: 'Subscription expired or inactive. Please renew to update your mess.' });
        }

        const updatedMess = await Mess.update(req.user.id, req.body);
        res.json({ success: true, data: updatedMess });
    } catch (err) {
        console.error('Error updating owner mess:', err);
        res.status(500).json({ message: 'Error updating mess details: ' + err.message });
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
router.post('/', upload.fields([
    { name: 'mess_image', maxCount: 1 },
    { name: 'menu_images', maxCount: 5 }
]), messValidation, validateRequest, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized. Please login again.' });
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

        // Single Mess Check: One owner, one mess
        const existing = await Mess.findByOwnerId(ownerId);
        if (existing) {
            return res.status(400).json({ 
                message: "You have already registered a mess. You can edit it instead from your dashboard." 
            });
        }

        // Using fallbacks or renaming for model compatibility
        const name = messName;
        const monthlyPrice = pricePerMonth;
        const description = menuText || '';

        // Use the first uploaded image as the main mess image
        let imageUrl = null;
        if (req.files && req.files['mess_image'] && req.files['mess_image'][0]) {
            imageUrl = `/uploads/${req.files['mess_image'][0].filename}`;
        }

        const mess = await Mess.create(
            ownerId, 
            name, 
            address, 
            monthlyPrice, 
            description, 
            cuisine || 'Indian',
            req.body.city || '',
            req.body.veg_nonveg || 'Veg',
            req.body.college_tags || '',
            req.body.upiId || null,
            imageUrl
        );
        res.status(201).json({ success: true, data: mess });
    } catch (err) {
        console.error('Error creating mess:', err);
        res.status(500).json({ message: 'Error creating mess listing: ' + err.message });
    }
});


module.exports = router;
