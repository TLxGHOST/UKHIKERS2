import express from "express";

import {
  getAllBookings,
  approveBooking,
  rejectBooking,
  markPaymentComplete
} from "../controllers/adminBookingController.js";

const router = express.Router();

router.get("/",getAllBookings);

router.put("/approve/:id",approveBooking);

router.put("/reject/:id",rejectBooking);

router.put("/payment/:id",markPaymentComplete);

export default router;