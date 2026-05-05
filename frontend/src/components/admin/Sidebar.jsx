import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const linkClass = "block px-4 py-2 rounded-lg transition hover:bg-gray-700";

  const activeClass = "bg-gray-700";

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-5 text-2xl font-bold border-b border-gray-700">
        UK Hikers
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          📊 Dashboard
        </NavLink>

        <NavLink
          to="/admin/bookings"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          📋 Bookings
        </NavLink>

        <NavLink
          to="/admin/payments"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          💳 Payments
        </NavLink>

        <NavLink
          to="/admin/treks"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          🏔 Treks
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
