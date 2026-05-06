import { useState, useEffect } from "react";
import api from "../api/axios";
import {
  IndianRupee,
  CreditCard,
  Wallet,
  Smartphone,
  Search,
  Filter,
  ArrowUpRight,
  Calendar,
  User,
  MapPin,
} from "lucide-react";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Payment form
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");

  const fetchPayments = async () => {
    try {
      const res = await api.get("/payments");
      setPayments(res.data || []);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get("/admin/bookings");
      setBookings(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchBookings();
  }, []);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!selectedBooking || !amount) {
      alert("Please fill all fields");
      return;
    }

    try {
      await api.post("/payments/add", {
        bookingId: selectedBooking,
        amount: Number(amount),
        paymentMethod,
      });

      alert("Payment added successfully!");
      setShowAddPayment(false);
      setSelectedBooking("");
      setAmount("");
      setPaymentMethod("cash");
      fetchPayments();
      fetchBookings();
    } catch (err) {
      console.error("Failed to add payment:", err);
      alert(
        "Failed to add payment: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case "razorpay":
        return <CreditCard className="w-4 h-4" />;
      case "cash":
        return <Wallet className="w-4 h-4" />;
      case "upi":
        return <Smartphone className="w-4 h-4" />;
      default:
        return <IndianRupee className="w-4 h-4" />;
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case "razorpay":
        return "bg-purple-100 text-purple-700";
      case "cash":
        return "bg-green-100 text-green-700";
      case "upi":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "full":
        return "bg-green-100 text-green-700";
      case "advance":
        return "bg-yellow-100 text-yellow-700";
      case "remaining":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Get booking details by ID
  const getBookingDetails = (bookingId) => {
    if (typeof bookingId === "object" && bookingId !== null) {
      return bookingId;
    }
    return bookings.find((b) => b._id === bookingId) || null;
  };

  // Calculate total amounts
  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const razorpayTotal = payments
    .filter((p) => p.paymentMethod === "razorpay")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const cashTotal = payments
    .filter((p) => p.paymentMethod === "cash")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const upiTotal = payments
    .filter((p) => p.paymentMethod === "upi")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const filteredPayments = payments.filter((payment) => {
    const booking = getBookingDetails(payment.bookingId);
    const searchString =
      `${booking?.name || ""} ${booking?.email || ""} ${payment.amount}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesMethod =
      methodFilter === "all" || payment.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
          <p className="text-sm text-gray-500">
            Track all payment transactions
          </p>
        </div>
        <button
          onClick={() => setShowAddPayment(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <IndianRupee className="w-4 h-4" />
          Record Payment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Total Collected</p>
          <p className="text-2xl font-bold text-gray-800">
            ₹{totalCollected.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Razorpay</p>
          <p className="text-2xl font-bold text-purple-600">
            ₹{razorpayTotal.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Cash</p>
          <p className="text-2xl font-bold text-green-600">
            ₹{cashTotal.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">UPI</p>
          <p className="text-2xl font-bold text-blue-600">
            ₹{upiTotal.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Methods</option>
            <option value="razorpay">Razorpay</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
          </select>
        </div>
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No payments found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm
              ? "Try adjusting your search"
              : "Payments will appear here when recorded"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment) => {
            const booking = getBookingDetails(payment.bookingId);
            return (
              <div
                key={payment._id}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Customer & Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {booking?.name || "Unknown Customer"}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {booking?.trekId?.title || "N/A"}
                          </span>
                          {booking?.email && <span>• {booking.email}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-lg font-bold text-green-600">
                        ₹{payment.amount?.toLocaleString()}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500">Method</p>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(payment.paymentMethod)}`}
                      >
                        {getMethodIcon(payment.paymentMethod)}
                        {payment.paymentMethod?.charAt(0).toUpperCase() +
                          payment.paymentMethod?.slice(1)}
                      </span>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500">Type</p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(payment.paymentType)}`}
                      >
                        {payment.paymentType?.charAt(0).toUpperCase() +
                          payment.paymentType?.slice(1)}
                      </span>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Date
                      </p>
                      <p className="text-sm font-medium text-gray-700">
                        {new Date(payment.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                          },
                        )}
                      </p>
                    </div>

                    <ArrowUpRight className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Payment Modal */}
      {showAddPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[500px] max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Record New Payment
            </h2>

            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Booking
                </label>
                <select
                  value={selectedBooking}
                  onChange={(e) => setSelectedBooking(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm"
                  required
                >
                  <option value="">Choose a booking...</option>
                  {bookings
                    .filter((b) => b.paymentStatus !== "paid")
                    .map((booking) => (
                      <option key={booking._id} value={booking._id}>
                        {booking.name} - {booking.trekId?.title || "N/A"}
                        (Remaining: ₹{booking.amountRemaining?.toLocaleString()}
                        )
                      </option>
                    ))}
                </select>
                {selectedBooking && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    {(() => {
                      const booking = bookings.find(
                        (b) => b._id === selectedBooking,
                      );
                      if (!booking) return null;
                      return (
                        <div className="text-sm space-y-1">
                          <p>
                            <span className="font-medium">Total:</span> ₹
                            {booking.totalAmount?.toLocaleString()}
                          </p>
                          <p>
                            <span className="font-medium">Paid:</span> ₹
                            {booking.amountPaid?.toLocaleString()}
                          </p>
                          <p className="text-red-600 font-medium">
                            Remaining: ₹
                            {booking.amountRemaining?.toLocaleString()}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["razorpay", "cash", "upi"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-sm font-medium transition-all ${
                        paymentMethod === method
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {getMethodIcon(method)}
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPayment(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
