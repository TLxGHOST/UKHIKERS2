import express from "express";
import {
  createSlot,
  getSlots,
  getSlotsByTrek,
  deleteSlot
} from "../controllers/slotController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getSlots);
router.get("/trek/:trekId", getSlotsByTrek);
router.post("/", protect, authorize("super_admin", "manager"), createSlot);
router.delete("/:id", protect, authorize("super_admin"), deleteSlot);

export default router;
