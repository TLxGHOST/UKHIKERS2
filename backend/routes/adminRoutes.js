import express from "express";
import {
  loginAdmin,
  createBlog,
  updateBlog,
  deleteBlog,
  getDashboardStats
} from "../controllers/adminController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* LOGIN */
router.post("/login", loginAdmin);

/* DASHBOARD */
router.get("/stats", protect, getDashboardStats);

/* BLOG MANAGEMENT */
router.post("/blogs", protect, createBlog);
router.put("/blogs/:id", protect, updateBlog);
router.delete("/blogs/:id", protect, deleteBlog);

export default router;