import express from "express";
import {
  createBooking,
  checkAvailability,
  holdSeats,
  releaseHold
} from "../controllers/bookingController.js";
import { lookupBooking } from "../controllers/bookingStatusController.js";
const router = express.Router();

router.post("/", createBooking);
router.get("/check-availability/:slotId", checkAvailability);
router.post("/hold-seats", holdSeats);
router.post("/release-hold", releaseHold);
router.post("/lookup", lookupBooking);
export default router;