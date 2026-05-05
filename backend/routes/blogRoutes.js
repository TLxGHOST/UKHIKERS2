import express from "express";
import {
  getBlogs,
  getBlogById
} from "../controllers/blogController.js";

const router = express.Router();

/* GET ALL BLOGS */
router.get("/", getBlogs);

/* GET SINGLE BLOG */
router.get("/:id", getBlogById);

export default router;