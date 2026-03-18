const Subscription = require('../models/subscription');
const crypto = require('crypto');

const Razorpay = require('razorpay');

// Initialization with environment variables
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

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
        if (!razorpay) {
            return res.status(503).json({ message: 'Payment gateway not configured' });
        }
        
        const { amount } = req.body; // In INR, not paise
        try {
            const options = {
                amount: amount * 100, // Convert to paise
                currency: 'INR',
                receipt: `receipt_sub_${req.user.id}_${Date.now()}`,
            };

            const order = await razorpay.orders.create(options);
            res.json({ success: true, order });
        } catch (err) {
            console.error('Razorpay Order Error:', err);
            res.status(500).json({ message: 'Error creating payment order' });
        }
    },

    verifyPayment: async (req, res) => {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({ message: 'Payment verification secret missing' });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            console.log("✅ Payment verified for Order:", razorpay_order_id);
            
            // Logic to activate subscription in DB
            try {
                // Find and update subscription to 'active'
                await Subscription.activate(req.user.id, 30); // Activate for 30 days
                res.json({ success: true, message: 'Payment verified and subscription activated' });
            } catch (err) {
                console.error('Subscription Activation Error:', err);
                res.status(500).json({ message: 'Internal error activating subscription' });
            }
        } else {
            console.warn("⚠️ Invalid signature detected for payment!");
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    },

    handleWebhook: async (req, res) => {
        // Secure high-level implementation for webhooks
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (digest === req.headers['x-razorpay-signature']) {
             console.log('✅ Webhook verified');
             // Handle events (payment.captured, etc.)
             res.json({ status: 'ok' });
        } else {
             res.status(400).send('Invalid signature');
        }
    }
};

module.exports = subscriptionController;
