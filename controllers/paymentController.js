const razorpayUtils = require('../utils/razorpay');
const Subscription = require('../models/subscription');
const db = require('../config/db');

const paymentController = {

  createOrder: async (req, res) => {
    const { amount, messId, planType } = req.body;
    try {
      if (!razorpayUtils || !razorpayUtils.createOrder) {
        return res.status(503).json({ success: false, message: "Payments not configured" });
      }

      // View first
      // Default amount to 499 for owners if not provided, otherwise use provided amount
      const orderAmount = amount || 499;
      const order = await razorpayUtils.createOrder(orderAmount);

      res.status(200).json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        isTestMode: !process.env.RAZORPAY_KEY_ID // Helpful for frontend to show mock success
      });

    } catch (err) {
      console.error('❌ Create Order Error:', err);
      res.status(500).json({ success: false, message: 'Server error creating payment order' });
    }
  },

  verifyPayment: async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, messId, planType } = req.body;
    try {
      if (!razorpayUtils || !razorpayUtils.verifySignature) {
        return res.status(503).json({ success: false, message: "Payments not configured" });
      }

      // Skip signature check in test mode if no keys are set
      const isProduction = !!process.env.RAZORPAY_KEY_ID;
      if (isProduction) {
        const isValid = razorpayUtils.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        if (!isValid) return res.status(400).json({ success: false, message: 'Invalid signature' });
      }

      // CASE 1: Student subscribing to a Mess
      if (messId) {
        const result = await db.query(
          'INSERT INTO student_subscriptions (student_id, mess_id, plan_type, status) VALUES ($1, $2, $3, $4) RETURNING *',
          [req.owner.id, messId, planType || 'monthly', 'active']
        );
        return res.status(200).json({ success: true, message: 'Subscribed successfully', data: result.rows[0] });
      }

      // CASE 2: Owner upgrading Platform Plan (₹499)
      const currentSub = await Subscription.findByOwnerId(req.owner.id);
      if (currentSub) {
        const updatedSub = await Subscription.updateSubscription(req.owner.id, 30);
        return res.status(200).json({
          success: true,
          message: 'Platform plan activated successfully for 30 days',
          subscription: updatedSub
        });
      }

      res.status(404).json({ success: false, message: 'Subscription record not found' });

    } catch (err) {
      console.error('❌ Verify Payment Error:', err);
      res.status(500).json({ success: false, message: 'Server error verifying payment' });
    }
  },

  handleWebhook: async (req, res) => {
    res.status(200).json({ received: true });
  }
};

module.exports = paymentController;
