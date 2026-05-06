import Booking from "../models/Booking.js";
import TrekSlot from "../models/TrekSlot.js";
import Payment from "../models/Payment.js";
import transporter from "../config/email.js";
// import { paymentReceiptEmail } from "../utils/emailTemplates.js";
import { paymentReceiptEmail, bookingConfirmationNoPaymentEmail } from "../utils/emailTemplates.js";

// Temporary holds store (in production, use Redis)
const seatHolds = new Map(); // { slotId: [{ persons, expiresAt }] }

// Clean expired holds every minute
setInterval(() => {
  const now = Date.now();
  for (const [slotId, holds] of seatHolds.entries()) {
    const active = holds.filter(h => h.expiresAt > now);
    if (active.length === 0) {
      seatHolds.delete(slotId);
    } else {
      seatHolds.set(slotId, active);
    }
  }
}, 60000);

/* CHECK SEAT AVAILABILITY */
export const checkAvailability = async (req, res) => {
  try {
    const { slotId } = req.params;
    const slot = await TrekSlot.findById(slotId);

    if (!slot) {
      return res.status(404).json({ success: false, message: "Slot not found" });
    }

    const heldPersons = (seatHolds.get(slotId) || []).reduce((sum, h) => sum + h.persons, 0);
    const availableSeats = slot.totalSeats - slot.bookedSeats - heldPersons;

    res.json({
      success: true,
      availableSeats: Math.max(0, availableSeats),
      totalSeats: slot.totalSeats,
      bookedSeats: slot.bookedSeats,
      heldSeats: heldPersons,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to check availability" });
  }
};

/* HOLD SEATS (called when user starts booking) */
export const holdSeats = async (req, res) => {
  try {
    const { slotId, persons } = req.body;
    const slot = await TrekSlot.findById(slotId);

    if (!slot) {
      return res.status(404).json({ success: false, message: "Slot not found" });
    }

    const heldPersons = (seatHolds.get(slotId) || []).reduce((sum, h) => sum + h.persons, 0);
    const availableSeats = slot.totalSeats - slot.bookedSeats - heldPersons;

    if (persons > availableSeats) {
      return res.json({
        success: false,
        availableSeats: Math.max(0, availableSeats),
        message: ` ${heldSeats} no of seat(s) are currently being booked try after 5 minutes`,
      });
    }

    // Create hold
    const holdId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const holds = seatHolds.get(slotId) || [];
    holds.push({ holdId, persons, expiresAt: Date.now() + 5 * 60 * 1000 }); // 5 min hold
    seatHolds.set(slotId, holds);

    res.json({
      success: true,
      holdId,
      expiresIn: 600, // 10 minutes in seconds
      heldPersons: persons,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to hold seats" });
  }
};

/* RELEASE HOLD (called when user cancels or hold expires) */
export const releaseHold = async (req, res) => {
  try {
    const { slotId, holdId } = req.body;
    const holds = seatHolds.get(slotId) || [];
    seatHolds.set(slotId, holds.filter(h => h.holdId !== holdId));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to release hold" });
  }
};

/* CREATE BOOKING (updated with hold release) */
/* CREATE BOOKING (complete fixed version) */
export const createBooking = async (req, res) => {
  try {
    const { name, email, phone, persons, slotId, amountPaid = 0, holdId } = req.body;

    const slot = await TrekSlot.findById(slotId).populate("trekId");
    if (!slot) {
      return res.status(404).json({ success: false, message: "Slot not found" });
    }

    // 🔁 Duplicate booking check (fix #7)
    const existingBooking = await Booking.findOne({
      slotId,
      email,
      bookingStatus: { $in: ["pending", "approved"] }
    });
    if (existingBooking) {
      // Release hold if exists
      if (holdId) {
        const holds = seatHolds.get(slotId) || [];
        seatHolds.set(slotId, holds.filter(h => h.holdId !== holdId));
      }
      return res.status(400).json({
        success: false,
        message: "You already have a pending or approved booking for this trek date."
      });
    }

    // Check real availability
    const actualSeatsLeft = slot.totalSeats - slot.bookedSeats;
    if (persons > actualSeatsLeft) {
      if (holdId) {
        const holds = seatHolds.get(slotId) || [];
        seatHolds.set(slotId, holds.filter(h => h.holdId !== holdId));
      }
      return res.status(400).json({
        success: false,
        message: `Sorry, only ${actualSeatsLeft} seat(s) available now.`
      });
    }

    const trekPrice = slot.trekId.price;
    const totalAmount = trekPrice * persons;
    const remaining = totalAmount - amountPaid;

    const booking = await Booking.create({
      name, email, phone, persons,
      slotId, trekId: slot.trekId._id,
      totalAmount, amountPaid,
      amountRemaining: remaining,
      paymentStatus: amountPaid === 0 ? "pending" : amountPaid < totalAmount ? "partial" : "paid"
    });

    if (amountPaid > 0) {
      await Payment.create({
        bookingId: booking._id,
        amount: amountPaid,
        paymentType: amountPaid === totalAmount ? "full" : "advance"
      });
    }

    // Deduct seats and release hold
    slot.bookedSeats += Number(persons);
    await slot.save();

    if (holdId) {
      const holds = seatHolds.get(slotId) || [];
      seatHolds.set(slotId, holds.filter(h => h.holdId !== holdId));
    }

    // Send email (as before)
    if (process.env.EMAIL_USER && email) {
      try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
          const transporter = (await import("../config/email.js")).default;
          if (amountPaid > 0) {
            await transporter.sendMail({
              from: `"UK Hikers" <${process.env.EMAIL_USER}>`,
              to: email,
              subject: `Payment Receipt & Booking Confirmation - ${slot.trekId.title}`,
              html: (await import("../utils/emailTemplates.js")).paymentReceiptEmail(booking, slot.trekId)
            });
          } else {
            await transporter.sendMail({
              from: `"UK Hikers" <${process.env.EMAIL_USER}>`,
              to: email,
              subject: `Booking Confirmation - ${slot.trekId.title}`,
              html: (await import("../utils/emailTemplates.js")).bookingConfirmationNoPaymentEmail(booking, slot.trekId)
            });
          }
        }
      } catch (emailErr) {
        console.error(`Email failed: ${emailErr.message}`);
      }
    }

    // ✅ Send success response
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: { _id: booking._id, totalAmount: booking.totalAmount, amountPaid: booking.amountPaid }
    });

  } catch (err) {
    console.error("Booking creation error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create booking: " + err.message
    });
  }
};