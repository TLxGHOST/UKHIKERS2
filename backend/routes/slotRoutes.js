import express from "express";
import {
  createSlot,
  getSlots,
  getSlotsByTrek,
  deleteSlot
} from "../controllers/slotController.js";

const router = express.Router();

/* GET ALL SLOTS */
router.get("/", getSlots);

/* GET SLOTS BY TREK */
router.get("/trek/:trekId", getSlotsByTrek);

/* CREATE SLOT */
router.post("/", createSlot);

/* DELETE SLOT */
router.delete("/:id", deleteSlot);

export default router;