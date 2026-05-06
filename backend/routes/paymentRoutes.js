import express from "express";
import {
  addPayment,
  getAllPayments,
  createRazorpayOrder,
  verifyRazorpayPayment
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/add", addPayment);
router.get("/", getAllPayments);
router.post("/create-order", createRazorpayOrder);
router.post("/verify", verifyRazorpayPayment);

export default router;