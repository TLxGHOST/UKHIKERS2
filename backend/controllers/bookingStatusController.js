import Booking from "../models/Booking.js";

// Lookup booking by ID + email/phone (no auth needed)
export const lookupBooking = async (req, res) => {
  try {
    const { bookingId, identifier } = req.body; // identifier = email or phone

    const booking = await Booking.findOne({
      _id: bookingId,
      $or: [{ email: identifier }, { phone: identifier }]
    })
      .populate("trekId", "title imageUrl price duration difficulty location")
      .populate("slotId", "date");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found. Check your Booking ID and email/phone."
      });
    }

    res.json({
      success: true,
      data: {
        _id: booking._id,
        name: booking.name,
        trek: booking.trekId,
        slotDate: booking.slotId?.date,
        persons: booking.persons,
        totalAmount: booking.totalAmount,
        amountPaid: booking.amountPaid,
        amountRemaining: booking.amountRemaining,
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.bookingStatus,
        createdAt: booking.createdAt,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lookup failed" });
  }
};