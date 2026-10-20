import express from "express";
import {
  submitReview,
  getTrekReviews,
  getAllReviews,
  updateReviewStatus
} from "../controllers/reviewController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", submitReview);
router.get("/trek/:trekId", getTrekReviews);

router.get("/admin/all", protect, authorize("super_admin", "manager", "viewer"), getAllReviews);
router.put("/admin/:id", protect, authorize("super_admin", "manager"), updateReviewStatus);

export default router;
