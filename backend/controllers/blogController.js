import mongoose from "mongoose";
import Blog from "../models/Blog.js";

/* GET ALL BLOGS */
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();

    res.json({
      success: true,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs"
    });
  }
};

/* GET SINGLE BLOG */
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog id"
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};