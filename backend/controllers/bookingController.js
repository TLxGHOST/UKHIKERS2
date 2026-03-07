import Booking from "../models/Booking.js";
import TrekSlot from "../models/TrekSlot.js";

export const createBooking = async (req, res) => {

  try {

    const { name, email, phone, persons, slotId, amountPaid } = req.body;

    /* FIND SLOT */

    const slot = await TrekSlot.findById(slotId);

    if (!slot) {
      return res.status(404).json({
        success:false,
        message:"Slot not found"
      });
    }

    /* CALCULATE REMAINING SEATS */

    const seatsLeft = slot.totalSeats - slot.bookedSeats;

    if (persons > seatsLeft) {
      return res.status(400).json({
        success:false,
        message:"Not enough seats available"
      });
    }

    /* CREATE BOOKING */

    const booking = await Booking.create({

      name,
      email,
      phone,

      persons,

      slotId,
      trekId: slot.trekId,

      amountPaid,

      paymentStatus: amountPaid > 0 ? "partial" : "pending"

    });

    /* REDUCE SEATS */

    slot.bookedSeats += Number(persons);

    await slot.save();

    res.json({
      success:true,
      booking
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success:false,
      message:"Booking failed"
    });

  }

};