import express from "express";
import { loginAdmin, createBlog, updateBlog, deleteBlog } from "../controllers/adminController.js";
import { getAdminStats } from "../controllers/adminStatsController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/login", loginAdmin);
router.get("/stats", protect, authorize("super_admin", "manager", "viewer"), getAdminStats);
router.post("/blogs", protect, authorize("super_admin", "manager"), createBlog);
router.put("/blogs/:id", protect, authorize("super_admin", "manager"), updateBlog);
router.delete("/blogs/:id", protect, authorize("super_admin"), deleteBlog);

export default router;
