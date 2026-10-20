import express from "express";
import {
  addPayment,
  getAllPayments,
  createRazorpayOrder,
  verifyRazorpayPayment
} from "../controllers/paymentController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// This read endpoint exposes customer and transaction data and must be admin-only.
router.post("/add", addPayment);
router.get("/", protect, authorize("super_admin", "manager", "viewer"), getAllPayments);

// Keep public checkout endpoints available; payment amount reconciliation is a separate next step.
router.post("/create-order", createRazorpayOrder);
router.post("/verify", verifyRazorpayPayment);

export default router;
