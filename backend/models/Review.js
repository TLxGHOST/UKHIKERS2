import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true
  },
  trekId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog",
    required: true
  },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  images: [String], // URLs of review images
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  adminNotes: String, // Admin can add notes when rejecting
}, { timestamps: true });

export default mongoose.model("Review", reviewSchema);