import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  addWishlistItem,
  removeWishlistItem,
  updatePreferences,
} from "../controllers/userController.js";
import { protectUser } from "../middleware/userAuthMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protectUser, getCurrentUser);
router.put("/preferences", protectUser, updatePreferences);
router.post("/wishlist/:trekId", protectUser, addWishlistItem);
router.delete("/wishlist/:trekId", protectUser, removeWishlistItem);

export default router;
