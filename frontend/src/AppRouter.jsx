import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// 🌍 Public pages
import App from "./App";
import EquipmentPage from "./pages/EquipmentPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import AboutPage from "./pages/AboutPage";
import HomePage from "./pages/HomePage";
import AdminTreks from "./pages/AdminTreks";
import TrackBooking from "./pages/TrackBooking";
import AdminReviews from "./pages/AdminReviews.jsx";
// 🔐 Admin
import AdminLogin from "./pages/AdminLogin";

// 🧠 Admin system
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";

import AdminDashboard from "./pages/AdminDashboard";
import AdminBookings from "./pages/AdminBookings";
// import AdminSlots from "./pages/AdminSlots";
import AdminPayments from "./pages/AdminPayments";
// (optional) import AdminPage if you still use it
// import AdminPage from "./pages/AdminPage";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* 🌍 PUBLIC ROUTES */}
        <Route path="/" element={<HomePage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/track-booking" element={<TrackBooking />} />
        {/* 🔐 ADMIN LOGIN */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* 🛡️ PROTECTED ADMIN PANEL */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* default → redirect to dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="treks" element={<AdminTreks />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="bookings" element={<AdminBookings />} />

          <Route path="payments" element={<AdminPayments />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
