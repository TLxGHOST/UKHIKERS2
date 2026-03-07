import dotenv from "dotenv";
import Blog from "./models/Blog.js";
import connectDB from "./config/db.js";

import { blogList } from "../frontend/src/data/blogs/blogs.js";

dotenv.config();

const seedBlogs = async () => {
  try {
    await connectDB();

    await Blog.deleteMany();

    console.log("Inserting blogs:", blogList.length);

    await Blog.insertMany(blogList);

    console.log("Blogs inserted successfully");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedBlogs();