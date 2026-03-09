const Subscription = require('../models/subscription');
const crypto = require('crypto');

// Razorpay disabled until keys are provided
const razorpay = null;

const subscriptionController = {
    createOrder: async (req, res) => {
        res.status(501).json({ message: 'Payments are coming soon!' });
    },

    handleWebhook: async (req, res) => {
        res.status(501).send('Not implemented');
    }
};

module.exports = subscriptionController;
