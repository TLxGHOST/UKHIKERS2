// src/AppRouter.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import EquipmentPage from "./pages/EquipmentPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import AboutPage from "./pages/AboutPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPage from "./pages/AdminPage";
import AdminSlots from "./pages/AdminSlots";
import AdminBookings from "./pages/AdminBookings";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/slots" element={<AdminSlots />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/blog/:id" element={<BlogDetailPage />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
