import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

const Topbar = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
    window.location.href = "/admin/login";
  };

  return (
    <div className="bg-white shadow px-4 sm:px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        {/* Hamburger menu - visible only on mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg sm:text-xl font-semibold">Admin Panel</h1>
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 transition-colors text-sm sm:text-base"
      >
        Logout
      </button>
    </div>
  );
};

export default Topbar;
