const Subscription = require('../models/subscription');
const crypto = require('crypto');

// Razorpay disabled until keys are provided
const razorpay = null;

const subscriptionController = {
    getStatus: async (req, res) => {
        try {
            const sub = await Subscription.findByOwnerId(req.user.id);
            res.json({ success: true, data: sub || null });
        } catch (err) {
            console.error('Error fetching sub status:', err);
            res.status(500).json({ message: 'Error checking subscription status' });
        }
    },

    getSubscriptions: async (req, res) => {
        try {
            const sub = await Subscription.findByOwnerId(req.user.id);
            // Frontend MySubscriptionsPage expects { subscriptions: [...] }
            res.json({ success: true, subscriptions: sub ? [sub] : [] });
        } catch (err) {
            console.error('Error fetching subscriptions:', err);
            res.status(500).json({ message: 'Error fetching subscriptions' });
        }
    },

    createOrder: async (req, res) => {
        res.status(501).json({ message: 'Payments are coming soon!' });
    },

    handleWebhook: async (req, res) => {
        res.status(501).send('Not implemented');
    }
};

module.exports = subscriptionController;
