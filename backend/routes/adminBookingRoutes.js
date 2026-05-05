import express from "express";

import {
  getAllBookings,
  approveBooking,
  rejectBooking,
  markPaymentComplete
} from "../controllers/adminBookingController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* GET ALL BOOKINGS */
router.get("/", protect, getAllBookings);

/* APPROVE */
router.put("/approve/:id", protect, approveBooking);

/* REJECT */
router.put("/reject/:id", protect, rejectBooking);

/* MARK PAYMENT COMPLETE */
router.put("/payment/:id", protect, markPaymentComplete);

export default router;