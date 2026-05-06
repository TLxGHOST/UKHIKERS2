import { useState, useEffect } from "react";
import api from "../api/axios";
import { Star, CheckCircle, XCircle, AlertCircle, Eye } from "lucide-react";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchReviews = async () => {
    try {
      const res = await api.get("/reviews/admin/all", {
        params: { status: filter !== "all" ? filter : undefined },
      });
      setReviews(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/reviews/admin/${id}`, { status });
      fetchReviews();
    } catch (err) {
      alert("Failed to update review status");
    }
  };

  const stats = {
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 shadow-sm h-32"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Review Management
        </h1>
        <p className="text-sm text-gray-500">
          Approve or reject customer reviews
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span className="font-semibold text-gray-800">
                      {review.userName}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    {review.status === "approved" && (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Approved
                      </span>
                    )}
                    {review.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" /> Rejected
                      </span>
                    )}
                    {review.status === "pending" && (
                      <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>
                  <p className="text-yellow-500 text-sm mb-1">
                    {"⭐".repeat(review.rating)}
                  </p>
                  <p className="text-gray-700 text-sm mb-2">{review.comment}</p>
                  <p className="text-xs text-gray-400">
                    Trek: {review.trekId?.title || "N/A"} | Booking:{" "}
                    {review.bookingId?._id?.slice(-6) || "N/A"}
                  </p>
                </div>

                {review.status === "pending" && (
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => updateStatus(review._id, "approved")}
                      className="px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(review._id, "rejected")}
                      className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
