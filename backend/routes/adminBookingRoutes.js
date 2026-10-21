import express from "express";

import {
  getAllBookings,
  approveBooking,
  rejectBooking,
  markPaymentComplete,
  resendBookingApprovalEmail
} from "../controllers/adminBookingController.js";
import { generateBookingInvoice, getBookingInvoice } from "../controllers/invoiceController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/* READ-ONLY BOOKING ACCESS */
router.get("/", protect, authorize("super_admin", "manager", "viewer"), getAllBookings);

/* BOOKING OPERATIONS */
router.put("/approve/:id", protect, authorize("super_admin", "manager"), approveBooking);
router.post("/:id/resend-confirmation", protect, authorize("super_admin", "manager"), resendBookingApprovalEmail);
router.put("/reject/:id", protect, authorize("super_admin", "manager"), rejectBooking);

/* LEGACY MANUAL PAYMENT ACTION: super-admin only until it records a verified payment transaction */
router.put("/payment/:id", protect, authorize("super_admin"), markPaymentComplete);

/* INVOICES: only active admins with operational privileges; generation never changes payment state */
router.post("/:id/invoice", protect, authorize("super_admin", "manager"), generateBookingInvoice);
router.get("/:id/invoice", protect, authorize("super_admin", "manager", "viewer"), getBookingInvoice);

export default router;
