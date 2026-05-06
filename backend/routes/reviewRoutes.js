import express from "express";
import {
  submitReview,
  getTrekReviews,
  getAllReviews,
  updateReviewStatus
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/", submitReview);
router.get("/trek/:trekId", getTrekReviews);

// Admin routes
router.get("/admin/all", protect, getAllReviews);
router.put("/admin/:id", protect, updateReviewStatus);

export default router;