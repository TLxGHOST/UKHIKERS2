import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import Booking from "../models/Booking.js";
import TrekSlot from "../models/TrekSlot.js";
import Admin from "../models/Admin.js";  // ✅ Import Admin model

export const getDashboardStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const activeSlots = await TrekSlot.countDocuments({ date: { $gte: new Date() } });
    const revenueData = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$amountPaid" } } }
    ]);
    const revenue = revenueData[0]?.total || 0;
    res.json({ success: true, data: { totalBookings, activeSlots, revenue } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};

// ✅ FIXED: Login using Admin model from database
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find admin in database
    const admin = await Admin.findOne({ email, isActive: true });

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password using the model's comparePassword method
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token (include role for authorization)
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return token and admin info
    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createBlog = async (req, res) => res.json({ message: "Blog created" });
export const updateBlog = async (req, res) => res.json({ message: "Blog updated" });
export const deleteBlog = async (req, res) => res.json({ message: "Blog deleted" });