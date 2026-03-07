import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BlogCard from "../components/blog/BlogCard";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${API}/blogs`);
        const data = await res.json();

        setBlogs(data);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1d26] text-white">
        <Navbar isScrolled={isScrolled} />

        <div className="flex items-center justify-center min-h-[60vh]">
          Loading Blogs...
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1d26] text-white">
      <Navbar isScrolled={isScrolled} />

      <div className="max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default BlogPage;
