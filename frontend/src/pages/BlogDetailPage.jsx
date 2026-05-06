import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_YOUR_KEY";

const BlogDetailPage = () => {
  const { id } = useParams();

  const [isScrolled, setIsScrolled] = useState(false);
  const [blogPost, setBlogPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);

  // Booking states
  const [showBooking, setShowBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [slotId, setSlotId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [persons, setPersons] = useState(1);
  const [advancePaid, setAdvancePaid] = useState(0);
  const [processing, setProcessing] = useState(false);

  const [holdId, setHoldId] = useState(null);
  const [holdTimer, setHoldTimer] = useState(null);

  // Add state
  const [trekReviews, setTrekReviews] = useState(null);

  // Add fetch in useEffect
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API}/reviews/trek/${id}`);
        const data = await res.json();
        if (data.success) setTrekReviews(data.data);
      } catch (err) {
        console.error("Failed to fetch reviews");
      }
    };
    if (id) fetchReviews();
  }, [id]);

  const holdSelectedSeats = async () => {
    if (!slotId || persons < 1) return;
    try {
      const res = await fetch(`${API}/bookings/hold-seats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, persons }),
      });
      const data = await res.json();
      if (data.success) {
        setHoldId(data.holdId);
        const timer = setTimeout(
          () => {
            releaseSeats();
          },
          10 * 60 * 1000,
        );
        setHoldTimer(timer);
      } else {
        alert(`Sorry, ${data.message}`);
        setSlotId("");
      }
    } catch (err) {
      console.error("Failed to hold seats:", err);
    }
  };

  const releaseSeats = async () => {
    if (holdId && slotId) {
      try {
        await fetch(`${API}/bookings/release-hold`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slotId, holdId }),
        });
      } catch (err) {
        console.error("Failed to release hold:", err);
      }
      setHoldId(null);
      if (holdTimer) clearTimeout(holdTimer);
    }
  };

  // Call hold when slot or persons changes
  useEffect(() => {
    if (slotId && persons > 0) {
      holdSelectedSeats();
    }
    return () => {
      releaseSeats();
    };
  }, [slotId, persons]);

  const closeBookingModal = () => {
    releaseSeats();
    setShowBooking(false);
    setBookingStep(1);
    setSlotId("");
    setPersons(1);
    setAdvancePaid(0);
    setName("");
    setEmail("");
    setPhone("");
  };

  // Fetch blog
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`${API}/blogs/${id}`);
        if (!res.ok) throw new Error("Blog not found");
        const data = await res.json();
        setBlogPost(data.data);
      } catch (err) {
        console.error(err);
        setBlogPost(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBlog();
  }, [id]);

  // Fetch slots
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch(`${API}/slots/trek/${id}`);
        const data = await res.json();
        setSlots(data.data || []);
      } catch (err) {
        console.error("Slot fetch failed", err);
      }
    };
    if (id) fetchSlots();
  }, [id]);

  // Navbar scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const selectedSlot = slots.find((s) => s._id === slotId);
  const trekPrice = blogPost?.price || 0;
  const totalAmount = trekPrice * persons;

  // Create booking in database
  const saveBookingToDB = async (paymentId = null) => {
    try {
      const payload = {
        slotId,
        name,
        email,
        phone,
        persons: Number(persons),
        amountPaid: Number(advancePaid),
        holdId: holdId || undefined,
      };
      console.log("Saving booking:", payload);

      const res = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Booking response:", data);

      if (data.success) {
        if (advancePaid > 0) {
          await fetch(`${API}/payments/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: data.booking._id,
              amount: Number(advancePaid),
              paymentMethod: "razorpay",
            }),
          });
        }
        setBookingComplete(true);
        setProcessing(false);
      } else {
        throw new Error(data.message || "Booking failed");
      }
    } catch (err) {
      console.error("Save booking error:", err);
      alert("Failed to save booking: " + err.message);
      setProcessing(false);
    }
  };

  // Handle Razorpay payment
  const handleRazorpayPayment = async () => {
    setProcessing(true);
    try {
      console.log("Creating Razorpay order for amount:", advancePaid);
      const orderRes = await fetch(`${API}/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(advancePaid),
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
        }),
      });
      const orderData = await orderRes.json();
      console.log("Order created:", orderData);

      if (!orderData.success || !orderData.order) {
        throw new Error(orderData.message || "Failed to create payment order");
      }

      const options = {
        key: RAZORPAY_KEY,
        amount: orderData.order.amount,
        currency: orderData.order.currency || "INR",
        name: "UK Hikers",
        description: `Booking: ${blogPost.title}`,
        image: "/assets/images/logo.png",
        order_id: orderData.order.id,
        handler: async function (response) {
          console.log("Payment successful:", response);
          try {
            const verifyRes = await fetch(`${API}/payments/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            console.log("Verification:", verifyData);

            if (verifyData.success) {
              await saveBookingToDB(response.razorpay_payment_id);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Payment verification failed. Please contact support.");
            setProcessing(false);
          }
        },
        prefill: {
          name: name,
          email: email,
          contact: phone,
        },
        notes: {
          trek: blogPost.title,
          persons: persons,
        },
        theme: {
          color: "#EAB308",
        },
        modal: {
          ondismiss: function () {
            console.log("Payment dismissed by user");
            releaseSeats();
            setProcessing(false);
          },
        },
      };

      console.log("Opening Razorpay with options:", options);
      if (!window.Razorpay) {
        throw new Error("Razorpay not loaded. Please refresh the page.");
      }

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        alert("Payment failed: " + response.error.description);
        releaseSeats();
        setProcessing(false);
      });
      razorpay.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed: " + err.message);
      releaseSeats();
      setProcessing(false);
    }
  };

  // Handle final booking confirmation
  const handleBooking = async () => {
    if (!slotId) {
      alert("Please select a trek date");
      return;
    }
    if (!name || !email || !phone) {
      alert("Please fill all details");
      return;
    }
    const selected = slots.find((s) => s._id === slotId);
    if (!selected) {
      alert("Invalid slot selected");
      return;
    }
    const seatsLeft = selected.totalSeats - selected.bookedSeats;
    if (persons > seatsLeft) {
      alert(`Only ${seatsLeft} seats available`);
      return;
    }
    if (advancePaid > 0) {
      await handleRazorpayPayment();
    } else {
      setProcessing(true);
      await saveBookingToDB();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1d26] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading Trek...</p>
        </div>
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="min-h-screen bg-[#0b1d26] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Trek Not Found</h2>
          <p className="text-gray-400">
            The trek you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1d26] text-[#d1d1d1]">
      <Navbar isScrolled={isScrolled} />

      <div className="pt-24 pb-16">
        {/* Hero Image */}
        <div className="h-[40vh] md:h-[60vh] overflow-hidden">
          <img
            src={blogPost.imageUrl}
            alt={blogPost.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/assets/images/blog/hiking1.jpg";
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-3 gap-10 mt-10">
          {/* Content */}
          <article className="md:col-span-2 space-y-6">
            <h1 className="text-4xl font-bold text-white">{blogPost.title}</h1>
            <p className="text-gray-300">{blogPost.excerpt}</p>

            {blogPost.content?.map((block, index) => {
              if (block.type === "paragraph") {
                return (
                  <p key={index} className="text-gray-300 leading-relaxed">
                    {block.text}
                  </p>
                );
              }
              if (block.type === "heading") {
                return (
                  <h2
                    key={index}
                    className="text-2xl font-bold text-white mt-8"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.type === "subheading") {
                return (
                  <h3
                    key={index}
                    className="text-xl font-semibold text-yellow-400 mt-6"
                  >
                    {block.text}
                  </h3>
                );
              }
              if (block.type === "image") {
                return (
                  <figure key={index} className="my-8">
                    <img
                      src={block.src}
                      alt={block.alt || ""}
                      className="w-full rounded-xl"
                    />
                    {block.caption && (
                      <figcaption className="text-sm text-gray-500 mt-2 text-center italic">
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              }
              if (block.type === "list") {
                return (
                  <ul
                    key={index}
                    className="space-y-2 bg-[#1a2c35] rounded-xl p-6"
                  >
                    {block.items?.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-gray-300"
                      >
                        <span className="text-yellow-500">•</span> {item}
                      </li>
                    ))}
                  </ul>
                );
              }
              return null;
            })}
          </article>

          {/* Reviews Section */}
          {trekReviews && trekReviews.reviews?.length > 0 && (
            <div className="mt-10 border-t border-gray-700 pt-8">
              <h3 className="text-xl font-bold text-white mb-4">
                Reviews ({trekReviews.totalReviews}) • ⭐{" "}
                {trekReviews.averageRating}
              </h3>
              <div className="space-y-4">
                {trekReviews.reviews.map((review) => (
                  <div key={review._id} className="bg-[#1a2c35] p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-white">
                          {review.userName}
                        </p>
                        <p className="text-yellow-400 text-sm">
                          {"⭐".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{review.comment}</p>
                    {review.images?.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {review.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt=""
                            className="w-20 h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#1a2c35] p-6 rounded-xl sticky top-28">
              <h2 className="text-xl font-bold mb-6 text-white">
                Trek Details
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between pb-3 border-b border-gray-700">
                  <span className="text-gray-400">Price per person</span>
                  <span className="text-yellow-400 font-bold">
                    ₹{blogPost.price?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-700">
                  <span className="text-gray-400">Duration</span>
                  <span className="text-white">{blogPost.duration}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-700">
                  <span className="text-gray-400">Difficulty</span>
                  <span className="text-white capitalize">
                    {blogPost.difficulty}
                  </span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-700">
                  <span className="text-gray-400">Location</span>
                  <span className="text-white">
                    {blogPost.location || "Uttarakhand"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowBooking(true);
                  setBookingStep(1);
                  setBookingComplete(false);
                }}
                className="w-full mt-6 bg-yellow-600 hover:bg-yellow-700 text-white py-4 rounded-xl font-bold text-lg transition-all"
              >
                Book This Trek
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========== BOOKING MODAL ========== */}
      {showBooking && !bookingComplete && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeBookingModal();
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header remains sticky */}
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6 text-white sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Book Trek</h2>
                <button
                  onClick={closeBookingModal}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 h-1 rounded ${bookingStep >= step ? "bg-white" : "bg-white/30"}`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Scrollable content area */}
            <div className="p-6">
              {/* Step 1: Date & Persons */}
              {bookingStep === 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Select Date & Persons
                  </h3>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trek Date
                  </label>
                  <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
                    {slots.map((slot) => (
                      <button
                        key={slot._id}
                        onClick={() => setSlotId(slot._id)}
                        disabled={slot.totalSeats - slot.bookedSeats <= 0}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${slotId === slot._id ? "border-yellow-500 bg-yellow-50" : "border-gray-200"} ${slot.totalSeats - slot.bookedSeats <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-800">
                            {new Date(slot.date).toLocaleDateString("en-IN", {
                              weekday: "short",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          <span
                            className={`text-sm font-medium ${slot.totalSeats - slot.bookedSeats <= 3 ? "text-orange-600" : "text-green-600"}`}
                          >
                            {slot.totalSeats - slot.bookedSeats} seats
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {/* persons and continue button unchanged */}
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Persons
                  </label>
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={() => setPersons(Math.max(1, persons - 1))}
                      className="w-10 h-10 rounded-lg border-2 text-xl"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-2xl font-bold">
                      {persons}
                    </span>
                    <button
                      onClick={() => {
                        const selected = slots.find((s) => s._id === slotId);
                        const maxSeats = selected
                          ? selected.totalSeats - selected.bookedSeats
                          : 99;
                        if (persons < maxSeats) setPersons(persons + 1);
                      }}
                      className="w-10 h-10 rounded-lg border-2 text-xl"
                    >
                      +
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl mb-6">
                    <div className="flex justify-between">
                      <span>Total Amount</span>
                      <span className="font-bold text-xl text-yellow-600">
                        ₹{totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setBookingStep(2)}
                    disabled={!slotId}
                    className="w-full bg-yellow-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* Step 2: Details */}
              {bookingStep === 2 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Your Details
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 border rounded-xl"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 border rounded-xl"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-3 border rounded-xl"
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setBookingStep(1)}
                      className="px-4 py-3 border-2 rounded-xl"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => {
                        if (!name || name.trim().length < 2) {
                          alert("Please enter your full name");
                          return;
                        }
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!email || !emailRegex.test(email)) {
                          alert("Please enter a valid email address");
                          return;
                        }
                        const phoneRegex = /^[6-9]\d{9}$/;
                        if (!phone || !phoneRegex.test(phone)) {
                          alert("Please enter a valid 10-digit phone number");
                          return;
                        }
                        setBookingStep(3);
                      }}
                      className="flex-1 bg-yellow-600 text-white py-3 rounded-xl font-bold"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {bookingStep === 3 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Payment
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-xl mb-4">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      ₹{totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Advance Payment
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: "Pay Later", amount: 0, desc: "Full later" },
                      {
                        label: "30% Now",
                        amount: Math.round(totalAmount * 0.3),
                        desc: `₹${Math.round(totalAmount * 0.3).toLocaleString()}`,
                      },
                      {
                        label: "50% Now",
                        amount: Math.round(totalAmount * 0.5),
                        desc: `₹${Math.round(totalAmount * 0.5).toLocaleString()}`,
                      },
                    ].map((opt) => (
                      <button
                        key={opt.amount}
                        onClick={() => setAdvancePaid(opt.amount)}
                        className={`p-3 rounded-lg border-2 text-center ${advancePaid === opt.amount ? "border-yellow-500 bg-yellow-50" : "border-gray-200"}`}
                      >
                        <p className="text-sm font-bold">{opt.label}</p>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    placeholder="Custom amount"
                    value={advancePaid || ""}
                    onChange={(e) =>
                      setAdvancePaid(
                        Math.min(totalAmount, Number(e.target.value)),
                      )
                    }
                    className="w-full p-3 border rounded-xl mb-4"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setBookingStep(2)}
                      className="px-4 py-3 border-2 rounded-xl"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleBooking}
                      disabled={processing}
                      className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
                    >
                      {processing
                        ? "Processing..."
                        : advancePaid > 0
                          ? `Pay ₹${advancePaid.toLocaleString()}`
                          : "Confirm Booking"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== SUCCESS MODAL ========== */}
      {bookingComplete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-gray-600 mb-6">
              Your trek has been booked successfully.
            </p>
            <button
              onClick={() => {
                releaseSeats();
                setShowBooking(false);
                setBookingComplete(false);
                setBookingStep(1);
                setSlotId("");
                setPersons(1);
                setAdvancePaid(0);
              }}
              className="w-full bg-yellow-600 text-white py-3 rounded-xl font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default BlogDetailPage;
