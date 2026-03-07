import Booking from "../models/Booking.js";

/* GET ALL BOOKINGS */

export const getAllBookings = async (req,res)=>{

  try{

    const bookings = await Booking
      .find()
      .populate("trekId","title")
      .populate("slotId","date")
      .sort({createdAt:-1});

    res.json(bookings);

  }catch(err){

    res.status(500).json({
      message:"Failed to fetch bookings"
    });

  }

};

/* APPROVE BOOKING */

export const approveBooking = async (req,res)=>{

  try{

    const { id } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { bookingStatus:"approved" },
      { returnDocument:"after" }
    );

    res.json({
      success:true,
      booking
    });

  }catch(err){

    res.status(500).json({
      message:"Approval failed"
    });

  }

};

/* REJECT BOOKING */

export const rejectBooking = async (req,res)=>{

  try{

    const { id } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { bookingStatus:"rejected" },
      { returnDocument:"after" }
    );

    res.json({
      success:true
    });

  }catch(err){

    res.status(500).json({
      message:"Reject failed"
    });

  }

};

/* MARK PAYMENT COMPLETE */

export const markPaymentComplete = async (req,res)=>{

  try{

    const { id } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { paymentStatus:"paid" },
      { returnDocument:"after" }
    );

    res.json({
      success:true,
      booking
    });

  }catch(err){

    res.status(500).json({
      message:"Payment update failed"
    });

  }

};