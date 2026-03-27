const express = require('express');
const router = express.Router();
const Mess = require('../models/mess');
const Subscription = require('../models/subscription');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const upload = require('../utils/multer');

const messValidation = [
    body('name').trim().notEmpty().escape().withMessage('Mess name is required (min 3 chars)').isLength({ min: 3 }),
    body('location').trim().notEmpty().escape().withMessage('Location is required (min 2 chars)').isLength({ min: 2 }),
    body('city').trim().notEmpty().escape().withMessage('City is required (min 2 chars)').isLength({ min: 2 }),
    body('ownerName').trim().notEmpty().withMessage('Owner name is required'),
    body('contactNumber').trim().notEmpty().isLength({ min: 10, max: 10 }).withMessage('10-digit mobile number is required'),
    body('pricePerMonth').isNumeric().withMessage('Invalid monthly price'),
    body('pricePerWeek').optional().isNumeric(),
    body('pricePerDay').optional().isNumeric(),
    body('description').optional().trim().escape(),
    body('displayPhoto').optional().trim()
];

// Public route to get all active messes with filters
router.get('/', async (req, res) => {
    try {
        const { sort, foodType, cuisine, maxPrice, minRating, verified } = req.query;
        const messes = await Mess.findWithFilters({ sort, foodType, cuisine, maxPrice, minRating, verified });
        res.json({ data: messes }); 
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
router.put('/my', upload.fields([
    { name: 'mess_image', maxCount: 1 },
    { name: 'menu_images', maxCount: 5 }
]), messValidation, validateRequest, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const sub = await Subscription.findByOwnerId(req.user.id);
        if (!sub || (sub.status !== 'trial' && sub.status !== 'active')) {
            return res.status(403).json({ message: 'Subscription expired or inactive. Please renew to update your mess.' });
        }

        const existing = await Mess.findByOwnerId(req.user.id);
        if (!existing) {
            return res.status(404).json({ message: 'Mess not found' });
        }

        const {
            name,
            ownerName,
            contactNumber,
            location,
            city,
            pricePerMonth,
            pricePerWeek,
            pricePerDay,
            description,
            cuisine,
            veg_nonveg,
            college_tags,
            upiId,
            displayPhoto, // Cloudinary URL from frontend
            menuImages // Array of Cloudinary URLs from frontend
        } = req.body;

        const updateData = {
            name: name || existing.name,
            ownerName: ownerName || existing.ownerName,
            contactNumber: contactNumber || existing.contactNumber || existing.mobile,
            address: location || existing.address,
            description: description !== undefined ? description : existing.description,
            cuisine: cuisine || existing.cuisine,
            city: city !== undefined ? city : existing.city,
            vegNonveg: veg_nonveg || existing.vegNonVeg,
            college_tags: college_tags !== undefined ? college_tags : existing.collegeTags,
            upi_id: upiId || null,
            monthlyPrice: pricePerMonth ? parseFloat(pricePerMonth) : existing.monthlyPrice,
            weeklyPrice: pricePerWeek ? parseFloat(pricePerWeek) : existing.weeklyPrice,
            dailyPrice: pricePerDay ? parseFloat(pricePerDay) : existing.dailyPrice,
            displayPhoto: displayPhoto || existing.displayPhoto, 
            menuImages: menuImages || existing.menuImages
        };

        if (req.files && req.files['mess_image'] && req.files['mess_image'][0]) {
            updateData.displayPhoto = `/uploads/${req.files['mess_image'][0].filename}`;
        }

        const updatedMess = await Mess.update(req.user.id, updateData);
        res.json({ success: true, data: updatedMess });
    } catch (err) {
        console.error('Error updating owner mess:', err);
        res.status(500).json({ message: 'Error updating mess details: ' + err.message });
    }
});



// Get single mess by ID
router.get('/:id', async (req, res) => {
    try {
        const row = await Mess.findById(req.params.id);
        if (!row) {
            return res.status(404).json({ message: 'Mess not found' });
        }
        
        console.log("DB ROW:", row); // ✅ STEP 4 — DEBUG API

        // ✅ STEP 3 — FIX API RESPONSE (COMPLETE DATA)
        // Returning the whole row ensuring we have price, owner info, etc.
        const responseData = {
            ...row,
            location: row.address // Backward compatibility for any components expecting 'location'
        };

        console.log("API OUTPUT:", responseData); // ✅ STEP 4 — DEBUG API
        res.json({ data: responseData });
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


        // ✅ STEP 2 (BACKEND DEBUG)
        console.log("BACKEND PAYLOAD:", req.body);

        // Map frontend fields (FormData or JSON) to backend expectations
        const {
            name,
            ownerName,
            contactNumber,
            location,
            pricePerMonth,
            pricePerWeek,
            pricePerDay,
            description,
            cuisine,
            city,
            veg_nonveg,
            foodType, // Mapped from frontend JSON
            college_tags,
            upiId,
            displayPhoto
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

        const mess = await Mess.create(
            ownerId, 
            name, 
            location, 
            pricePerMonth, 
            description || '', 
            cuisine || 'Indian',
            city || '',
            veg_nonveg || 'Veg',
            college_tags || '',
            upiId || null,
            displayPhoto || null,
            [], // menuImages
            pricePerWeek || 0,
            pricePerDay || 0,
            ownerName || '',
            contactNumber || ''
        );
        res.status(201).json({ success: true, data: mess });
    } catch (err) {
        console.error('Error creating mess:', err);
        res.status(500).json({ message: 'Error creating mess listing: ' + err.message });
    }
});

module.exports = router;
