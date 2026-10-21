import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, Menu, Mountain, X } from "lucide-react";

const Navbar = ({ isScrolled }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");
  const isActive = (path) => location.pathname === path;
  const closeMenu = () => setMobileMenuOpen(false);
  const logout = () => {
    localStorage.removeItem("adminToken");
    closeMenu();
    navigate("/");
    window.location.reload();
  };

  useEffect(() => { closeMenu(); }, [location.pathname]);
  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const handleKeyDown = (event) => { if (event.key === "Escape") closeMenu(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const links = [
    { to: "/", label: "Home" },
    { to: "/equipment", label: "Explore treks" },
    { to: "/about", label: "Our story" },
    { to: "/track-booking", label: "Track booking" },
  ];

  return (
    <header className={`site-nav ${isScrolled ? "site-nav--scrolled" : ""}`}>
      <nav className="site-nav__inner" aria-label="Main navigation">
        <Link to="/" className="site-nav__brand" aria-label="UK Hikers home">
          <span className="site-nav__mark"><Mountain size={21} strokeWidth={2.2} /></span>
          <span className="site-nav__wordmark">UK<span>HIKERS</span><small>FIND YOUR OUT THERE</small></span>
        </Link>
        <div className="site-nav__links">
          {links.map((link) => <Link key={link.to} to={link.to} className={`site-nav__link ${isActive(link.to) ? "is-active" : ""}`}>{link.label}</Link>)}
          {token && <><Link to="/admin" className="site-nav__link">Dashboard</Link><button type="button" onClick={logout} className="site-nav__link site-nav__logout">Log out</button></>}
        </div>
        <Link to="/equipment" className="site-nav__cta">Start exploring <ArrowUpRight size={16} /></Link>
        <button type="button" className="site-nav__menu-toggle" aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" onClick={() => setMobileMenuOpen((open) => !open)}>
          {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </nav>
      {mobileMenuOpen && <div className="site-nav__mobile" id="mobile-navigation">
        {links.map((link) => <Link key={link.to} to={link.to} onClick={closeMenu} className={isActive(link.to) ? "is-active" : ""}>{link.label}<ArrowUpRight size={16} /></Link>)}
        {token && <><Link to="/admin" onClick={closeMenu}>Dashboard<ArrowUpRight size={16} /></Link><button type="button" onClick={logout}>Log out</button></>}
        <Link to="/equipment" onClick={closeMenu} className="site-nav__mobile-cta">Find your next trek <ArrowUpRight size={17} /></Link>
      </div>}
    </header>
  );
};
export default Navbar;