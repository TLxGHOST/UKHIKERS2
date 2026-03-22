import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    const res = await fetch(`${API}/admin/bookings`);

    const data = await res.json();

    setBookings(data);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const approve = async (id) => {
    await fetch(`${API}/admin/bookings/approve/${id}`, {
      method: "PUT",
    });

    fetchBookings();
  };

  const reject = async (id) => {
    await fetch(`${API}/admin/bookings/reject/${id}`, {
      method: "PUT",
    });

    fetchBookings();
  };

  const markPaid = async (id) => {
    await fetch(`${API}/admin/bookings/payment/${id}`, {
      method: "PUT",
    });

    fetchBookings();
  };

  return (
    <div className="min-h-screen bg-[#0b1d26] text-white p-10">
      <h1 className="text-3xl font-bold mb-8">Booking Requests</h1>

      <div className="grid gap-6">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="bg-[#1a2c35] p-6 rounded-lg space-y-2"
          >
            <h2 className="text-xl text-yellow-400">{booking.trekId?.title}</h2>

            <p>Name: {booking.name}</p>
            <p>Email: {booking.email}</p>
            <p>Phone: {booking.phone}</p>

            <p>Persons: {booking.persons}</p>

            <p>
              Date:{" "}
              {booking.slotId?.date
                ? new Date(booking.slotId.date).toDateString()
                : "N/A"}
            </p>

            <p>
              Booking Status:{" "}
              <span className="text-yellow-400">{booking.bookingStatus}</span>
            </p>

            <p>
              Payment:{" "}
              <span className="text-green-400">{booking.paymentStatus}</span>
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => approve(booking._id)}
                className="bg-green-600 px-4 py-2 rounded"
              >
                Approve
              </button>

              <button
                onClick={() => reject(booking._id)}
                className="bg-red-600 px-4 py-2 rounded"
              >
                Reject
              </button>

              <button
                onClick={() => markPaid(booking._id)}
                className="bg-yellow-600 px-4 py-2 rounded"
              >
                Mark Paid
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
