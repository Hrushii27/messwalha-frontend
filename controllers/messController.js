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
            res.status(200).json(listings);
        } catch (err) {
            res.status(500).json({ message: 'Server error fetching listings' });
        }
    },

    updateListing: async (req, res) => {
        const { id } = req.params;
        try {
            const listing = await Listing.update(id, req.owner.id, req.body);
            if (!listing) {
                return res.status(404).json({ message: 'Listing not found or unauthorized' });
            }
            res.status(200).json(listing);
        } catch (err) {
            res.status(500).json({ message: 'Server error updating listing' });
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
    }
};

module.exports = messController;
