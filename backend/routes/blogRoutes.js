import express from "express";
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
} from "../controllers/blogController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* PUBLIC ROUTES */
router.get("/", getBlogs);
router.get("/:id", getBlogById);

/* PROTECTED ROUTES (Admin only) */
router.post("/", protect, createBlog);
router.put("/:id", protect, updateBlog);
router.delete("/:id", protect, deleteBlog);

export default router;