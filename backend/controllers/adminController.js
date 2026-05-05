import Booking from "../models/Booking.js";
import TrekSlot from "../models/TrekSlot.js";
import { config } from "../config/config.js";

// 📊 DASHBOARD
export const getDashboardStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();

    const activeSlots = await TrekSlot.countDocuments({
      date: { $gte: new Date() }
    });

    const revenueData = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amountPaid" }
        }
      }
    ]);

    const revenue = revenueData[0]?.total || 0;

    res.json({
      success: true,
      data: {
        totalBookings,
        activeSlots,
        revenue
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats"
    });
  }
};

// 🔐 LOGIN (env-based)
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (
    email === config.ADMIN_EMAIL &&
    password === config.ADMIN_PASSWORD
  ) {
    return res.json({ token: "dummyToken123" });
  }

  res.status(401).json({ message: "Invalid credentials" });
};

// 📝 BLOG APIs (placeholders for now)
export const createBlog = async (req, res) => {
  res.json({ message: "Blog created" });
};

export const updateBlog = async (req, res) => {
  res.json({ message: "Blog updated" });
};

export const deleteBlog = async (req, res) => {
  res.json({ message: "Blog deleted" });
};