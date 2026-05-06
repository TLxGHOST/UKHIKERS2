import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";
export const addPayment = async (req, res) => {
  try {

    const { bookingId, amount, paymentMethod } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.amountPaid += amount;
    booking.amountRemaining -= amount;

    if (booking.amountRemaining <= 0) {
      booking.paymentStatus = "paid";
      booking.amountRemaining = 0;
    } else {
      booking.paymentStatus = "partial";
    }

    await booking.save();

    await Payment.create({
      bookingId,
      amount,
      paymentType: booking.paymentStatus === "paid" ? "remaining" : "advance",
      paymentMethod
    });

    res.json({ success: true, booking });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment failed" });
  }
};
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("bookingId")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};
// CREATE RAZORPAY ORDER
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    console.log("Creating Razorpay order:", options);

    const order = await razorpay.orders.create(options);
    console.log("Order created:", order);

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      }
    });
  } catch (err) {
    console.error("Razorpay order error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to create order"
    });
  }
};

// VERIFY RAZORPAY PAYMENT
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details"
      });
    }

    const crypto = await import("crypto");

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET || process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      console.log("Payment verified successfully");
      res.json({
        success: true,
        message: "Payment verified successfully"
      });
    } else {
      console.error("Signature mismatch");
      res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  }
};