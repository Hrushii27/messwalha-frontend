const razorpayUtils = require('../utils/razorpay');
const Subscription = require('../models/subscription');
const db = require('../config/db');

const paymentController = {

  createOrder: async (req, res) => {
    try {
      // If Razorpay not configured
      if (!razorpayUtils || !razorpayUtils.createOrder) {
        return res.status(503).json({
          message: "Payments not configured yet"
        });
      }

      const order = await razorpayUtils.createOrder(599); // 599 INR
      res.status(200).json(order);

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error creating Razorpay order' });
    }
  },

  verifyPayment: async (req, res) => {
    try {

      // If Razorpay not configured
      if (!razorpayUtils || !razorpayUtils.verifySignature) {
        return res.status(503).json({
          message: "Payments not configured yet"
        });
      }

      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      } = req.body;

      const isValid = razorpayUtils.verifySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValid) {
        return res.status(400).json({
          message: 'Invalid payment signature'
        });
      }

      const subscription = await Subscription.findByOwnerId(req.owner.id);

      const nextBillingDate = new Date();
      nextBillingDate.setDate(nextBillingDate.getDate() + 30);

      const updatedSub = await Subscription.updateStatus(
        subscription.id,
        'active',
        'basic_599',
        nextBillingDate
      );

      res.status(200).json({
        message: 'Payment verified and subscription activated',
        subscription: updatedSub
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: 'Error updating subscription after payment'
      });
    }
  },

  handleWebhook: async (req, res) => {
    // Payments disabled for now
    return res.status(503).json({
      message: "Webhook not active - Razorpay not configured"
    });
  }

};

module.exports = paymentController;
