import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";
import Blog from "../models/Blog.js";

/* ADMIN LOGIN */
export const loginAdmin = async (req, res) => {

  try {

    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};


/* CREATE BLOG (ADMIN ONLY) */
export const createBlog = async (req, res) => {

  try {

    const blog = new Blog(req.body);

    await blog.save();

    res.json({
      message: "Blog created successfully",
      blog
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Error creating blog" });

  }

};
export const deleteBlog = async (req,res) => {

  try{

    const { id } = req.params;

    await Blog.findByIdAndDelete(id);

    res.json({message:"Trek deleted successfully"});

  }catch(err){

    console.error(err);
    res.status(500).json({message:"Error deleting trek"});

  }

};
export const updateBlog = async (req, res) => {

  try {

    const { id } = req.params;

    const updated = await Blog.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    res.json(updated);

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Update failed" });

  }

};