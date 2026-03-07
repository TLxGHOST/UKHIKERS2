import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({

  name:String,
  email:String,
  phone:String,

  persons:Number,

  trekId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Blog"
  },

  slotId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"TrekSlot"
  },

  amountPaid:Number,

  paymentStatus:{
    type:String,
    default:"pending"
  },

  bookingStatus:{
    type:String,
    default:"pending"
  }

},{timestamps:true});

export default mongoose.model("Booking",bookingSchema);