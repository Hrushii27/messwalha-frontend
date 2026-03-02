const Listing = require('../models/listing');

const messController = {
    createListing: async (req, res) => {
        const { name, location, price, description, images, cuisine } = req.body;
        try {
            const listing = await Listing.create(req.owner.id, name, location, price, description, images, cuisine);
            res.status(201).json(listing);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error creating listing' });
        }
    },

    getAllListings: async (req, res) => {
        try {
            const listings = await Listing.findAllActive();
            // Map keys to match frontend expectations (monthlyPrice -> price, etc.)
            const formattedListings = listings.map(l => ({
                id: l.id,
                name: l.name,
                address: l.location,
                description: l.description,
                monthlyPrice: parseFloat(l.monthly_price),
                images: l.images || [],
                rating: parseFloat(l.rating) || 0,
                verified: l.verified,
                cuisine: l.cuisine,
                createdAt: l.created_at
            }));

            res.status(200).json({ success: true, count: formattedListings.length, data: formattedListings });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error fetching listings' });
        }
    },

    getMyListings: async (req, res) => {
        try {
            const listings = await Listing.findByOwnerId(req.owner.id);
            // Frontend expects a single object for the dashboard mess state
            const l = listings[0] || {};
            const formattedListing = {
                id: l.id,
                name: l.name,
                address: l.location,
                description: l.description,
                monthlyPrice: parseFloat(l.monthly_price),
                cuisine: l.cuisine,
                contact: l.contact, // Add contact if not present in schema it might be null
                images: l.images || [],
                rating: parseFloat(l.rating) || 0,
                menus: l.menus || []
            };
            res.status(200).json({ success: true, data: formattedListing });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error fetching your mess' });
        }
    },

    updateListing: async (req, res) => {
        const { id } = req.params;
        const { name, location, price, description, images, is_active, monthly_price, cuisine, contact } = req.body;
        try {
            const updated = await Listing.update(id, { name, location, price, description, images, is_active, monthly_price, cuisine, contact });
            res.status(200).json({ success: true, data: updated });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error updating listing' });
        }
    },

    updateMenu: async (req, res) => {
        const ownerId = req.owner.id;
        const { menus } = req.body;
        try {
            const db = require('../config/db');
            const result = await db.query('SELECT id FROM mess_listings WHERE mess_owner_id = $1', [ownerId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Mess not found' });
            }
            const messId = result.rows[0].id;

            await db.query('UPDATE mess_listings SET menus = $1 WHERE id = $2', [JSON.stringify(menus || []), messId]);
            res.status(200).json({ success: true, message: 'Menu updated successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error updating menu' });
        }
    },

    deleteListing: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await Listing.delete(id, req.owner.id);
            if (!result) {
                return res.status(404).json({ message: 'Listing not found or unauthorized' });
            }
            res.status(200).json({ message: 'Listing deleted successfully' });
        } catch (err) {
            res.status(500).json({ message: 'Server error deleting listing' });
        }
    },

    getListingById: async (req, res) => {
        const { id } = req.params;
        try {
            const l = await Listing.findById(id);
            if (!l) {
                return res.status(404).json({ success: false, message: 'Mess not found' });
            }

            const formattedListing = {
                id: l.id,
                name: l.name,
                address: l.location,
                description: l.description,
                monthlyPrice: parseFloat(l.monthly_price),
                images: l.images || [],
                rating: parseFloat(l.rating) || 0,
                verified: l.verified,
                cuisine: l.cuisine,
                contact: l.contact,
                menus: l.menus || [], // Include menus
                owner: {
                    name: l.owner_name,
                    email: l.owner_email
                },
                createdAt: l.created_at
            };

            // Fetch latest reviews
            const Review = require('../models/review');
            const reviews = await Review.findByMessId(id);

            res.status(200).json({
                success: true,
                data: {
                    ...formattedListing,
                    reviews: reviews || []
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error fetching mess details' });
        }
    }
};

module.exports = messController;
