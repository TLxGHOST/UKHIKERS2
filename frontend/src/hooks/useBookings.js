import { useEffect, useState } from "react";
import api from "../api/axios";

const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/admin/bookings");
      setBookings(res.data.data || []); // ← was res.data (wrong shape)
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ← FIX: was missing entirely
  useEffect(() => {
    fetchBookings();
  }, []);

  const approveBooking = async (id) => {
    await api.put(`/admin/bookings/approve/${id}`); // ← was /admin/approve/:id
    fetchBookings();
  };

  const rejectBooking = async (id) => {
    await api.put(`/admin/bookings/reject/${id}`); // ← was /admin/reject/:id
    fetchBookings();
  };

  return { bookings, loading, fetchBookings, approveBooking, rejectBooking };
};

export default useBookings;