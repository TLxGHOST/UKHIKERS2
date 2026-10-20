import mongoose from "mongoose";

const paymentOrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: "TrekSlot", required: true },
    trekId: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    persons: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true, min: 1 },
    amountPaise: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true, default: "INR" },
    holdId: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "processing", "completed"],
      default: "pending",
      index: true
    },
    paymentId: { type: String, default: null },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null }
  },
  { timestamps: true }
);

// A booking may have only one active checkout. Completed orders are excluded so
// a later partial payment can create another checkout for the remaining balance.
paymentOrderSchema.index(
  { bookingId: 1 },
  {
    unique: true,
    name: "one_active_checkout_per_booking",
    partialFilterExpression: {
      bookingId: { $type: "objectId" },
      status: { $in: ["pending", "processing"] },
    },
  }
);

export default mongoose.model("PaymentOrder", paymentOrderSchema);
