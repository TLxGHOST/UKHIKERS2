import express from "express";
import { loginAdmin, createBlog } from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { deleteBlog } from "../controllers/adminController.js";
import { updateBlog } from "../controllers/adminController.js";
import { getAllBookings } from "../controllers/adminBookingController.js";



const router = express.Router();

router.post("/login", loginAdmin);

router.post("/create-blog", protect, createBlog);
router.put("/update-blog/:id", protect, updateBlog);
router.get("/bookings", getAllBookings);
router.delete("/delete-blog/:id", protect, deleteBlog);
export default router;