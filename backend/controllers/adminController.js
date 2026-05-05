import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import Booking from "../models/Booking.js";
import TrekSlot from "../models/TrekSlot.js";

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

// 🔐 FIX: Sign a real JWT instead of returning a dummy string
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (email === config.ADMIN_EMAIL && password === config.ADMIN_PASSWORD) {
    const token = jwt.sign(
      { email },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({ token });
  }

  res.status(401).json({ message: "Invalid credentials" });
};

export const createBlog = async (req, res) => res.json({ message: "Blog created" });
export const updateBlog = async (req, res) => res.json({ message: "Blog updated" });
export const deleteBlog = async (req, res) => res.json({ message: "Blog deleted" });