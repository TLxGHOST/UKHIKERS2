import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = ({ isScrolled }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const isActive = (path) => location.pathname === path;

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
    window.location.reload();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest(".mobile-menu-container")) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-[#0b1d26cc] backdrop-blur-sm" : "bg-transparent"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link
            to="/"
            className="text-white font-[Playfair_Display] font-bold text-2xl tracking-wide"
          >
            UK HIKERS
          </Link>
          <div className="hidden md:flex space-x-8">
            {/* Desktop nav unchanged */}
            <Link
              to="/"
              className={`text-white px-3 py-2 text-sm font-medium ${isActive("/") ? "border-b-2 border-yellow-500" : ""}`}
            >
              Home
            </Link>
            <Link
              to="/equipment"
              className={`text-white px-3 py-2 text-sm font-medium ${isActive("/equipment") ? "border-b-2 border-yellow-500" : ""}`}
            >
              Treks
            </Link>
            <Link
              to="/about"
              className={`text-white px-3 py-2 text-sm font-medium ${isActive("/about") ? "border-b-2 border-yellow-500" : ""}`}
            >
              About
            </Link>
            <Link
              to="/track-booking"
              className="text-white px-3 py-2 text-sm font-medium"
            >
              Track Booking
            </Link>
            {!token ? (
              <Link
                to="/admin/login"
                className="text-white px-3 py-2 text-sm font-medium hover:text-yellow-400"
              ></Link>
            ) : (
              <>
                <Link
                  to="/admin"
                  className="text-white px-3 py-2 text-sm font-medium hover:text-yellow-400"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-white px-3 py-2 text-sm font-medium hover:text-red-400"
                >
                  Logout
                </button>
              </>
            )}
          </div>
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i
              className={`fas ${mobileMenuOpen ? "fa-times" : "fa-bars"} text-xl`}
            ></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mobile-menu-container bg-[#0b1d26]">
          <Link
            to="/"
            className="block px-4 py-3 text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/equipment"
            className="block px-4 py-3 text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            Treks
          </Link>
          <Link
            to="/about"
            className="block px-4 py-3 text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link
            to="/track-booking"
            className="block px-4 py-3 text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            Track Booking
          </Link>
          {!token ? (
            <Link
              to="/admin/login"
              className="block px-4 py-3 text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin Login
            </Link>
          ) : (
            <>
              <Link
                to="/admin"
                className="block px-4 py-3 text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-white"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
