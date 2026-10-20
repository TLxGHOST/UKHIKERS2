import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import Booking from "../models/Booking.js";
import TrekSlot from "../models/TrekSlot.js";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import transporter from "../config/email.js";
import { bookingConfirmationEmail, bookingInvoiceAttachmentHtml } from "../utils/emailTemplates.js";

const validId = (value) => typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("trekId", "title")
      .populate("slotId", "date totalSeats bookedSeats")
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Fetch bookings failed:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};

export const approveBooking = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });

  const session = await mongoose.startSession();
  let approvedBookingId = null;
  let failure = null;
  try {
    await session.withTransaction(async () => {
      failure = null;
      const booking = await Booking.findById(req.params.id).session(session);
      if (!booking) {
        failure = { status: 404, message: "Booking not found" };
        throw new Error("BOOKING_APPROVAL_ABORT");
      }
      if (booking.bookingStatus !== "pending") {
        failure = { status: 409, message: `Only pending bookings can be approved. Current status: ${booking.bookingStatus}.` };
        throw new Error("BOOKING_APPROVAL_ABORT");
      }

      const count = Number(booking.persons);
      if (!Number.isInteger(count) || count < 1) {
        failure = { status: 409, message: "Booking has an invalid person count" };
        throw new Error("BOOKING_APPROVAL_ABORT");
      }

      const slot = await TrekSlot.findOneAndUpdate(
        {
          _id: booking.slotId,
          $expr: {
            $lte: [
              { $add: [{ $ifNull: ["$bookedSeats", 0] }, count] },
              "$totalSeats",
            ],
          },
        },
        { $inc: { bookedSeats: count } },
        { new: true, session }
      );
      if (!slot) {
        const existingSlot = await TrekSlot.findById(booking.slotId).session(session);
        failure = existingSlot
          ? { status: 409, message: "Not enough seats remain to approve this booking. No seats were reserved." }
          : { status: 404, message: "The trek date for this booking no longer exists." };
        throw new Error("BOOKING_APPROVAL_ABORT");
      }

      const update = await Booking.updateOne(
        { _id: booking._id, bookingStatus: "pending" },
        { $set: { bookingStatus: "approved" } },
        { session }
      );
      if (update.modifiedCount !== 1) {
        failure = { status: 409, message: "Booking status changed during approval. Refresh and try again." };
        throw new Error("BOOKING_APPROVAL_ABORT");
      }
      approvedBookingId = booking._id;
    });
  } catch (error) {
    if (!failure) console.error("Booking approval transaction failed:", error);
    if (failure) return res.status(failure.status).json({ success: false, message: failure.message });
    return res.status(500).json({ success: false, message: "Approval failed. No partial seat allocation was committed." });
  } finally {
    await session.endSession();
  }

  try {
    const booking = await Booking.findById(approvedBookingId).populate("trekId").populate("slotId");
    let invoice = null;

    // Create an immutable invoice snapshot after approval commits. Email failures
    // must never roll back the already-approved booking or its seat allocation.
    if (booking) {
      try {
        invoice = await Invoice.findOne({ bookingId: booking._id });
        if (!invoice) {
          const totalAmount = Number(booking.totalAmount);
          const amountPaid = Number(booking.amountPaid || 0);
          const amountRemaining = Number(booking.amountRemaining ?? Math.max(0, totalAmount - amountPaid));
          const trekDate = booking.slotId?.date ? new Date(booking.slotId.date) : null;
          const generatedBy = req.user?.id || req.user?._id;
          if (!generatedBy) throw new Error("Admin identity missing; cannot create invoice");
          invoice = await Invoice.create({
            invoiceNumber: `UKH-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
            bookingId: booking._id,
            generatedBy,
            customer: { name: booking.name || "Customer", email: booking.email || "", phone: booking.phone || "" },
            trek: {
              name: String(booking.trekId?.title || booking.trekId?.name || "Trek booking"),
              date: trekDate && !Number.isNaN(trekDate.getTime()) ? trekDate : null,
              persons: Number(booking.persons || 1),
            },
            amounts: { currency: "INR", totalAmount, amountPaidAtGeneration: amountPaid, amountRemainingAtGeneration: amountRemaining },
            paymentStatusAtGeneration: booking.paymentStatus || "pending",
            bookingStatusAtGeneration: booking.bookingStatus || "approved",
          });
        }
      } catch (invoiceError) {
        if (invoiceError?.code === 11000) {
          invoice = await Invoice.findOne({ bookingId: booking._id }).catch(() => null);
        }
        if (!invoice) console.error("Approval invoice creation failed:", invoiceError.message);
      }
    }

    if (process.env.EMAIL_USER && booking?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email)) {
      try {
        await transporter.sendMail({
          from: `"UK Hikers" <${process.env.EMAIL_USER}>`,
          to: booking.email,
          subject: `Booking Approved - ${booking.trekId?.title || "Your Trek"}`,
          html: bookingConfirmationEmail(booking, booking.trekId, invoice),
          attachments: invoice ? [{
            filename: `${invoice.invoiceNumber}.html`,
            content: bookingInvoiceAttachmentHtml(booking, booking.trekId, invoice),
            contentType: "text/html; charset=utf-8",
          }] : [],
        });
      } catch (emailError) {
        console.error("Approval email or invoice attachment failed:", emailError.message);
      }
    }
    return res.json({ success: true, message: "Booking approved and seats reserved", data: booking });
  } catch (error) {
    console.error("Post-approval response failed:", error);
    return res.status(500).json({ success: false, message: "Booking was approved, but its details could not be loaded. Refresh the booking list." });
  }
};

export const rejectBooking = async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, bookingStatus: "pending" },
      { $set: { bookingStatus: "rejected" } },
      { new: true }
    );
    if (!booking) {
      const exists = await Booking.exists({ _id: req.params.id });
      return res.status(exists ? 409 : 404).json({
        success: false,
        message: exists ? "Only pending bookings can be rejected." : "Booking not found",
      });
    }
    return res.json({ success: true, message: "Booking rejected; no seats were reserved." });
  } catch (error) {
    console.error("Booking rejection failed:", error);
    return res.status(500).json({ success: false, message: "Reject failed" });
  }
};

// Legacy staff action: records a cash payment entry and updates the balance atomically.
export const markPaymentComplete = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
  const session = await mongoose.startSession();
  let updatedBooking = null;
  let failure = null;
  try {
    await session.withTransaction(async () => {
      failure = null;
      const booking = await Booking.findById(req.params.id).session(session);
      if (!booking) {
        failure = { status: 404, message: "Booking not found" };
        throw new Error("MANUAL_PAYMENT_ABORT");
      }
      if (booking.bookingStatus !== "approved") {
        failure = { status: 409, message: "Only approved bookings can have payments recorded." };
        throw new Error("MANUAL_PAYMENT_ABORT");
      }
      const remaining = Number(booking.amountRemaining || 0);
      if (remaining <= 0) {
        updatedBooking = booking;
        return;
      }
      const update = await Booking.updateOne(
        { _id: booking._id, bookingStatus: "approved", amountRemaining: { $gte: remaining } },
        { $set: { amountPaid: Number(booking.amountPaid || 0) + remaining, amountRemaining: 0, paymentStatus: "paid" } },
        { session }
      );
      if (update.modifiedCount !== 1) {
        failure = { status: 409, message: "Booking balance changed; refresh and try again." };
        throw new Error("MANUAL_PAYMENT_ABORT");
      }
      await Payment.create([{
        bookingId: booking._id,
        amount: remaining,
        paymentType: Number(booking.amountPaid || 0) > 0 ? "remaining" : "full",
        paymentMethod: "cash",
        transactionId: `admin-manual-${booking._id}-${new mongoose.Types.ObjectId()}`,
        status: "success",
      }], { session });
      updatedBooking = await Booking.findById(booking._id).session(session);
    });
    if (failure) return res.status(failure.status).json({ success: false, message: failure.message });
    return res.json({ success: true, data: updatedBooking, message: "Payment recorded" });
  } catch (error) {
    if (!failure) console.error("Manual payment transaction failed:", error);
    if (failure) return res.status(failure.status).json({ success: false, message: failure.message });
    return res.status(500).json({ success: false, message: "Payment update failed; no partial balance update was committed." });
  } finally {
    await session.endSession();
  }
};
