import Booking from "../models/Booking.js";
import TrekSlot from "../models/TrekSlot.js";
import Payment from "../models/Payment.js";

export const createBooking = async (req, res) => {
  try {

    const { name, email, phone, persons, slotId, amountPaid = 0 } = req.body;

    const slot = await TrekSlot.findById(slotId).populate("trekId");

    if (!slot) {
      return res.status(404).json({ success: false, message: "Slot not found" });
    }

    const seatsLeft = slot.totalSeats - slot.bookedSeats;

    if (persons > seatsLeft) {
      return res.status(400).json({
        success: false,
        message: "Not enough seats"
      });
    }

    const trekPrice = slot.trekId.price;
    const totalAmount = trekPrice * persons;
    const remaining = totalAmount - amountPaid;

    const booking = await Booking.create({
      name,
      email,
      phone,
      persons,
      slotId,
      trekId: slot.trekId._id,
      totalAmount,
      amountPaid,
      amountRemaining: remaining,
      paymentStatus:
        amountPaid === 0
          ? "pending"
          : amountPaid < totalAmount
            ? "partial"
            : "paid"
    });

    // 💳 Payment log
    if (amountPaid > 0) {
      await Payment.create({
        bookingId: booking._id,
        amount: amountPaid,
        paymentType: amountPaid === totalAmount ? "full" : "advance"
      });
    }

    slot.bookedSeats += Number(persons);
    await slot.save();

    res.json({ success: true, booking });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Booking failed" });
  }
};