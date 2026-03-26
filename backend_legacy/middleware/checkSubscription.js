const Subscription = require('../models/subscription');

const checkSubscription = async (req, res, next) => {
    try {
        // Only enforce for OWNERS
        if (req.owner.role !== 'OWNER') {
            return next();
        }

        const status = await Subscription.checkStatus(req.owner.id);

        if (status === 'trial' || status === 'active') {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Your free trial has ended. Please subscribe to continue listing your mess.',
            redirect: '/owner/subscribe',
            status: 'expired'
        });
    } catch (err) {
        console.error('❌ Subscription Check Error:', err);
        res.status(500).json({ success: false, message: 'Server error checking subscription' });
    }
};

module.exports = checkSubscription;
