import { useEffect, useState } from "react";
import api from "../api/axios";

const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/admin/bookings");
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveBooking = async (id) => {
    await api.put(`/admin/approve/${id}`);
    fetchBookings();
  };

  const rejectBooking = async (id) => {
    await api.put(`/admin/reject/${id}`);
    fetchBookings();
  };

  return {
    bookings,
    loading,
    fetchBookings,
    approveBooking,
    rejectBooking,
  };
};

export default useBookings;