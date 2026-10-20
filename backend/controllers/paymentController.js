import mongoose from "mongoose";
import crypto from "crypto";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import PaymentOrder from "../models/PaymentOrder.js";
import razorpay from "../config/razorpay.js";
import transporter from "../config/email.js";
import { paymentReceiptEmail } from "../utils/emailTemplates.js";

const validId = (value) => typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
const validAmount = (value) => Number.isFinite(Number(value)) && Number(value) > 0;

const sendPaymentReceipt = async (bookingId) => {
  if (!process.env.EMAIL_USER) return;
  try {
    const booking = await Booking.findById(bookingId).populate("trekId").populate("slotId");
    if (!booking?.email || !booking.trekId) return;
    await transporter.sendMail({
      from: `"UK Hikers" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: `Payment Receipt - ${booking.trekId.title}`,
      html: paymentReceiptEmail(booking, booking.trekId),
    });
  } catch (error) {
    console.error("Payment receipt email failed:", error.message);
  }
};

export const addPayment = async (req, res) => {
  const { bookingId, amount, paymentMethod } = req.body || {};
  const value = Number(amount);
  if (!validId(bookingId)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
  if (!validAmount(value)) return res.status(400).json({ success: false, message: "Amount must be positive" });
  if (!Number.isFinite(value * 100) || Math.abs(Math.round(value * 100) - value * 100) > 0.000001) {
    return res.status(400).json({ success: false, message: "Amount must not have more than two decimal places" });
  }
  if (!["cash", "upi"].includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: "Manual entries support cash or UPI only. Razorpay payments must be verified through checkout." });
  }

  const session = await mongoose.startSession();
  let updatedBooking = null;
  let failure = null;
  try {
    await session.withTransaction(async () => {
      failure = null;
      const booking = await Booking.findById(bookingId).session(session);
      if (!booking) {
        failure = { status: 404, message: "Booking not found" };
        throw new Error("MANUAL_PAYMENT_ABORT");
      }
      if (booking.bookingStatus !== "approved") {
        failure = { status: 409, message: "Payment can be recorded only after admin approval." };
        throw new Error("MANUAL_PAYMENT_ABORT");
      }
      const remaining = Number(booking.amountRemaining);
      if (!Number.isFinite(remaining) || remaining <= 0 || value > remaining + 0.000001) {
        failure = { status: 400, message: "Amount exceeds the remaining booking balance" };
        throw new Error("MANUAL_PAYMENT_ABORT");
      }

      const update = await Booking.findOneAndUpdate(
        { _id: bookingId, bookingStatus: "approved", amountRemaining: { $gte: value } },
        [
          { $set: {
            amountPaid: { $add: [{ $ifNull: ["$amountPaid", 0] }, value] },
            amountRemaining: { $subtract: ["$amountRemaining", value] },
          } },
          { $set: {
            paymentStatus: { $cond: [{ $lte: ["$amountRemaining", 0.000001] }, "paid", "partial"] },
            amountRemaining: { $cond: [{ $lte: ["$amountRemaining", 0.000001] }, 0, "$amountRemaining"] },
          } },
        ],
        { new: true, session }
      );
      if (!update) {
        failure = { status: 409, message: "Booking balance changed; refresh and try again." };
        throw new Error("MANUAL_PAYMENT_ABORT");
      }
      const type = value >= remaining - 0.000001
        ? (Number(booking.amountPaid || 0) > 0 ? "remaining" : "full")
        : (Number(booking.amountPaid || 0) > 0 ? "remaining" : "advance");
      await Payment.create([{
        bookingId,
        amount: value,
        paymentType: type,
        paymentMethod,
        status: "success",
      }], { session });
      updatedBooking = update;
    });
    if (failure) return res.status(failure.status).json({ success: false, message: failure.message });
    return res.json({ success: true, booking: updatedBooking });
  } catch (error) {
    if (!failure) console.error("Manual payment transaction failed:", error);
    if (failure) return res.status(failure.status).json({ success: false, message: failure.message });
    return res.status(500).json({ success: false, message: "Payment could not be recorded; no partial balance update was committed." });
  } finally {
    await session.endSession();
  }
};

export const getAllPayments = async (req, res) => {
  try {
    return res.json(await Payment.find().populate("bookingId").sort({ createdAt: -1 }));
  } catch (error) {
    console.error("Fetch payments error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch payments" });
  }
};

/* Creates checkout only for an already-approved booking. The client never supplies customer or trek pricing. */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { bookingId, amount, currency = "INR" } = req.body || {};
    if (!validId(bookingId)) return res.status(400).json({ success: false, message: "A valid approved booking ID is required" });
    if (currency !== "INR") return res.status(400).json({ success: false, message: "Only INR checkout is supported" });

    const booking = await Booking.findById(bookingId).populate("slotId").populate("trekId");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.bookingStatus !== "approved") {
      return res.status(409).json({ success: false, message: "Payment is available only after admin approval." });
    }
    if (!booking.slotId || !booking.trekId || !Number.isInteger(Number(booking.persons)) || Number(booking.persons) < 1) {
      return res.status(409).json({ success: false, message: "Booking details are incomplete. Contact support." });
    }

    const remaining = Number(booking.amountRemaining);
    if (!Number.isFinite(remaining) || remaining <= 0) {
      return res.status(409).json({ success: false, message: "This booking has no outstanding balance." });
    }
    const requested = amount === undefined || amount === null || amount === "" ? remaining : Number(amount);
    if (!validAmount(requested) || requested > remaining + 0.000001 || Math.round(requested * 100) < 100 || Math.abs(Math.round(requested * 100) - requested * 100) > 0.000001) {
      return res.status(400).json({ success: false, message: "Enter a valid payment amount not exceeding the remaining balance (minimum ₹1)." });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!process.env.RAZORPAY_KEY_ID || !secret) {
      return res.status(503).json({ success: false, message: "Online payment is not configured. Please contact support." });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(requested * 100),
      currency: "INR",
      receipt: `ukh_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`,
      notes: { bookingId: String(booking._id), slotId: String(booking.slotId._id) },
    });

    try {
      await PaymentOrder.create({
        orderId: order.id,
        slotId: booking.slotId._id,
        trekId: booking.trekId._id,
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        persons: booking.persons,
        totalAmount: booking.totalAmount,
        amountPaise: order.amount,
        currency: order.currency,
        holdId: null,
        bookingId: booking._id,
      });
    } catch (error) {
      console.error("Could not persist checkout order:", error);
      return res.status(500).json({ success: false, message: "Could not prepare checkout. Please try again." });
    }

    return res.status(201).json({
      success: true,
      order: { id: order.id, amount: order.amount, currency: order.currency },
      booking: { _id: booking._id, totalAmount: booking.totalAmount, amountRemaining: remaining },
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    return res.status(502).json({ success: false, message: "Unable to start payment. Please try again." });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  let checkout;
  try {
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
    if (![orderId, paymentId, signature].every((value) => typeof value === "string" && value.length > 0)) {
      return res.status(400).json({ success: false, message: "Missing payment verification details" });
    }

    checkout = await PaymentOrder.findOne({ orderId });
    if (!checkout) return res.status(404).json({ success: false, message: "Checkout order not found" });
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return res.status(503).json({ success: false, message: "Payment verification is not configured" });
    const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
    const expectedBuf = Buffer.from(expected, "utf8");
    const signatureBuf = Buffer.from(signature, "utf8");
    if (expectedBuf.length !== signatureBuf.length || !crypto.timingSafeEqual(expectedBuf, signatureBuf)) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // Do not return booking data for an idempotent retry until the Razorpay signature is verified.
    if (checkout.status === "completed" && checkout.bookingId) {
      if (checkout.paymentId && checkout.paymentId !== paymentId) {
        return res.status(409).json({ success: false, message: "This order was already completed with a different payment ID." });
      }
      const booking = await Booking.findById(checkout.bookingId);
      if (booking) return res.json({ success: true, booking, alreadyProcessed: true });
    }

    const [gatewayOrder, gatewayPayment] = await Promise.all([
      razorpay.orders.fetch(orderId),
      razorpay.payments.fetch(paymentId),
    ]);
    if (gatewayOrder.id !== checkout.orderId || gatewayPayment.order_id !== checkout.orderId ||
        Number(gatewayOrder.amount) !== Number(checkout.amountPaise) || Number(gatewayPayment.amount) !== Number(checkout.amountPaise) ||
        gatewayOrder.currency !== checkout.currency || gatewayPayment.currency !== checkout.currency ||
        gatewayPayment.status !== "captured") {
      return res.status(400).json({ success: false, message: "Payment is not captured for the expected order and amount. If money was deducted, contact support." });
    }

    const paid = Number(checkout.amountPaise) / 100;
    const session = await mongoose.startSession();
    let finalBookingId = null;
    let alreadyProcessed = false;
    let failure = null;
    try {
      await session.withTransaction(async () => {
        failure = null;
        const order = await PaymentOrder.findById(checkout._id).session(session);
        if (!order) {
          failure = { status: 404, message: "Checkout order not found" };
          throw new Error("PAYMENT_FINALIZATION_ABORT");
        }
        if (order.status === "completed" && order.bookingId) {
          if (order.paymentId && order.paymentId !== paymentId) {
            failure = { status: 409, message: "This order was already completed with a different payment ID." };
            throw new Error("PAYMENT_FINALIZATION_ABORT");
          }
          finalBookingId = order.bookingId;
          alreadyProcessed = true;
          return;
        }
        if (order.paymentId && order.paymentId !== paymentId) {
          failure = { status: 409, message: "This checkout is associated with a different payment ID." };
          throw new Error("PAYMENT_FINALIZATION_ABORT");
        }
        if (!["pending", "processing"].includes(order.status)) {
          failure = { status: 409, message: "This checkout cannot be processed in its current state." };
          throw new Error("PAYMENT_FINALIZATION_ABORT");
        }
        if (!order.bookingId) {
          failure = { status: 409, message: "This checkout is not linked to an approved booking. Contact support with your payment ID." };
          throw new Error("PAYMENT_FINALIZATION_ABORT");
        }

        const booking = await Booking.findById(order.bookingId).session(session);
        if (!booking) {
          failure = { status: 404, message: "The booking linked to this checkout no longer exists. Contact support with your payment ID." };
          throw new Error("PAYMENT_FINALIZATION_ABORT");
        }
        if (booking.bookingStatus !== "approved") {
          failure = { status: 409, message: "Payment cannot be applied because this booking is not approved. Contact support with your payment ID." };
          throw new Error("PAYMENT_FINALIZATION_ABORT");
        }
        if (String(booking.slotId) !== String(order.slotId) || String(booking.trekId) !== String(order.trekId) ||
            Number(booking.persons) !== Number(order.persons)) {
          failure = { status: 409, message: "Checkout details do not match the approved booking. Contact support with your payment ID." };
          throw new Error("PAYMENT_FINALIZATION_ABORT");
        }
        const remaining = Number(booking.amountRemaining);
        if (!Number.isFinite(remaining) || remaining <= 0 || paid > remaining + 0.000001) {
          failure = { status: 409, message: "The captured payment exceeds the current outstanding balance. Do not retry; contact support with your payment ID." };
          throw new Error("PAYMENT_FINALIZATION_ABORT");
        }

        const updatedBooking = await Booking.findOneAndUpdate(
          { _id: booking._id, bookingStatus: "approved", amountRemaining: { $gte: paid } },
          [
            { $set: {
              amountPaid: { $add: [{ $ifNull: ["$amountPaid", 0] }, paid] },
              amountRemaining: { $subtract: ["$amountRemaining", paid] },
            } },
            { $set: {
              paymentStatus: { $cond: [{ $lte: ["$amountRemaining", 0.000001] }, "paid", "partial"] },
              amountRemaining: { $cond: [{ $lte: ["$amountRemaining", 0.000001] }, 0, "$amountRemaining"] },
            } },
          ],
          { new: true, session }
        );
        if (!updatedBooking) {
          failure = { status: 409, message: "Booking balance changed during payment processing. Contact support with your payment ID." };
          throw new Error("PAYMENT_FINALIZATION_ABORT");
        }

        const paymentType = paid >= remaining - 0.000001
          ? (Number(booking.amountPaid || 0) > 0 ? "remaining" : "full")
          : (Number(booking.amountPaid || 0) > 0 ? "remaining" : "advance");
        await Payment.create([{
          bookingId: booking._id,
          amount: paid,
          paymentType,
          paymentMethod: "razorpay",
          transactionId: paymentId,
          status: "success",
        }], { session });

        const orderUpdate = await PaymentOrder.updateOne(
          { _id: order._id, status: { $in: ["pending", "processing"] } },
          { $set: { status: "completed", bookingId: booking._id, paymentId } },
          { session }
        );
        if (orderUpdate.modifiedCount !== 1) {
          failure = { status: 409, message: "Checkout status changed during finalization. Contact support with your payment ID." };
          throw new Error("PAYMENT_FINALIZATION_ABORT");
        }
        finalBookingId = booking._id;
      });
    } catch (error) {
      if (!failure) console.error("Payment finalization transaction failed:", error);
      if (failure) return res.status(failure.status).json({ success: false, message: failure.message });
      return res.status(500).json({ success: false, message: "Payment was captured but could not be finalized safely. Keep your payment ID and contact support; do not pay again." });
    } finally {
      await session.endSession();
    }

    const booking = await Booking.findById(finalBookingId).populate("trekId").populate("slotId");
    if (!booking) return res.status(500).json({ success: false, message: "Payment was recorded but booking details could not be loaded. Contact support." });
    if (!alreadyProcessed) await sendPaymentReceipt(booking._id);
    return res.json({ success: true, message: alreadyProcessed ? "Payment was already processed" : "Payment verified and existing booking updated", booking, alreadyProcessed });
  } catch (error) {
    console.error("Razorpay verification failed:", error);
    return res.status(502).json({ success: false, message: "Unable to verify payment right now. If money was deducted, keep your payment ID and contact support before retrying." });
  }
};
