import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true, immutable: true },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
    unique: true,
    immutable: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
    immutable: true
  },
  generatedAt: { type: Date, required: true, default: Date.now, immutable: true },
  customer: {
    name: { type: String, required: true, immutable: true },
    email: { type: String, required: true, immutable: true },
    phone: { type: String, default: "", immutable: true }
  },
  trek: {
    name: { type: String, required: true, immutable: true },
    date: { type: Date, default: null, immutable: true },
    persons: { type: Number, required: true, immutable: true }
  },
  amounts: {
    currency: { type: String, required: true, default: "INR", immutable: true },
    totalAmount: { type: Number, required: true, immutable: true },
    amountPaidAtGeneration: { type: Number, required: true, immutable: true },
    amountRemainingAtGeneration: { type: Number, required: true, immutable: true }
  },
  paymentStatusAtGeneration: { type: String, required: true, immutable: true },
  bookingStatusAtGeneration: { type: String, required: true, immutable: true }
}, { timestamps: true });

invoiceSchema.index({ bookingId: 1 }, { unique: true });

export default mongoose.model("Invoice", invoiceSchema);
