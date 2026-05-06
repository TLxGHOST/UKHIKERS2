import Review from "../models/Review.js";
import Booking from "../models/Booking.js";

// Submit review (public - from booking lookup page)
export const submitReview = async (req, res) => {
  try {
    const { bookingId, identifier, rating, comment, images } = req.body;

    // Verify booking exists and belongs to this user
    const booking = await Booking.findOne({
      _id: bookingId,
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!booking) {
      return res.status(403).json({
        success: false,
        message: "Invalid booking or credentials"
      });
    }

    // Check if booking is approved (only approved bookings can review)
    if (booking.bookingStatus !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved bookings can submit reviews"
      });
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You've already submitted a review for this booking"
      });
    }

    const review = await Review.create({
      bookingId,
      trekId: booking.trekId,
      userName: booking.name,
      rating,
      comment,
      images: images || [],
    });

    res.status(201).json({
      success: true,
      message: "Review submitted! It will appear after admin approval.",
      data: review
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get approved reviews for a trek (public)
export const getTrekReviews = async (req, res) => {
  try {
    const { trekId } = req.params;

    const reviews = await Review.find({
      trekId,
      status: "approved"
    }).sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        reviews,
        averageRating: Number(avgRating),
        totalReviews: reviews.length,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: Get all reviews (including pending)
export const getAllReviews = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const reviews = await Review.find(filter)
      .populate("trekId", "title")
      .populate("bookingId", "name email") // also show customer info
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: Approve/Reject review
export const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const review = await Review.findByIdAndUpdate(
      id,
      { status, adminNotes: adminNotes || "" },
      { new: true }
    );

    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};