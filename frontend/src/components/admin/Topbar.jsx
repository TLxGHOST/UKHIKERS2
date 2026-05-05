import { useNavigate } from "react-router-dom";

const Topbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Admin Panel</h1>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-3 py-1 rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default Topbar;
