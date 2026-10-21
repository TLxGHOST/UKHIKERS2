import Booking from "../models/Booking.js";
import TrekSlot from "../models/TrekSlot.js";
import transporter from "../config/email.js";
import { bookingConfirmationNoPaymentEmail } from "../utils/emailTemplates.js";

// Temporary in-memory holds are advisory only; confirmed seat allocation is stored in MongoDB.
const seatHolds = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [slotId, holds] of seatHolds.entries()) {
    const active = holds.filter((hold) => hold.expiresAt > now);
    if (active.length === 0) seatHolds.delete(slotId);
    else seatHolds.set(slotId, active);
  }
}, 60_000).unref?.();

const releaseSeatHold = (slotId, holdId) => {
  if (!slotId || !holdId) return;
  const holds = seatHolds.get(String(slotId)) || [];
  const remaining = holds.filter((hold) => hold.holdId !== holdId);
  if (remaining.length) seatHolds.set(String(slotId), remaining);
  else seatHolds.delete(String(slotId));
};

const validSlotId = (value) => typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

export const checkAvailability = async (req, res) => {
  try {
    const { slotId } = req.params;
    if (!validSlotId(slotId)) return res.status(400).json({ success: false, message: "Invalid slot ID" });
    const slot = await TrekSlot.findById(slotId);
    if (!slot) return res.status(404).json({ success: false, message: "Slot not found" });

    const heldPersons = (seatHolds.get(String(slotId)) || []).reduce((sum, hold) => sum + hold.persons, 0);
    const availableSeats = Number(slot.totalSeats) - Number(slot.bookedSeats || 0) - heldPersons;
    return res.json({
      success: true,
      availableSeats: Math.max(0, availableSeats),
      totalSeats: slot.totalSeats,
      bookedSeats: slot.bookedSeats || 0,
      heldSeats: heldPersons,
    });
  } catch (error) {
    console.error("Availability check failed:", error);
    return res.status(500).json({ success: false, message: "Failed to check availability" });
  }
};

export const holdSeats = async (req, res) => {
  try {
    const { slotId, persons } = req.body || {};
    const count = Number(persons);
    if (!validSlotId(slotId) || !Number.isInteger(count) || count < 1 || count > 20) {
      return res.status(400).json({ success: false, message: "Please provide a valid slot ID and person count" });
    }

    const slot = await TrekSlot.findById(slotId);
    if (!slot) return res.status(404).json({ success: false, message: "Slot not found" });
    const holds = (seatHolds.get(String(slotId)) || []).filter((hold) => hold.expiresAt > Date.now());
    const heldPersons = holds.reduce((sum, hold) => sum + hold.persons, 0);
    const availableSeats = Number(slot.totalSeats) - Number(slot.bookedSeats || 0) - heldPersons;

    if (count > availableSeats) {
      return res.status(409).json({
        success: false,
        availableSeats: Math.max(0, availableSeats),
        message: `Only ${Math.max(0, availableSeats)} seat(s) are currently available. Please try again later.`,
      });
    }

    const holdId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
    holds.push({ holdId, persons: count, expiresAt: Date.now() + 5 * 60 * 1000 });
    seatHolds.set(String(slotId), holds);
    return res.json({ success: true, holdId, expiresIn: 300, heldPersons: count });
  } catch (error) {
    console.error("Seat hold failed:", error);
    return res.status(500).json({ success: false, message: "Failed to hold seats" });
  }
};

export const releaseHold = async (req, res) => {
  try {
    const { slotId, holdId } = req.body || {};
    if (typeof slotId !== "string" || typeof holdId !== "string") {
      return res.status(400).json({ success: false, message: "slotId and holdId are required" });
    }
    releaseSeatHold(slotId, holdId);
    return res.json({ success: true });
  } catch (error) {
    console.error("Seat hold release failed:", error);
    return res.status(500).json({ success: false, message: "Failed to release hold" });
  }
};

/* A public request is pending until an admin approves it. It never allocates seats. */
export const createBooking = async (req, res) => {
  let holdId;
  let slotId;
  try {
    const { name, email, phone, persons, holdId: requestedHoldId } = req.body || {};
    slotId = req.body?.slotId;
    holdId = requestedHoldId;
    const count = Number(persons);

    if (Number(req.body?.amountPaid ?? 0) !== 0) {
      return res.status(400).json({ success: false, message: "Payment is available only after admin approval." });
    }
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100 ||
        typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        typeof phone !== "string" || phone.trim().length < 7 || phone.trim().length > 25 ||
        !Number.isInteger(count) || count < 1 || count > 20 || !validSlotId(slotId)) {
      return res.status(400).json({ success: false, message: "Please provide valid booking details." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const slot = await TrekSlot.findById(slotId).populate("trekId");
    if (!slot?.trekId) return res.status(404).json({ success: false, message: "Trek date not found" });

    const existingBooking = await Booking.findOne({
      slotId,
      email: normalizedEmail,
      bookingStatus: { $in: ["pending", "approved"] },
    });
    if (existingBooking) {
      releaseSeatHold(slotId, holdId);
      return res.status(409).json({ success: false, message: "You already have a pending or approved booking for this trek date." });
    }

    // This is an informational check, not a reservation. Capacity is rechecked atomically at approval.
    const availableSeats = Number(slot.totalSeats) - Number(slot.bookedSeats || 0);
    if (count > availableSeats) {
      releaseSeatHold(slotId, holdId);
      return res.status(409).json({ success: false, message: `Sorry, only ${Math.max(0, availableSeats)} seat(s) are available right now.` });
    }

    const price = Number(slot.trekId.price);
    const totalAmount = price * count;
    if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(totalAmount) || totalAmount <= 0) {
      releaseSeatHold(slotId, holdId);
      return res.status(409).json({ success: false, message: "The price for this trek is not configured correctly." });
    }

    const booking = await Booking.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      persons: count,
      slotId: slot._id,
      trekId: slot.trekId._id,
      totalAmount,
      amountPaid: 0,
      amountRemaining: totalAmount,
      paymentStatus: "pending",
      bookingStatus: "pending",
    });
    releaseSeatHold(slotId, holdId);

    let emailSent = false;
    let emailWarning = null;
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      emailWarning = "Booking saved, but email is not configured on the server.";
      console.error(emailWarning);
    } else {
      try {
        await transporter.sendMail({
          from: `"UK Hikers" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
          to: normalizedEmail,
          subject: `Booking Request Received - ${slot.trekId.title}`,
          html: bookingConfirmationNoPaymentEmail({ ...booking.toObject(), slotId: slot }, slot.trekId),
        });
        emailSent = true;
      } catch (emailError) {
        console.error("Booking request email failed:", emailError);
        emailWarning = "Booking request saved, but the confirmation email could not be sent. Please keep your booking ID.";
      }
    }

    return res.status(201).json({
      success: true,
      emailSent,
      emailWarning,
      message: emailSent ? "Booking request submitted. A confirmation email was sent; seats are reserved only after admin approval." : "Booking request submitted. Seats are reserved only after admin approval.",
      booking: {
        _id: booking._id,
        slotId: booking.slotId,
        trekId: booking.trekId,
        persons: booking.persons,
        totalAmount: booking.totalAmount,
        amountPaid: booking.amountPaid,
        amountRemaining: booking.amountRemaining,
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.bookingStatus,
      },
    });
  } catch (error) {
    releaseSeatHold(slotId, holdId);
    console.error("Booking creation error:", error);
    return res.status(500).json({ success: false, message: "Failed to create booking" });
  }
};
