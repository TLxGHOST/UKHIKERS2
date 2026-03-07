import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API = "http://localhost:5000/api";

const EquipmentPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /* Navbar scroll state */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Fetch trek/blog data from backend */
  useEffect(() => {
    const fetchTreks = async () => {
      try {
        const res = await fetch(`${API}/blogs`);
        const data = await res.json();

        setTreks(data);
      } catch (error) {
        console.error("Error fetching treks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTreks();
  }, []);

  /* Loading UI */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1d26] text-white flex items-center justify-center">
        Loading Treks...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1d26] font-[Inter] text-[#d1d1d1]">
      <Navbar isScrolled={isScrolled} active="Equipment" />

      {/* Hero Section */}
      <div className="relative pt-28 pb-10 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-[#0b1d26] via-[#0c2029] to-[#0b1d26]">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-[Playfair_Display] text-white">
          Essential Treks
        </h1>

        <p className="max-w-2xl mx-auto text-lg">
          Discover the most beautiful Himalayan treks curated for adventurers
          and nature lovers.
        </p>

        <p className="max-w-2xl mx-auto text-sm mt-4 text-yellow-400">
          💡 Click on any trek to view complete details
        </p>
      </div>

      {/* Trek Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {treks.map((trek) => (
            <div
              key={trek._id}
              onClick={() => navigate(`/blog/${trek._id}`)}
              className="cursor-pointer group"
            >
              <div className="bg-[#1a2c35] rounded-xl overflow-hidden shadow-lg h-full transition-all duration-300 group-hover:scale-[1.02]">
                {/* IMAGE */}
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={trek.imageUrl}
                    alt={trek.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Discount Badge */}
                  {trek.discount && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      {trek.discount}% OFF
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition">
                    {trek.title}
                  </h3>

                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                    {trek.excerpt}
                  </p>

                  {/* TREK INFO GRID */}
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="bg-[#0b1d26] p-2 rounded text-center">
                      <p className="text-gray-400">Price</p>
                      <p className="text-yellow-400 font-semibold">
                        ₹{trek.price}
                      </p>
                    </div>

                    <div className="bg-[#0b1d26] p-2 rounded text-center">
                      <p className="text-gray-400">Difficulty</p>
                      <p className="text-white">{trek.difficulty}</p>
                    </div>

                    <div className="bg-[#0b1d26] p-2 rounded text-center">
                      <p className="text-gray-400">Duration</p>
                      <p className="text-white">{trek.duration}</p>
                    </div>

                    <div className="bg-[#0b1d26] p-2 rounded text-center">
                      <p className="text-gray-400">Discount</p>
                      <p className="text-green-400">
                        {trek.discount ? `${trek.discount}%` : "—"}
                      </p>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/blog/${trek._id}`);
                    }}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded font-medium transition"
                  >
                    Book Now
                  </button>

                  {/* </div> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EquipmentPage;
