import mongoose from "mongoose";
import Blog from "../models/Blog.js";

/* GET ALL BLOGS */
export const getBlogs = async (req, res) => {
  try {

    const blogs = await Blog.find();

    res.json(blogs);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }
};


/* GET SINGLE BLOG */
export const getBlogById = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid blog id" });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }
};