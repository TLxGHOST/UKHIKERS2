import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API = "http://localhost:5000/api";

const BlogDetailPage = () => {
  const { id } = useParams();

  const [isScrolled, setIsScrolled] = useState(false);
  const [blogPost, setBlogPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const [slots, setSlots] = useState([]);
  const [slotId, setSlotId] = useState("");

  const [showBooking, setShowBooking] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [persons, setPersons] = useState(1);
  const [advancePaid, setAdvancePaid] = useState(0);

  /* NAVBAR SCROLL */

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* FETCH BLOG */

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`${API}/blogs/${id}`);

        if (!res.ok) {
          throw new Error("Blog not found");
        }

        const data = await res.json();

        setBlogPost(data);
      } catch (err) {
        console.error(err);
        setBlogPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBlog();
  }, [id]);

  /* FETCH SLOTS */

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch(`${API}/slots/${id}`);
        const data = await res.json();

        setSlots(data);
      } catch (err) {
        console.error("Slot fetch failed", err);
      }
    };

    if (id) fetchSlots();
  }, [id]);

  /* HANDLE BOOKING */

  const handleBooking = async () => {
    if (!slotId) {
      alert("Please select trek date");
      return;
    }

    if (!name || !email || !phone) {
      alert("Please fill all details");
      return;
    }

    const selectedSlot = slots.find((s) => s._id === slotId);

    if (!selectedSlot) {
      alert("Invalid slot");
      return;
    }

    const seatsLeft = selectedSlot.totalSeats - selectedSlot.bookedSeats;

    if (persons > seatsLeft) {
      alert("Not enough seats available");
      return;
    }

    try {
      const res = await fetch(`${API}/bookings`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          slotId,
          name,
          email,
          phone,
          persons: Number(persons),
          amountPaid: Number(advancePaid),
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Booking successful!");

        setShowBooking(false);

        setName("");
        setEmail("");
        setPhone("");
        setPersons(1);
        setAdvancePaid(0);
        setSlotId("");
      } else {
        alert(data.message || "Booking failed");
      }
    } catch (err) {
      console.error(err);
      alert("Booking failed");
    }
  };

  /* LOADING */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1d26] text-white flex items-center justify-center">
        Loading Trek...
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="min-h-screen bg-[#0b1d26] text-white flex items-center justify-center">
        Trek not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1d26] text-[#d1d1d1]">
      <Navbar isScrolled={isScrolled} />

      <div className="pt-24 pb-16">
        {/* HERO */}

        <div className="h-[40vh] md:h-[60vh] overflow-hidden">
          <img
            src={blogPost.imageUrl}
            alt={blogPost.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* MAIN */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-3 gap-10 mt-10">
          {/* BLOG CONTENT */}

          <article className="md:col-span-2 space-y-6">
            <h1 className="text-4xl font-bold text-white">{blogPost.title}</h1>

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
                  <h2 key={index} className="text-3xl font-bold text-white">
                    {block.text}
                  </h2>
                );
              }

              if (block.type === "image") {
                return (
                  <img
                    key={index}
                    src={block.src}
                    alt=""
                    className="rounded-lg shadow-lg"
                  />
                );
              }

              if (block.type === "list") {
                return (
                  <ul key={index} className="space-y-2">
                    {block.items?.map((item, i) => (
                      <li key={i} className="flex text-gray-300">
                        <span className="text-yellow-500 mr-2">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              }

              return null;
            })}
          </article>

          {/* TREK SIDEBAR */}

          <div className="bg-[#1a2c35] p-6 rounded-xl h-fit sticky top-28">
            <h2 className="text-xl font-bold mb-4 text-white">Trek Details</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Price</span>
                <span className="text-yellow-400 font-semibold">
                  ₹{blogPost.price}
                </span>
              </div>

              {blogPost.discount && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="text-green-400">{blogPost.discount}%</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Difficulty</span>
                <span>{blogPost.difficulty}</span>
              </div>

              <div className="flex justify-between">
                <span>Duration</span>
                <span>{blogPost.duration}</span>
              </div>
            </div>

            <button
              onClick={() => setShowBooking(true)}
              className="w-full mt-6 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold"
            >
              Book Trek
            </button>
          </div>
        </div>
      </div>

      {/* BOOKING MODAL */}

      {showBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[420px] space-y-4">
            <h2 className="text-2xl font-bold text-black">Book Trek</h2>

            <input
              placeholder="Name"
              className="w-full border p-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="Email"
              className="w-full border p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              placeholder="Phone"
              className="w-full border p-2 rounded"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              type="number"
              className="w-full border p-2 rounded"
              value={persons}
              min={1}
              onChange={(e) => setPersons(Number(e.target.value))}
            />

            {/* SLOT SELECT */}

            <select
              className="w-full border p-2 rounded"
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
            >
              <option value="">Select Trek Date</option>

              {slots.length === 0 ? (
                <option disabled>No slots available</option>
              ) : (
                slots.map((slot) => {
                  const seatsLeft = slot.totalSeats - slot.bookedSeats;

                  return (
                    <option
                      key={slot._id}
                      value={slot._id}
                      disabled={seatsLeft <= 0}
                    >
                      {new Date(slot.date).toDateString()} ({seatsLeft} seats
                      left)
                    </option>
                  );
                })
              )}
            </select>

            <input
              type="number"
              placeholder="Advance Payment (optional)"
              className="w-full border p-2 rounded"
              value={advancePaid}
              onChange={(e) => setAdvancePaid(Number(e.target.value))}
            />

            <button
              onClick={handleBooking}
              className="w-full bg-yellow-600 text-white py-2 rounded"
            >
              Confirm Booking
            </button>

            <button
              onClick={() => setShowBooking(false)}
              className="w-full text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default BlogDetailPage;
