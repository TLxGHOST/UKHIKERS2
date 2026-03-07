import express from "express";
import {
createSlot,
getSlots,
getSlotsByTrek,
deleteSlot
} from "../controllers/slotController.js";

const router = express.Router();

router.get("/",getSlots);

router.get("/:trekId",getSlotsByTrek);

router.post("/",createSlot);

router.delete("/:id",deleteSlot);

export default router;