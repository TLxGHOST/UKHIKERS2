import useAdminStats from "../hooks/useAdminStats";

const AdminDashboard = () => {
  const { stats, revenueData, loading } = useAdminStats();

  if (loading) {
    return <p className="p-6">Loading dashboard...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p>Total Revenue</p>
          <h2 className="text-xl font-bold text-green-600">
            ₹{stats?.totalRevenue || 0}
          </h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p>Pending</p>
          <h2 className="text-xl font-bold text-red-500">
            ₹{stats?.totalPending || 0}
          </h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p>Total Bookings</p>
          <h2 className="text-xl font-bold">{stats?.totalBookings || 0}</h2>
        </div>
      </div>

      {/* Simple Revenue List */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="mb-3 font-semibold">Revenue Timeline</h2>

        {revenueData.map((r) => (
          <div key={r._id} className="flex justify-between border-b py-1">
            <span>{r._id}</span>
            <span>₹{r.revenue}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
