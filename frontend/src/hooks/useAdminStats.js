import { useEffect, useState } from "react";
import api from "../api/axios";

const useAdminStats = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data.stats);
      setRevenueData(res.data.revenueByDate);
    } catch (err) {
      console.error("Stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, revenueData, loading };
};

export default useAdminStats;