import { useState } from "react";
import useBookings from "../hooks/useBookings";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";

const AdminBookings = () => {
  const { bookings, loading, approveBooking, rejectBooking } = useBookings();
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone?.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || booking.bookingStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (id) => {
    if (window.confirm("Approve this booking?")) {
      await approveBooking(id);
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Reject this booking? This action cannot be undone.")) {
      await rejectBooking(id);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Fully Paid
          </span>
        );
      case "partial":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Partially Paid
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unpaid
          </span>
        );
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.bookingStatus === "pending").length,
    approved: bookings.filter((b) => b.bookingStatus === "approved").length,
    rejected: bookings.filter((b) => b.bookingStatus === "rejected").length,
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Stats */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Bookings Management
        </h1>
        <p className="text-sm text-gray-500">
          Manage and track all trek bookings
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No bookings found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm
              ? "Try adjusting your search"
              : "Bookings will appear here when customers book treks"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              {/* Main Row */}
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Customer Info */}
                  {/* Customer Info - with booking ID */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {booking.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {booking.name}
                        </h3>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                          ID: {booking._id}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {booking.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {booking.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trek Info */}
                  <div className="flex items-center gap-4">
                    <div className="text-center px-4">
                      <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Trek
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {booking.trekId?.title || "N/A"}
                      </p>
                    </div>
                    <div className="text-center px-4 border-l">
                      <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Date
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {booking.slotId?.date
                          ? new Date(booking.slotId.date).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "N/A"}
                      </p>
                    </div>
                    <div className="text-center px-4 border-l">
                      <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                        <Users className="w-3 h-3" />
                        Persons
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {booking.persons}
                      </p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(booking.bookingStatus)}
                      </div>
                      <div className="flex items-center gap-2">
                        {getPaymentStatusBadge(booking.paymentStatus)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {booking.bookingStatus === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(booking._id)}
                            className="px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(booking._id)}
                            className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() =>
                          setExpandedBooking(
                            expandedBooking === booking._id
                              ? null
                              : booking._id,
                          )
                        }
                        className="px-2 py-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {expandedBooking === booking._id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedBooking === booking._id && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">
                          Total Amount
                        </p>
                        <p className="text-lg font-bold text-gray-800">
                          ₹{booking.totalAmount?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">
                          Amount Paid
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          ₹{booking.amountPaid?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">
                          Amount Remaining
                        </p>
                        <p className="text-lg font-bold text-red-600">
                          ₹{booking.amountRemaining?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>

                    {/* Payment Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Payment Progress</span>
                        <span>
                          {booking.totalAmount > 0
                            ? Math.round(
                                (booking.amountPaid / booking.totalAmount) *
                                  100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            booking.paymentStatus === "paid"
                              ? "bg-green-500"
                              : booking.paymentStatus === "partial"
                                ? "bg-blue-500"
                                : "bg-gray-400"
                          }`}
                          style={{
                            width: `${
                              booking.totalAmount > 0
                                ? Math.round(
                                    (booking.amountPaid / booking.totalAmount) *
                                      100,
                                  )
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Booked on{" "}
                      {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
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

export default AdminBookings;
