import express from "express";
import dotenv from "dotenv";

import cors from "cors";

import connectDB from "./config/db.js";
import reviewRoutes from "./routes/reviewRoutes.js";

import blogRoutes from "./routes/blogRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import slotRoutes from "./routes/slotRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminBookingRoutes from "./routes/adminBookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",          // dev
  "https://ukhikers-2.vercel.app/" // your live Vercel URL
];

/* MIDDLEWARE */
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());

/* DB */
connectDB();

/* ROUTES */
app.use("/api/blogs", blogRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/bookings", adminBookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
/* TEST ROUTE */
app.get("/", (req, res) => {
  res.send("API is running...");
});

/* SERVER */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});