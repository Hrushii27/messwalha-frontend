const Razorpay = require("razorpay");
const crypto = require("crypto");

let razorpayInstance = null;

// Only initialize if keys exist
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log("✅ Razorpay configured");
} else {
  console.log("⚠ Razorpay not configured. Payments disabled.");
}

// Safe createOrder function
const createOrder = async (amount) => {
  if (!razorpayInstance) {
    throw new Error("Razorpay not configured");
  }

  return await razorpayInstance.orders.create({
    amount: amount * 100,
    currency: "INR",
  });
};

// Safe verifySignature function
const verifySignature = (order_id, payment_id, signature) => {
  if (!process.env.RAZORPAY_KEY_SECRET) return false;

  const body = order_id + "|" + payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  return expectedSignature === signature;
};

module.exports = {
  createOrder,
  verifySignature,
};
