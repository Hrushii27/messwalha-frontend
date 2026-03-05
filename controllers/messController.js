const Mess = require('../models/mess');
const Review = require('../models/review');

const messController = {
    createListing: async (req, res) => {
        try {
            const {
                messName,
                ownerName,
                mobile,
                address,
                pricePerMonth,
                pricePerWeek,
                pricePerDay,
                menuText
            } = req.body;

            // Handle files from multer
            const messImage = req.files['mess_image'] ? req.files['mess_image'][0].path : null;
            const menuImages = req.files['menu_images'] ? req.files['menu_images'].map(f => f.path) : [];

            const mess = await Mess.create({
                mess_owner_id: req.owner.id,
                mess_name: messName,
                owner_name: ownerName,
                mobile: mobile,
                address: address,
                price_per_month: parseInt(pricePerMonth),
                price_per_week: parseInt(pricePerWeek),
                price_per_day: parseInt(pricePerDay),
                menu_text: menuText,
                mess_image: messImage,
                menu_images: menuImages
            });

            res.status(201).json({ success: true, message: 'Mess added successfully', data: mess });
        } catch (err) {
            console.error('🔥 Error creating mess:', err);
            res.status(500).json({ success: false, message: 'Server error creating mess' });
        }
    },

    getAllListings: async (req, res) => {
        try {
            const messes = await Mess.findAllActive();
            // Map keys to match frontend expectations
            const formattedmesses = messes.map(m => ({
                id: m.id,
                name: m.mess_name,
                address: m.address,
                description: m.menu_text ? m.menu_text.substring(0, 100) + '...' : 'Excellent quality food with authentic taste.',
                monthlyPrice: m.price_per_month,
                images: [m.mess_image, ...m.menu_images].filter(Boolean),
                verified: true,
                cuisine: 'Indian', // Default or parse from menu_text if possible
                createdAt: m.created_at
            }));

            res.status(200).json({ success: true, count: formattedmesses.length, data: formattedmesses });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error fetching messes' });
        }
    },

    getMyListings: async (req, res) => {
        try {
            const messes = await Mess.findByOwnerId(req.owner.id);
            const m = messes[0] || {};
            const formattedMess = m.id ? {
                id: m.id,
                name: m.mess_name,
                address: m.address,
                monthlyPrice: m.price_per_month,
                images: [m.mess_image, ...m.menu_images].filter(Boolean),
                menuText: m.menu_text
            } : null;
            res.status(200).json({ success: true, data: formattedMess });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error fetching your mess' });
        }
    },

    getListingById: async (req, res) => {
        const { id } = req.params;
        try {
            const m = await Mess.findById(id);
            if (!m) {
                return res.status(404).json({ success: false, message: 'Mess not found' });
            }

            const formattedMess = {
                id: m.id,
                name: m.mess_name,
                ownerName: m.owner_name,
                address: m.address,
                monthlyPrice: m.price_per_month,
                weeklyPrice: m.price_per_week,
                dailyPrice: m.price_per_day,
                description: m.menu_text,
                images: [m.mess_image, ...m.menu_images].filter(Boolean),
                menuImages: m.menu_images || [],
                messImage: m.mess_image,
                createdAt: m.created_at
            };

            // Fetch reviews
            const reviews = await Review.findByMessId(id);

            res.status(200).json({
                success: true,
                data: {
                    ...formattedMess,
                    reviews: reviews || []
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error fetching mess details' });
        }
    },

    updateListing: async (req, res) => {
        const { id } = req.params;
        try {
            const updated = await Mess.update(id, req.owner.id, req.body);
            res.status(200).json({ success: true, data: updated });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error updating mess' });
        }
    },

    deleteListing: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await Mess.delete(id, req.owner.id);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Mess not found or unauthorized' });
            }
            res.status(200).json({ success: true, message: 'Mess deleted successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error deleting mess' });
        }
    }
};

module.exports = messController;
