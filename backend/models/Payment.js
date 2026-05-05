import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({

  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  paymentType: {
    type: String,
    enum: ["advance", "remaining", "full"],
    required: true
  },

  paymentMethod: {
    type: String,
    enum: ["razorpay", "cash", "upi"],
    default: "razorpay"
  },

  transactionId: String,

  status: {
    type: String,
    enum: ["success", "failed"],
    default: "success"
  }

}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);