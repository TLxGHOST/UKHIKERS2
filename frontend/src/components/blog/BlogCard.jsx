import React from "react";
import { Link } from "react-router-dom";

const BlogCard = ({ post }) => {
  const blogId = post._id || post.id;

  return (
    <Link to={`/blog/${blogId}`} className="block group">
      <div className="bg-[#1a2c35] rounded-xl overflow-hidden shadow-lg h-full transition-transform duration-300 group-hover:scale-[1.02]">
        <div className="h-48 overflow-hidden relative bg-[#1a2c35]">
          <img
            src={post.imageUrl || "/assets/images/blog/hiking1.jpg"}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/assets/images/blog/hiking1.jpg";
            }}
          />

          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>

        <div className="p-5">
          <div className="flex items-center mb-3">
            <span className="text-xs uppercase tracking-wide bg-yellow-800 text-white px-2 py-1 rounded-full">
              {post.category}
            </span>
          </div>

          <h3 className="text-xl font-bold mb-3 text-white group-hover:text-yellow-500 transition-colors">
            {post.title}
          </h3>

          <p className="text-sm mb-4 text-gray-300 line-clamp-3">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{post.readTime}</span>

            <span className="group-hover:translate-x-1 transition-transform duration-300 inline-flex items-center text-xs uppercase tracking-wide bg-yellow-600 text-white px-6 py-2">
              Read more
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
