import express from "express";
import { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog } from "../controllers/blogController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", getBlogs);
router.get("/:id", getBlogById);
router.post("/", protect, authorize("super_admin", "manager"), createBlog);
router.put("/:id", protect, authorize("super_admin", "manager"), updateBlog);
router.delete("/:id", protect, authorize("super_admin"), deleteBlog);

export default router;
