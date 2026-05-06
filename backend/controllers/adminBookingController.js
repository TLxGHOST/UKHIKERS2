import Booking from "../models/Booking.js";
import Blog from "../models/Blog.js";
import transporter from "../config/email.js";
import { bookingConfirmationEmail } from "../utils/emailTemplates.js";
/* GET ALL */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("trekId", "title")
      .populate("slotId", "date")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings"
    });
  }
};

/* APPROVE */


/* APPROVE - with email notification */
/* APPROVE - with email notification */
export const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { bookingStatus: "approved" },
      { new: true }
    ).populate("trekId").populate("slotId");

    // 📧 Try to send confirmation email (don't fail if email is invalid)
    if (process.env.EMAIL_USER && booking.email) {
      try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(booking.email)) {
          await transporter.sendMail({
            from: `"UK Hikers" <${process.env.EMAIL_USER}>`,
            to: booking.email,
            subject: `🎉 Booking Confirmed! - ${booking.trekId?.title || "Your Trek"}`,
            html: bookingConfirmationEmail(booking, booking.trekId),
          });
          console.log(`✅ Confirmation sent to ${booking.email}`);
        } else {
          console.log(`⚠️ Invalid email for booking ${booking._id}: ${booking.email}`);
        }
      } catch (emailErr) {
        console.error(`❌ Email send failed: ${emailErr.message}`);
      }
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: "Approval failed" });
  }
};

/* REJECT */
export const rejectBooking = async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.id, {
      bookingStatus: "rejected"
    });

    res.json({ success: true });
  } catch {
    res.status(500).json({
      success: false,
      message: "Reject failed"
    });
  }
};

/* MARK PAID */
export const markPaymentComplete = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.amountPaid = booking.totalAmount;
    booking.amountRemaining = 0;
    booking.paymentStatus = "paid";
    await booking.save();

    res.json({ success: true, data: booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Payment update failed" });
  }
};