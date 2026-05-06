import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Search, Star, Send, Check, X } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TrackBooking = () => {
  const [bookingId, setBookingId] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setBooking(null);

    try {
      const res = await fetch(`${API}/bookings/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, identifier }),
      });
      const data = await res.json();

      if (data.success) {
        setBooking(data.data);
      } else {
        setError(data.message || "Booking not found");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking._id,
          identifier,
          rating,
          comment,
          images: [],
        }),
      });
      const data = await res.json();

      if (data.success) {
        setReviewSubmitted(true);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to submit review");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1d26] text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pt-32 pb-20">
        <h1 className="text-3xl font-bold mb-2 text-center font-[Playfair_Display]">
          Track Your Booking
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Enter your Booking ID and email/phone to check status
        </p>

        {/* Lookup Form */}
        <form
          onSubmit={handleLookup}
          className="bg-[#1a2c35] p-6 rounded-xl space-y-4 mb-8"
        >
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Booking ID
            </label>
            <input
              type="text"
              placeholder="e.g., 664f1a2b3c4d5e6f7a8b9c0d"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="w-full p-3 bg-[#0b1d26] border border-[#273d47] rounded-lg text-white"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              You can find this in your confirmation email
            </p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Email or Phone
            </label>
            <input
              type="text"
              placeholder="Enter email or phone used during booking"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full p-3 bg-[#0b1d26] border border-[#273d47] rounded-lg text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {loading ? "Searching..." : "Track Booking"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6">
            <p className="flex items-center gap-2">
              <X className="w-4 h-4" /> {error}
            </p>
          </div>
        )}

        {/* Booking Details */}
        {booking && (
          <div className="bg-[#1a2c35] rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-4">
              <h2 className="text-lg font-bold">Booking Found!</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Trek</span>
                <span className="font-semibold">{booking.trek?.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Date</span>
                <span className="font-semibold">
                  {booking.slotDate
                    ? new Date(booking.slotDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Persons</span>
                <span className="font-semibold">{booking.persons}</span>
              </div>
              <hr className="border-gray-700" />
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Amount</span>
                <span className="font-bold text-yellow-400">
                  ₹{booking.totalAmount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Amount Paid</span>
                <span className="text-green-400">
                  ₹{booking.amountPaid?.toLocaleString()}
                </span>
              </div>
              {booking.amountRemaining > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Remaining</span>
                  <span className="text-red-400">
                    ₹{booking.amountRemaining?.toLocaleString()}
                  </span>
                </div>
              )}
              <hr className="border-gray-700" />
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Booking Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}
                >
                  {booking.bookingStatus?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Payment Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.paymentStatus)}`}
                >
                  {booking.paymentStatus?.toUpperCase()}
                </span>
              </div>

              {/* Review Section */}
              {booking.bookingStatus === "approved" && !reviewSubmitted && (
                <div className="pt-4 border-t border-gray-700">
                  {!showReviewForm ? (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Star className="w-4 h-4" /> Write a Review
                    </button>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-3">
                      <h3 className="font-semibold">Your Review</h3>
                      <div>
                        <label className="text-sm text-gray-400">Rating</label>
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="text-2xl"
                            >
                              {star <= rating ? "⭐" : "☆"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        placeholder="Share your experience..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-3 bg-[#0b1d26] border border-[#273d47] rounded-lg text-white"
                        rows="3"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" /> Submit Review
                      </button>
                    </form>
                  )}
                </div>
              )}

              {reviewSubmitted && (
                <div className="bg-green-500/20 border border-green-500/50 text-green-300 p-3 rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Review submitted! It will appear after admin approval.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default TrackBooking;
