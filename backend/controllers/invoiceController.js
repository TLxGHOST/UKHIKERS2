import { randomUUID } from "node:crypto";
import Booking from "../models/Booking.js";
import Invoice from "../models/Invoice.js";

const finiteAmount = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

export const generateBookingInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("trekId")
      .populate("slotId");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Invoice creation is idempotent: retrying the request returns the original
    // snapshot instead of issuing a second invoice for the same booking.
    const existing = await Invoice.findOne({ bookingId: booking._id });
    if (existing) {
      return res.status(200).json({ success: true, invoice: existing, existing: true });
    }

    const totalAmount = finiteAmount(booking.totalAmount);
    const amountPaid = finiteAmount(booking.amountPaid ?? 0);
    const amountRemaining = finiteAmount(booking.amountRemaining ?? Math.max(0, (totalAmount ?? 0) - (amountPaid ?? 0)));

    if (totalAmount === null || amountPaid === null || amountRemaining === null) {
      return res.status(422).json({ success: false, message: "Booking has invalid amount data; invoice was not created" });
    }

    const trekName =
      booking.trekId?.title ||
      booking.trekId?.name ||
      booking.slotId?.trekName ||
      "Trek booking";
    const trekDate = booking.slotId?.date ? new Date(booking.slotId.date) : null;

    const invoiceNumber = `UKH-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;

    try {
      const invoice = await Invoice.create({
        invoiceNumber,
        bookingId: booking._id,
        generatedBy: req.user.id,
        customer: {
          name: booking.name || "Customer",
          email: booking.email || "",
          phone: booking.phone || ""
        },
        trek: {
          name: String(trekName),
          date: trekDate && !Number.isNaN(trekDate.getTime()) ? trekDate : null,
          persons: Number(booking.persons || 1)
        },
        amounts: {
          currency: "INR",
          totalAmount,
          amountPaidAtGeneration: amountPaid,
          amountRemainingAtGeneration: amountRemaining
        },
        paymentStatusAtGeneration: booking.paymentStatus || "pending",
        bookingStatusAtGeneration: booking.bookingStatus || "pending"
      });

      return res.status(201).json({ success: true, invoice, existing: false });
    } catch (error) {
      // Handle simultaneous retries safely using the unique bookingId index.
      if (error?.code === 11000) {
        const invoice = await Invoice.findOne({ bookingId: booking._id });
        if (invoice) return res.status(200).json({ success: true, invoice, existing: true });
      }
      throw error;
    }
  } catch (error) {
    console.error("Invoice generation failed:", error);
    return res.status(500).json({ success: false, message: "Failed to generate invoice" });
  }
};

export const getBookingInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ bookingId: req.params.id });
    if (!invoice) {
      return res.status(404).json({ success: false, message: "No invoice has been generated for this booking" });
    }
    return res.json({ success: true, invoice });
  } catch (error) {
    console.error("Invoice retrieval failed:", error);
    return res.status(500).json({ success: false, message: "Failed to retrieve invoice" });
  }
};
