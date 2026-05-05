import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

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