import { useEffect, useState } from "react";
import api from "../api/axios";

const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/admin/bookings");
      setBookings(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const approveBooking = async (id) => {
    try {
      await api.put(`/admin/bookings/approve/${id}`);
      fetchBookings(); // Refresh the list
    } catch (err) {
      console.error("Failed to approve booking:", err);
      alert("Failed to approve booking");
    }
  };

  const rejectBooking = async (id) => {
    try {
      await api.put(`/admin/bookings/reject/${id}`);
      fetchBookings(); // Refresh the list
    } catch (err) {
      console.error("Failed to reject booking:", err);
      alert("Failed to reject booking");
    }
  };

  return { bookings, loading, fetchBookings, approveBooking, rejectBooking };
};

export default useBookings;