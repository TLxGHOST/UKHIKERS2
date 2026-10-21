import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const BlogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [blogPost, setBlogPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);

  // Booking states
  const [showBooking, setShowBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [slotId, setSlotId] = useState("");
  const [name, setName] = useState(() => { try { return JSON.parse(localStorage.getItem("customerUser") || "null")?.name || ""; } catch { return ""; } });
  const [email, setEmail] = useState(() => { try { return JSON.parse(localStorage.getItem("customerUser") || "null")?.email || ""; } catch { return ""; } });
  const [phone, setPhone] = useState("");
  const [persons, setPersons] = useState(1);
  const [bookingRequestId, setBookingRequestId] = useState("");
  const [bookingEmailSent, setBookingEmailSent] = useState(false);
  const [bookingEmailWarning, setBookingEmailWarning] = useState("");
  const [processing, setProcessing] = useState(false);
  const [bookingMode, setBookingMode] = useState("lead");
  const [paymentId, setPaymentId] = useState("");

  const [holdId, setHoldId] = useState(null);
  const [holdTimer, setHoldTimer] = useState(null);

  useEffect(() => {
    let user = null;
    try { user = JSON.parse(localStorage.getItem("customerUser") || "null"); } catch { user = null; }
    setName(user?.name || "");
    setEmail(user?.email || "");
    if (location.state?.openBooking) {
      setSlotId(location.state.slotId || "");
      setPersons(Number(location.state.persons) || 1);
      setPhone(location.state.phone || "");
      setBookingStep(2);
      setShowBooking(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.key]);
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
    setBookingRequestId("");
    setPaymentId("");
    setBookingMode("lead");
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

  // The ₹0 option records a lead only; it does not reserve seats.
  const saveBookingToDB = async () => {
    const res = await fetch(`${API}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId, name, email, phone, persons: Number(persons), amountPaid: 0 }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Could not submit your interest");
    setBookingMode("lead");
    setBookingRequestId(data.booking?._id || "");
    setBookingEmailSent(Boolean(data.emailSent));
    setBookingEmailWarning(data.emailWarning || "");
    setBookingComplete(true);
  };

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleBooking = async (mode = "lead") => {
    if (!slotId) return alert("Please select a trek date");
    if (!localStorage.getItem("customerToken") || !name.trim() || !email.trim()) { alert("Please sign in first so we can use your account details."); navigate("/login"); return; }
    if (!phone.trim()) return alert("Please enter your phone number");
    const selected = slots.find((s) => s._id === slotId);
    if (!selected) return alert("Invalid slot selected");
    const seatsLeft = Number(selected.totalSeats) - Number(selected.bookedSeats);
    if (persons > seatsLeft) return alert(`Only ${seatsLeft} seats currently appear available. Please choose another date or group size.`);
    setProcessing(true);
    try {
      if (mode === "lead") {
        await saveBookingToDB();
        return;
      }
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay Checkout could not load. Check your connection and try again.");
      const orderRes = await fetch(`${API}/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, name: name.trim(), email: email.trim(), phone: phone.trim(), persons: Number(persons), currency: "INR" }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) throw new Error(orderData.message || "Unable to start checkout");
      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "UK Hikers",
        description: `Full payment — ${blogPost.title}`,
        order_id: orderData.order.id,
        prefill: { name: name.trim(), email: email.trim(), contact: phone.trim() },
        notes: { trekId: id, slotId },
        theme: { color: "#d6ff3f" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API}/payments/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.message || "Payment verification failed");
            }
            setBookingMode("paid");
            setBookingRequestId(verifyData.booking?._id || "");
            setPaymentId(response.razorpay_payment_id || "");
            setBookingEmailSent(false);
            setBookingEmailWarning("");
            setBookingComplete(true);
            setShowBooking(false);
            setProcessing(false);
          } catch (error) {
            setProcessing(false);
            alert(error.message + (response.razorpay_payment_id ? `\nPayment ID: ${response.razorpay_payment_id}. Please contact UK Hikers support before paying again.` : ""));
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
      };
      const checkout = new window.Razorpay(options);
      checkout.on("payment.failed", (event) => {
        setProcessing(false);
        alert(event.error?.description || "Payment failed. No booking has been confirmed.");
      });
      checkout.open();
    } catch (error) {
      alert(error.message || "Unable to continue");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="nature-page min-h-screen bg-[#0b100e] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading Trek...</p>
        </div>
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="nature-page min-h-screen bg-[#0b100e] text-white flex items-center justify-center">
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
    <div className="nature-page min-h-screen bg-[#0b100e] text-[#d1d1d1]">
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
                    className="text-xl font-semibold text-[#d6ff3f] mt-6"
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
                    className="space-y-2 bg-[#121a16] rounded-xl p-6"
                  >
                    {block.items?.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-gray-300"
                      >
                        <span className="text-[#d6ff3f]">•</span> {item}
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
                  <div key={review._id} className="bg-[#121a16] p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-white">
                          {review.userName}
                        </p>
                        <p className="text-[#d6ff3f] text-sm">
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
            <div className="bg-[#121a16] p-6 rounded-xl sticky top-28">
              <h2 className="text-xl font-bold mb-6 text-white">
                Trek Details
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between pb-3 border-b border-gray-700">
                  <span className="text-gray-400">Price per person</span>
                  <span className="text-[#d6ff3f] font-bold">
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
                  setBookingMode("lead");
                  setPaymentId("");
                }}
                className="w-full mt-6 bg-[#d6ff3f] hover:bg-[#e3ff82] text-[#0b100e] py-4 rounded-xl font-bold text-lg transition-all"
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
                    onClick={() => {
                      if (!slotId) return;
                      if (!localStorage.getItem("customerToken")) {
                        navigate("/login", { state: { from: location.pathname, openBooking: true, slotId, persons, phone } });
                        return;
                      }
                      setBookingStep(2);
                    }}
                    disabled={!slotId}
                    className="w-full bg-[#d6ff3f] text-[#0b100e] py-3 rounded-xl font-bold disabled:opacity-50"
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
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Using your signed-in account</p>
                      <p className="font-semibold text-gray-900">{name || "Sign in to continue"}</p>
                      <p className="text-sm text-gray-600 break-all">{email}</p>
                      <p className="text-xs text-gray-500 mt-2">Name and email are taken from your account.</p>
                    </div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone number
                      <input type="tel" inputMode="numeric" autoComplete="tel" placeholder="10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value.slice(0, 10))} className="w-full p-3 mt-2 border rounded-xl" required />
                    </label>
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
                        if (!localStorage.getItem("customerToken") || !name.trim() || !email.trim()) {
                          navigate("/login", { state: { from: location.pathname, openBooking: true, slotId, persons, phone } });
                          return;
                        }
                        const phoneRegex = /^[6-9]\d{9}$/;
                        if (!phone || !phoneRegex.test(phone)) {
                          alert("Please enter a valid 10-digit phone number");
                          return;
                        }
                        setBookingStep(3);
                      }}
                      className="flex-1 bg-[#d6ff3f] text-[#0b100e] py-3 rounded-xl font-bold"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Choose full payment or submit a zero-cost lead */}
              {bookingStep === 3 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose how to continue</h3>
                  <div className="bg-gray-50 p-4 rounded-xl mb-4">
                    <p className="text-sm text-gray-600">Full payment for {persons} {persons === 1 ? "person" : "people"}</p>
                    <p className="text-2xl font-bold text-yellow-600">₹{totalAmount.toLocaleString()}</p>
                  </div>
                  <button type="button" onClick={() => setBookingMode("paid")} className={`w-full text-left p-4 rounded-xl border-2 mb-3 ${bookingMode === "paid" ? "border-green-600 bg-green-50" : "border-gray-200"}`}>
                    <span className="block font-bold text-gray-900">Pay full amount now</span>
                    <span className="block text-sm text-gray-600 mt-1">Secure Razorpay checkout. Seats are allocated only after payment verification.</span>
                  </button>
                  <button type="button" onClick={() => setBookingMode("lead")} className={`w-full text-left p-4 rounded-xl border-2 mb-4 ${bookingMode === "lead" ? "border-yellow-500 bg-yellow-50" : "border-gray-200"}`}>
                    <span className="block font-bold text-gray-900">I'm interested — ₹0</span>
                    <span className="block text-sm text-gray-600 mt-1">Send your details to our team. No payment and no seat reservation.</span>
                  </button>
                  <div className="flex gap-3">
                    <button onClick={() => setBookingStep(2)} className="px-4 py-3 border-2 rounded-xl">← Back</button>
                    <button onClick={() => handleBooking(bookingMode)} disabled={processing} className="flex-1 bg-[#d6ff3f] text-[#0b100e] py-3 rounded-xl font-bold disabled:opacity-50">
                      {processing ? (bookingMode === "paid" ? "Preparing checkout..." : "Submitting...") : bookingMode === "paid" ? "Pay securely" : "Submit interest — ₹0"}
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
              {bookingMode === "paid" ? "Payment verified!" : "Interest submitted!"}
            </h2>
            <p className="text-gray-600 mb-4">
              {bookingMode === "paid"
                ? "Your full payment was verified and your booking has been confirmed."
                : "Your interest has been sent to our team. No payment was taken and seats are not reserved."}
            </p>
            {bookingMode === "lead" && (bookingEmailWarning ? (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">{bookingEmailWarning}</p>
            ) : bookingEmailSent ? (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 mb-4">A confirmation email was sent. Please save your reference ID.</p>
            ) : null)}
            {bookingRequestId && <div className="bg-gray-100 rounded-lg p-3 mb-5 text-left">
              <p className="text-xs text-gray-500 mb-1">{bookingMode === "paid" ? "BOOKING ID" : "LEAD / BOOKING REQUEST ID"} — SAVE THIS</p>
              <p className="font-mono text-sm break-all text-gray-800">{bookingRequestId}</p>
              {paymentId && <p className="text-xs text-gray-500 mt-2">Payment ID: {paymentId}</p>}
            </div>}
            <button
              onClick={() => {
                releaseSeats();
                setShowBooking(false);
                setBookingComplete(false);
                setBookingMode("lead");
                setPaymentId("");
                setBookingStep(1);
                setSlotId("");
                setPersons(1);
                setBookingRequestId("");
              }}
              className="w-full bg-[#d6ff3f] text-[#0b100e] py-3 rounded-xl font-bold"
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
