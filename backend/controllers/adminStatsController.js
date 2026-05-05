import Booking from "../models/Booking.js";

export const getAdminStats = async (req, res) => {
  try {

    const stats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amountPaid" },
          totalPending: { $sum: "$amountRemaining" },
          totalBookings: { $sum: 1 }
        }
      }
    ]);

    const revenueByDate = await Booking.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          revenue: { $sum: "$amountPaid" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      stats: stats[0] || {},
      revenueByDate
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Stats failed" });
  }
};