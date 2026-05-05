import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({

  name: String,
  email: String,
  phone: String,

  persons: Number,

  trekId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog"
  },

  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TrekSlot"
  },

  // 💰 PAYMENT SYSTEM
  totalAmount: Number,

  amountPaid: {
    type: Number,
    default: 0
  },

  amountRemaining: Number,

  paymentStatus: {
    type: String,
    enum: ["pending", "partial", "paid"],
    default: "pending"
  },

  bookingStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }

}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);