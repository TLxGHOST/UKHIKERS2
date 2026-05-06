import React, { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminTreks = () => {
  const [treks, setTreks] = useState([]);
  const [slots, setSlots] = useState({});
  const [loading, setLoading] = useState(true);

  // Form states for new trek
  const [showAddTrek, setShowAddTrek] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [difficulty, setDifficulty] = useState("moderate");
  const [duration, setDuration] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Form states for new slot
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [selectedTrek, setSelectedTrek] = useState("");
  const [slotDate, setSlotDate] = useState("");
  const [totalSeats, setTotalSeats] = useState("");

  // Fetch all treks
  const fetchTreks = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API}/blogs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTreks(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch treks:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch slots for a specific trek
  const fetchSlots = async (trekId) => {
    try {
      const res = await axios.get(`${API}/slots/trek/${trekId}`);
      setSlots((prev) => ({
        ...prev,
        [trekId]: res.data.data || [],
      }));
    } catch (err) {
      console.error("Failed to fetch slots:", err);
    }
  };

  useEffect(() => {
    fetchTreks();
  }, []);

  // Load slots for all treks when treks are loaded
  useEffect(() => {
    treks.forEach((trek) => {
      fetchSlots(trek._id);
    });
  }, [treks]);

  // Add new trek
  const handleAddTrek = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      // Note: You might need to update your backend to support this
      await axios.post(
        `${API}/admin/blogs`,
        {
          title,
          price: Number(price),
          difficulty,
          duration,
          excerpt,
          imageUrl,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert("Trek added successfully!");
      setShowAddTrek(false);
      setTitle("");
      setPrice("");
      setDifficulty("moderate");
      setDuration("");
      setExcerpt("");
      setImageUrl("");
      fetchTreks();
    } catch (err) {
      console.error("Failed to add trek:", err);
      alert("Failed to add trek");
    }
  };

  // Add new slot
  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!selectedTrek || !slotDate || !totalSeats) {
      alert("Please fill all fields");
      return;
    }

    try {
      await axios.post(`${API}/slots`, {
        trekId: selectedTrek,
        date: slotDate,
        totalSeats: Number(totalSeats),
      });

      alert("Slot added successfully!");
      setShowAddSlot(false);
      setSlotDate("");
      setTotalSeats("");
      setSelectedTrek("");
      fetchSlots(selectedTrek);
    } catch (err) {
      console.error("Failed to add slot:", err);
      alert("Failed to add slot");
    }
  };

  // Delete slot
  const handleDeleteSlot = async (slotId, trekId) => {
    if (!confirm("Delete this slot?")) return;

    try {
      await axios.delete(`${API}/slots/${slotId}`);
      fetchSlots(trekId);
    } catch (err) {
      console.error("Failed to delete slot:", err);
    }
  };

  if (loading) {
    return <div className="p-6">Loading treks...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Treks & Slots Management</h1>

        <div className="space-x-3">
          <button
            onClick={() => setShowAddTrek(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Add Trek
          </button>
          <button
            onClick={() => setShowAddSlot(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Slot
          </button>
        </div>
      </div>

      {/* Add Trek Modal */}
      {showAddTrek && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-black">Add New Trek</h2>
            <form onSubmit={handleAddTrek} className="space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border p-2 rounded text-black"
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border p-2 rounded text-black"
                required
              />
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border p-2 rounded text-black"
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="difficult">Difficult</option>
              </select>
              <input
                type="text"
                placeholder="Duration (e.g., 3 days)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full border p-2 rounded text-black"
                required
              />
              <textarea
                placeholder="Excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full border p-2 rounded text-black"
                rows="3"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full border p-2 rounded text-black"
              />

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTrek(false)}
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      {showAddSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-black">Add New Slot</h2>
            <form onSubmit={handleAddSlot} className="space-y-3">
              <select
                value={selectedTrek}
                onChange={(e) => setSelectedTrek(e.target.value)}
                className="w-full border p-2 rounded text-black"
                required
              >
                <option value="">Select Trek</option>
                {treks.map((trek) => (
                  <option key={trek._id} value={trek._id}>
                    {trek.title}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="w-full border p-2 rounded text-black"
                required
              />
              <input
                type="number"
                placeholder="Total Seats"
                value={totalSeats}
                onChange={(e) => setTotalSeats(e.target.value)}
                className="w-full border p-2 rounded text-black"
                required
              />

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add Slot
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSlot(false)}
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Treks List */}
      <div className="space-y-6">
        {treks.map((trek) => (
          <div key={trek._id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-black">
                  {trek.title}
                </h3>
                <p className="text-sm text-gray-600">
                  ₹{trek.price} | {trek.difficulty} | {trek.duration}
                </p>
              </div>
            </div>

            {/* Slots for this trek */}
            <div>
              <h4 className="font-medium text-black mb-2">Slots:</h4>
              {slots[trek._id]?.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-600">
                      <th>Date</th>
                      <th>Total Seats</th>
                      <th>Booked</th>
                      <th>Available</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots[trek._id].map((slot) => (
                      <tr key={slot._id} className="text-sm">
                        <td className="text-black">
                          {new Date(slot.date).toLocaleDateString("en-IN")}
                        </td>
                        <td className="text-black">{slot.totalSeats}</td>
                        <td className="text-black">{slot.bookedSeats}</td>
                        <td className="text-green-600 font-medium">
                          {slot.totalSeats - slot.bookedSeats}
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteSlot(slot._id, trek._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500">No slots added yet</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTreks;
