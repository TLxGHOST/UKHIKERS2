import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import adminRoutes from "./routes/adminRoutes.js";
import slotRoutes from "./routes/slotRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminBookingRoutes from "./routes/adminBookingRoutes.js";
//import paymentRoutes from "./routes/paymentRoutes.js";



dotenv.config();

import connectDB from "./config/db.js";
import blogRoutes from "./routes/blogRoutes.js";

const PORT = process.env.PORT || 5000;
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/admin", adminRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/slots",slotRoutes);
app.use("/api/admin/bookings",adminBookingRoutes);
app.use("/api/bookings",bookingRoutes);
//app.use("/api/payment",paymentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
