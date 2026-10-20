import express from "express";
import {
  addPayment,
  getAllPayments,
  createRazorpayOrder,
  verifyRazorpayPayment
} from "../controllers/paymentController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Manual cash/UPI entries and transaction history are restricted to authorized staff.
router.post("/add", protect, authorize("super_admin", "manager"), addPayment);
router.get("/", protect, authorize("super_admin", "manager", "viewer"), getAllPayments);

// Public checkout remains available. Order creation and verification are validated server-side.
router.post("/create-order", createRazorpayOrder);
router.post("/verify", verifyRazorpayPayment);

export default router;
