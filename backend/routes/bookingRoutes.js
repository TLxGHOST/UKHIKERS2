import express from "express";
import { createBooking } from "../controllers/bookingController.js";

const router = express.Router();

/* CREATE BOOKING */
router.post("/", createBooking);

export default router;