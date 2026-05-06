import { NavLink } from "react-router-dom";
import { X } from "lucide-react";

const Sidebar = ({ onClose }) => {
  const linkClass = "block px-4 py-2 rounded-lg transition hover:bg-gray-700";
  const activeClass = "bg-gray-700";

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full shadow-xl">
      {/* Logo & Close Button */}
      <div className="p-5 border-b border-gray-700 flex justify-between items-center">
        <div className="text-2xl font-bold">UK Hikers</div>
        <button
          onClick={onClose}
          className="md:hidden text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
          onClick={onClose}
        >
          📊 Dashboard
        </NavLink>

        <NavLink
          to="/admin/bookings"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
          onClick={onClose}
        >
          📋 Bookings
        </NavLink>

        <NavLink
          to="/admin/payments"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
          onClick={onClose}
        >
          💳 Payments
        </NavLink>

        <NavLink
          to="/admin/treks"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
          onClick={onClose}
        >
          🏔 Treks
        </NavLink>

        <NavLink
          to="/admin/reviews"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
          onClick={onClose}
        >
          ⭐ Reviews
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        Admin Panel
      </div>
    </div>
  );
};

export default Sidebar;
