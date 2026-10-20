import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import PaymentOrder from "../models/PaymentOrder.js";
import TrekSlot from "../models/TrekSlot.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";

const validId = (value) => typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
const validCustomer = ({ name, email, phone, persons }) =>
  typeof name === "string" && name.trim().length >= 2 && name.trim().length <= 100 &&
  typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
  typeof phone === "string" && phone.trim().length >= 7 && phone.trim().length <= 25 &&
  Number.isInteger(Number(persons)) && Number(persons) >= 1 && Number(persons) <= 20;

export const addPayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;
    const value = Number(amount);
    if (!validId(bookingId)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
    if (!Number.isFinite(value) || value <= 0) return res.status(400).json({ success: false, message: "Amount must be positive" });
    if (!["cash", "upi"].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Manual entries support cash or UPI only. Razorpay payments must be verified through checkout." });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    const remaining = Number(booking.amountRemaining);
    if (!Number.isFinite(remaining) || remaining <= 0 || value > remaining) {
      return res.status(400).json({ success: false, message: "Amount exceeds the remaining booking balance" });
    }

    const updated = await Booking.findOneAndUpdate(
      { _id: bookingId, amountRemaining: { $gte: value } },
      [
        { $set: {
          amountPaid: { $add: [{ $ifNull: ["$amountPaid", 0] }, value] },
          amountRemaining: { $subtract: ["$amountRemaining", value] }
        }},
        { $set: { paymentStatus: { $cond: [{ $lte: ["$amountRemaining", 0] }, "paid", "partial"] } } }
      ],
      { new: true }
    );
    if (!updated) return res.status(409).json({ success: false, message: "Booking balance changed; refresh and try again" });

    try {
      await Payment.create({
        bookingId, amount: value,
        paymentType: value >= Number(booking.totalAmount) ? "full" : value >= remaining ? "remaining" : "advance",
        paymentMethod, status: "success"
      });
    } catch (error) {
      console.error("Payment ledger write failed after balance update:", error);
      return res.status(500).json({ success: false, message: "Balance was updated but the payment record failed. Contact support before retrying." });
    }
    return res.json({ success: true, booking: updated });
  } catch (err) {
    console.error("Manual payment error:", err);
    return res.status(500).json({ success: false, message: "Payment could not be recorded" });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    res.json(await Payment.find().populate("bookingId").sort({ createdAt: -1 }));
  } catch (err) {
    console.error("Fetch payments error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch payments" });
  }
};

export const createRazorpayOrder = async (req, res) => {
  try {
    const { slotId, name, email, phone, persons, amount, currency = "INR", holdId } = req.body || {};
    if (!validId(slotId) || !validCustomer({ name, email, phone, persons })) {
      return res.status(400).json({ success: false, message: "Please provide valid booking details" });
    }
    if (currency !== "INR") return res.status(400).json({ success: false, message: "Only INR checkout is supported" });

    const slot = await TrekSlot.findById(slotId).populate("trekId");
    if (!slot?.trekId) return res.status(404).json({ success: false, message: "Trek date not found" });
    const count = Number(persons);
    const total = Number(slot.trekId.price) * count;
    const requested = Number(amount);
    if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(requested) || requested <= 0 || requested > total) {
      return res.status(400).json({ success: false, message: "Invalid payment amount" });
    }
    if (Math.round(requested * 100) < 100) return res.status(400).json({ success: false, message: "Minimum payment is ₹1" });

    const duplicate = await Booking.findOne({
      slotId, email: email.trim().toLowerCase(), bookingStatus: { $in: ["pending", "approved"] }
    });
    if (duplicate) return res.status(409).json({ success: false, message: "You already have a pending or approved booking for this trek date." });
    if (count > Number(slot.totalSeats) - Number(slot.bookedSeats || 0)) {
      return res.status(409).json({ success: false, message: "Not enough seats are available" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(requested * 100),
      currency: "INR",
      receipt: `ukh_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`,
      notes: { slotId: String(slot._id), persons: String(count) }
    });
    try {
      await PaymentOrder.create({
        orderId: order.id, slotId: slot._id, trekId: slot.trekId._id,
        name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(),
        persons: count, amountPaise: order.amount, currency: order.currency,
        holdId: typeof holdId === "string" ? holdId : null
      });
    } catch (error) {
      console.error("Could not persist checkout order:", error);
      return res.status(500).json({ success: false, message: "Could not prepare checkout. No booking has been created; please try again." });
    }
    return res.status(201).json({ success: true, order: { id: order.id, amount: order.amount, currency: order.currency } });
  } catch (err) {
    console.error("Razorpay order error:", err);
    return res.status(502).json({ success: false, message: "Unable to start payment. Please try again." });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  let checkout;
  let claimed = false;
  try {
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
    if (![orderId, paymentId, signature].every((v) => typeof v === "string" && v.length > 0)) {
      return res.status(400).json({ success: false, message: "Missing payment verification details" });
    }

    checkout = await PaymentOrder.findOne({ orderId });
    if (!checkout) return res.status(404).json({ success: false, message: "Checkout order not found" });
    if (checkout.status === "completed" && checkout.bookingId) {
      const booking = await Booking.findById(checkout.bookingId);
      if (booking) return res.json({ success: true, booking, alreadyProcessed: true });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return res.status(500).json({ success: false, message: "Payment verification is not configured" });
    const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
    const expectedBuf = Buffer.from(expected, "utf8");
    const signatureBuf = Buffer.from(signature, "utf8");
    if (expectedBuf.length !== signatureBuf.length || !crypto.timingSafeEqual(expectedBuf, signatureBuf)) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const [gatewayOrder, gatewayPayment] = await Promise.all([
      razorpay.orders.fetch(orderId), razorpay.payments.fetch(paymentId)
    ]);
    if (gatewayOrder.id !== checkout.orderId || gatewayPayment.order_id !== checkout.orderId ||
        Number(gatewayOrder.amount) !== checkout.amountPaise || Number(gatewayPayment.amount) !== checkout.amountPaise ||
        gatewayOrder.currency !== checkout.currency || gatewayPayment.currency !== checkout.currency ||
        gatewayPayment.status !== "captured") {
      return res.status(400).json({ success: false, message: "Payment is not captured for the expected order and amount. If money was deducted, contact support." });
    }

    const claim = await PaymentOrder.findOneAndUpdate(
      { _id: checkout._id, status: "pending" },
      { $set: { status: "processing", paymentId } },
      { new: true }
    );
    if (!claim) {
      const latest = await PaymentOrder.findById(checkout._id);
      if (latest?.status === "completed" && latest.bookingId) {
        const booking = await Booking.findById(latest.bookingId);
        if (booking) return res.json({ success: true, booking, alreadyProcessed: true });
      }
      return res.status(409).json({ success: false, message: "This checkout is already being processed. Please wait or contact support before retrying." });
    }
    claimed = true;

    const slot = await TrekSlot.findById(claim.slotId).populate("trekId");
    if (!slot?.trekId || String(slot.trekId._id) !== String(claim.trekId)) throw new Error("Trek date is no longer available");
    const duplicate = await Booking.findOne({
      slotId: claim.slotId, email: claim.email, bookingStatus: { $in: ["pending", "approved"] }
    });
    if (duplicate) {
      return res.status(409).json({ success: false, message: "A booking already exists. Contact support with your payment ID." });
    }
    if (claim.persons > Number(slot.totalSeats) - Number(slot.bookedSeats || 0)) {
      return res.status(409).json({ success: false, message: "Payment was captured but seats are no longer available. Contact support with your payment ID." });
    }

    const paid = claim.amountPaise / 100;
    const total = Number(slot.trekId.price) * claim.persons;
    if (!Number.isFinite(total) || total <= 0 || paid > total) throw new Error("Checkout amount no longer matches trek price");

    const booking = await Booking.create({
      name: claim.name, email: claim.email, phone: claim.phone, persons: claim.persons,
      slotId: claim.slotId, trekId: claim.trekId, totalAmount: total, amountPaid: paid,
      amountRemaining: Math.max(0, total - paid), paymentStatus: paid >= total ? "paid" : "partial"
    });
    await PaymentOrder.updateOne({ _id: claim._id }, { $set: { bookingId: booking._id } });

    await Payment.create({
      bookingId: booking._id, amount: paid, paymentType: paid >= total ? "full" : "advance",
      paymentMethod: "razorpay", transactionId: paymentId, status: "success"
    });

    const updatedSlot = await TrekSlot.findOneAndUpdate(
      { _id: claim.slotId, $expr: { $lte: [{ $add: [{ $ifNull: ["$bookedSeats", 0] }, claim.persons] }, "$totalSeats"] } },
      { $inc: { bookedSeats: claim.persons } }, { new: true }
    );
    if (!updatedSlot) {
      return res.status(409).json({ success: false, message: "Payment was captured but seats could not be reserved. Contact support with your payment ID." });
    }

    await PaymentOrder.updateOne({ _id: claim._id }, { $set: { status: "completed", bookingId: booking._id, paymentId } });
    try {
      if (process.env.EMAIL_USER && claim.email) {
        const { paymentReceiptEmail } = await import("../utils/emailTemplates.js");
        const transporter = (await import("../config/email.js")).default;
        await transporter.sendMail({
          from: `"UK Hikers" <${process.env.EMAIL_USER}>`, to: claim.email,
          subject: `Payment Receipt & Booking Confirmation - ${slot.trekId.title}`,
          html: paymentReceiptEmail(booking, slot.trekId)
        });
      }
    } catch (emailError) { console.error("Payment confirmation email failed:", emailError.message); }

    return res.json({ success: true, message: "Payment verified and booking created", booking });
  } catch (err) {
    console.error("Razorpay verification/finalization error:", err);
    // Do not blindly reset a claimed order: a booking may already exist and a retry could duplicate it.
    if (claimed && checkout?._id) console.error("Manual reconciliation may be needed for order:", checkout.orderId);
    return res.status(500).json({ success: false, message: "Payment finalization needs support. Keep your payment ID and contact UK Hikers." });
  }
};
