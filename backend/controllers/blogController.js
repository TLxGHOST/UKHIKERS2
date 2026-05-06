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

/* CREATE BLOG */
export const createBlog = async (req, res) => {
  try {
    const blog = await Blog.create(req.body);

    res.status(201).json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create blog"
    });
  }
};

/* UPDATE BLOG */
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog id"
      });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    res.json({
      success: true,
      data: updatedBlog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update blog"
    });
  }
};

/* DELETE BLOG */
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog id"
      });
    }

    await Blog.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Blog deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete blog"
    });
  }
};