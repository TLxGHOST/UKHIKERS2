import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminSlots() {
  const [treks, setTreks] = useState([]);
  const [slots, setSlots] = useState([]);

  const [trekId, setTrekId] = useState("");
  const [date, setDate] = useState("");
  const [seats, setSeats] = useState("");

  /* FETCH TREKS */

  const fetchTreks = async () => {
    const res = await fetch(`${API}/blogs`);

    const data = await res.json();

    setTreks(data);
  };

  /* FETCH SLOTS */

  const fetchSlots = async () => {
    if (!trekId) return;

    const res = await fetch(`${API}/slots/${trekId}`);

    const data = await res.json();

    setSlots(data);
  };

  useEffect(() => {
    fetchTreks();
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [trekId]);

  /* CREATE SLOT */

  const createSlot = async () => {
    if (!trekId) {
      alert("Please select trek");
      return;
    }

    if (!date) {
      alert("Please select date");
      return;
    }

    if (!seats) {
      alert("Enter number of seats");
      return;
    }

    const res = await fetch(`${API}/slots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trekId,
        date,
        totalSeats: Number(seats),
      }),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message);
      return;
    }

    alert("Slot created");

    setDate("");
    setSeats("");

    fetchSlots();
  };

  /* DELETE SLOT */

  const deleteSlot = async (id) => {
    await fetch(`${API}/slots/${id}`, {
      method: "DELETE",
    });

    fetchSlots();
  };

  return (
    <div className="min-h-screen bg-[#0b1d26] text-white p-10">
      <h1 className="text-3xl font-bold mb-8">Manage Trek Slots</h1>

      {/* SELECT TREK */}

      <select
        className="w-full max-w-md p-2 text-black rounded mb-6"
        onChange={(e) => setTrekId(e.target.value)}
      >
        <option>Select Trek</option>

        {treks.map((trek) => (
          <option key={trek._id} value={trek._id}>
            {trek.title}
          </option>
        ))}
      </select>

      {/* CREATE SLOT */}

      <div className="max-w-md space-y-4 mb-10">
        <input
          type="date"
          className="w-full p-2 text-black rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="number"
          placeholder="Total Seats"
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
          className="w-full p-2 text-black rounded"
        />

        <button
          onClick={createSlot}
          className="bg-yellow-600 px-6 py-2 rounded"
        >
          Add Slot
        </button>
      </div>

      {/* SLOT LIST */}

      <div className="grid md:grid-cols-3 gap-6">
        {slots.map((slot) => {
          const seatsLeft = slot.totalSeats - slot.bookedSeats;

          return (
            <div key={slot._id} className="bg-[#1a2c35] p-4 rounded-lg">
              <h3 className="font-bold">{slot.date}</h3>

              <p>Seats Left: {seatsLeft}</p>

              <button
                onClick={() => deleteSlot(slot._id)}
                className="mt-3 bg-red-600 px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
