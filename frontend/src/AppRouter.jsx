import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import EquipmentPage from "./pages/EquipmentPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import AboutPage from "./pages/AboutPage";
import HomePage from "./pages/HomePage";
import AdminTreks from "./pages/AdminTreks";
import TrackBooking from "./pages/TrackBooking";
import AdminReviews from "./pages/AdminReviews.jsx";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBookings from "./pages/AdminBookings";
import AdminPayments from "./pages/AdminPayments";
import AdminInvoices from "./pages/AdminInvoices";

const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/equipment" element={<EquipmentPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:id" element={<BlogDetailPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/track-booking" element={<TrackBooking />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="treks" element={<AdminTreks />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="invoices" element={<AdminInvoices />} />
        <Route path="reviews" element={<AdminReviews />} />
      </Route>
    </Routes>
  </Router>
);

export default AppRouter;
