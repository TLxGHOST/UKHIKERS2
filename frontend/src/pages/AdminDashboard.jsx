import { useState } from "react";
import useAdminStats from "../hooks/useAdminStats";
import {
  TrendingUp,
  Users,
  IndianRupee,
  Clock,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";

const AdminDashboard = () => {
  const { stats, revenueData, loading } = useAdminStats();
  const [timeFilter, setTimeFilter] = useState("all");

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 shadow-sm h-28"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalRevenue = stats?.totalRevenue || 0;
  const totalPending = stats?.totalPending || 0;
  const totalBookings = stats?.totalBookings || 0;
  const totalCollected = totalRevenue - totalPending;
  const collectionRate =
    totalRevenue > 0 ? Math.round((totalCollected / totalRevenue) * 100) : 0;
  const avgBookingValue =
    totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

  const recentRevenue = revenueData?.slice(-7) || [];
  const previousRevenue = revenueData?.slice(-14, -7) || [];
  const recentTotal = recentRevenue.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );
  const previousTotal = previousRevenue.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );
  const revenueTrend =
    previousTotal > 0
      ? ((recentTotal - previousTotal) / previousTotal) * 100
      : 0;

  const statsCards = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      subtitle: `${collectionRate}% collected`,
      icon: IndianRupee,
      trend: revenueTrend,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Bookings",
      value: totalBookings,
      subtitle: `Avg. ₹${avgBookingValue.toLocaleString()}/booking`,
      icon: Users,
      trend: totalBookings > 0 ? 12 : 0,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Pending Amount",
      value: `₹${totalPending.toLocaleString()}`,
      subtitle: `${totalBookings > 0 ? Math.round((totalPending / totalRevenue) * 100) : 0}% of total`,
      icon: Clock,
      trend: -5,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "Collection Rate",
      value: `${collectionRate}%`,
      subtitle: "Of total revenue",
      icon: TrendingUp,
      trend: collectionRate > 50 ? 8 : -3,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
  ];

  const maxRevenue = Math.max(...revenueData.map((r) => r.revenue), 1);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time business insights
          </p>
        </div>
        <div className="flex flex-wrap gap-2 bg-white rounded-lg p-1 shadow-sm">
          {["7d", "30d", "90d", "all"].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                timeFilter === filter
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {filter === "all" ? "All Time" : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`${card.bgColor} p-2 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                {card.trend !== undefined && (
                  <div
                    className={`flex items-center space-x-1 text-xs font-medium ${card.trend >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {card.trend >= 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    <span>{Math.abs(card.trend)}%</span>
                  </div>
                )}
              </div>
              <h3 className="text-xs font-medium text-gray-500 mb-1">
                {card.title}
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">
                {card.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                Revenue Timeline
              </h2>
              <p className="text-xs text-gray-500">Daily revenue breakdown</p>
            </div>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          {revenueData.length > 0 ? (
            <div className="overflow-x-auto pb-2">
              <div className="flex items-end space-x-2 h-40 min-w-[500px] sm:min-w-full">
                {revenueData.slice(-14).map((item, index) => {
                  const height = (item.revenue / maxRevenue) * 100;
                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center group"
                    >
                      <div
                        className="w-full relative"
                        style={{ height: "140px" }}
                      >
                        <div
                          className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t hover:from-blue-600 transition-all cursor-pointer"
                          style={{ height: `${height}%` }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                            ₹{item.revenue.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 mt-2 rotate-45 origin-left sm:rotate-0">
                        {new Date(item._id).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Calendar className="w-10 h-10 mb-2" />
              <p className="text-sm">No revenue data yet</p>
            </div>
          )}
        </div>

        {/* Recent Revenue Table (vertical on mobile) */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">
              Recent Revenue
            </h2>
            <p className="text-xs text-gray-500">Last 7 days</p>
          </div>
          {recentRevenue.length > 0 ? (
            <div className="space-y-3">
              {recentRevenue
                .slice()
                .reverse()
                .map((item, index) => {
                  const percentage =
                    maxRevenue > 0
                      ? Math.round((item.revenue / maxRevenue) * 100)
                      : 0;
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-600">
                          {new Date(item._id).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <span className="text-sm font-semibold text-gray-800">
                          ₹{item.revenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Calendar className="w-10 h-10 mb-2" />
              <p className="text-sm">No recent revenue data</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Insights - Stack on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-sm">
          <h3 className="text-xs font-medium opacity-90 mb-1">
            Average Booking Value
          </h3>
          <p className="text-xl sm:text-2xl font-bold">
            ₹{avgBookingValue.toLocaleString()}
          </p>
          <p className="text-xs opacity-75 mt-1">
            Per booking across all treks
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-sm">
          <h3 className="text-xs font-medium opacity-90 mb-1">
            Pending Collections
          </h3>
          <p className="text-xl sm:text-2xl font-bold">
            ₹{totalPending.toLocaleString()}
          </p>
          <p className="text-xs opacity-75 mt-1">
            {totalBookings > 0
              ? `${Math.round((totalPending / totalRevenue) * 100)}% of total revenue`
              : "No pending amount"}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-sm">
          <h3 className="text-xs font-medium opacity-90 mb-1">
            Collection Efficiency
          </h3>
          <p className="text-xl sm:text-2xl font-bold">{collectionRate}%</p>
          <p className="text-xs opacity-75 mt-1">
            ₹{totalCollected.toLocaleString()} collected of ₹
            {totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
