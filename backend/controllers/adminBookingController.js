import Booking from "../models/Booking.js";

/* GET ALL */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("trekId", "title")
      .populate("slotId", "date")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings"
    });
  }
};

/* APPROVE */
export const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { bookingStatus: "approved" },
      { new: true }
    );

    res.json({
      success: true,
      data: booking
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Approval failed"
    });
  }
};

/* REJECT */
export const rejectBooking = async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.id, {
      bookingStatus: "rejected"
    });

    res.json({ success: true });
  } catch {
    res.status(500).json({
      success: false,
      message: "Reject failed"
    });
  }
};

/* MARK PAID */
export const markPaymentComplete = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: "paid" },
      { new: true }
    );

    res.json({
      success: true,
      data: booking
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Payment update failed"
    });
  }
};