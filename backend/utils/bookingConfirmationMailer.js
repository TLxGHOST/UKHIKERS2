import { randomUUID } from "node:crypto";
import Booking from "../models/Booking.js";
import Invoice from "../models/Invoice.js";
import transporter from "../config/email.js";
import { bookingConfirmationEmail, bookingInvoiceAttachmentHtml } from "./emailTemplates.js";

const validEmail = (value) => typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const sendBookingApprovalEmail = async (booking, adminId) => {
  if (!booking || booking.bookingStatus !== "approved") {
    const error = new Error("Only approved bookings can receive an approval email");
    error.statusCode = 409;
    throw error;
  }
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const missing = ["EMAIL_HOST", "EMAIL_USER", "EMAIL_PASS"].filter((key) => !process.env[key]);
    const error = new Error(`Email service is not configured (missing: ${missing.join(", ")})`);
    error.statusCode = 503;
    throw error;
  }
  if (!validEmail(booking.email)) {
    const error = new Error("Booking does not have a valid customer email address");
    error.statusCode = 422;
    throw error;
  }
  if (!adminId) {
    const error = new Error("Admin identity missing; cannot create invoice");
    error.statusCode = 500;
    throw error;
  }

  let invoice = await Invoice.findOne({ bookingId: booking._id });
  let createdForThisAttempt = false;
  if (!invoice) {
    const totalAmount = Number(booking.totalAmount);
    const amountPaid = Number(booking.amountPaid || 0);
    const amountRemaining = Number(booking.amountRemaining ?? Math.max(0, totalAmount - amountPaid));
    const trekDate = booking.slotId?.date ? new Date(booking.slotId.date) : null;

    try {
      invoice = await Invoice.create({
        invoiceNumber: `UKH-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
        bookingId: booking._id,
        generatedBy: adminId,
        customer: { name: booking.name || "Customer", email: booking.email, phone: booking.phone || "" },
        trek: {
          name: String(booking.trekId?.title || booking.trekId?.name || "Trek booking"),
          date: trekDate && !Number.isNaN(trekDate.getTime()) ? trekDate : null,
          persons: Number(booking.persons || 1),
        },
        amounts: { currency: "INR", totalAmount, amountPaidAtGeneration: amountPaid, amountRemainingAtGeneration: amountRemaining },
        paymentStatusAtGeneration: booking.paymentStatus || "pending",
        bookingStatusAtGeneration: "approved",
      });
      createdForThisAttempt = true;
    } catch (error) {
      if (error?.code === 11000) invoice = await Invoice.findOne({ bookingId: booking._id });
      if (!invoice) throw error;
    }
  }

  try {
    await transporter.sendMail({
      from: `"UK Hikers" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: `Booking Approved - ${booking.trekId?.title || "Your Trek"}`,
      html: bookingConfirmationEmail(booking, booking.trekId, invoice),
      attachments: [{
        filename: `${invoice.invoiceNumber}.html`,
        content: bookingInvoiceAttachmentHtml(booking, booking.trekId, invoice),
        contentType: "text/html; charset=utf-8",
      }],
    });

    // Only mark the invoice as issued/visible after SMTP accepts the approval email.
    const sentAt = new Date();
    const update = await Booking.updateOne(
      { _id: booking._id, bookingStatus: "approved" },
      { $set: { approvalEmailSentAt: sentAt } }
    );
    if (update.matchedCount !== 1) {
      throw new Error("Approval email was sent, but booking email status could not be recorded");
    }
    return { invoiceNumber: invoice.invoiceNumber, email: booking.email, approvalEmailSentAt: sentAt };
  } catch (error) {
    // If this attempt created the invoice and delivery failed, remove the draft
    // so it does not remain listed as an issued invoice. The admin can retry.
    if (createdForThisAttempt) {
      await Invoice.deleteOne({ _id: invoice._id }).catch((cleanupError) => {
        console.error("Could not remove unissued invoice after email failure:", cleanupError.message);
      });
    }
    throw error;
  }
};
