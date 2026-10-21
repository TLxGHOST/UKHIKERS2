import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, ChevronDown, Heart, Menu, Mountain, ReceiptText, UserRound, X } from "lucide-react";

const Navbar = ({ isScrolled }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [customerName, setCustomerName] = useState(() => {
    try { return JSON.parse(localStorage.getItem("customerUser") || "null")?.name || "My account"; } catch { return "My account"; }
  });
  const location = useLocation();
  const navigate = useNavigate();
  const customerToken = localStorage.getItem("customerToken");
  const isActive = (path) => location.pathname === path;
  const closeMenu = () => setMobileMenuOpen(false);
  useEffect(() => { setMobileMenuOpen(false); setAccountMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    const syncCustomer = () => {
      try { setCustomerName(JSON.parse(localStorage.getItem("customerUser") || "null")?.name || "My account"); } catch { setCustomerName("My account"); }
    };
    window.addEventListener("storage", syncCustomer);
    window.addEventListener("customer-auth-changed", syncCustomer);
    return () => { window.removeEventListener("storage", syncCustomer); window.removeEventListener("customer-auth-changed", syncCustomer); };
  }, []);

  const customerLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerUser");
    setCustomerName("My account");
    setAccountMenuOpen(false);
    closeMenu();
    navigate("/", { replace: true });
    window.location.reload();
  };
  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const handleKeyDown = (event) => { if (event.key === "Escape") setMobileMenuOpen(false); };
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
    <header className={`site-nav nature-nav ${isScrolled || location.pathname !== "/" ? "site-nav--scrolled" : ""}`}>
      <nav className="site-nav__inner" aria-label="Main navigation">
        <Link to="/" className="site-nav__brand" aria-label="UK Hikers home">
          <span className="site-nav__mark"><Mountain size={22} strokeWidth={1.9} /></span>
          <span className="site-nav__wordmark">UK HIKERS<small>WANDER WELL. LEAVE LIGHTLY.</small></span>
        </Link>
        <div className="site-nav__links">
          {links.map((link) => <Link key={link.to} to={link.to} className={`site-nav__link ${isActive(link.to) ? "is-active" : ""}`}>{link.label}</Link>)}
          {customerToken ? <div className="customer-nav-account">
            <button type="button" className={`site-nav__link customer-nav-trigger ${accountMenuOpen ? "is-active" : ""}`} aria-expanded={accountMenuOpen} onClick={() => setAccountMenuOpen((open) => !open)}><UserRound size={15} /><span>{customerName}</span><ChevronDown size={14} /></button>
            {accountMenuOpen && <div className="customer-nav-dropdown">
              <Link to="/account"><UserRound size={15} /> My profile</Link>
              <Link to="/account#bookings"><Mountain size={15} /> My bookings</Link>
              <Link to="/account#wishlist"><Heart size={15} /> My wishlist</Link>
              <Link to="/account#invoices"><ReceiptText size={15} /> My invoices</Link>
              <button type="button" onClick={customerLogout}><X size={15} /> Sign out</button>
            </div>}
          </div> : <Link to="/login" className={`site-nav__link ${isActive("/login") || isActive("/register") ? "is-active" : ""}`}>Sign in</Link>}
        </div>
        <Link to="/equipment" className="site-nav__cta">Find a trek <ArrowUpRight size={16} /></Link>
        <button type="button" className="site-nav__menu-toggle" aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" onClick={() => setMobileMenuOpen((open) => !open)}>
          {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </nav>
      {mobileMenuOpen && <div className="site-nav__mobile" id="mobile-navigation">
        {links.map((link) => <Link key={link.to} to={link.to} onClick={closeMenu} className={isActive(link.to) ? "is-active" : ""}>{link.label}<ArrowUpRight size={16} /></Link>)}
        {customerToken ? <>
          <div className="site-nav__mobile-label">SIGNED IN AS {customerName.toUpperCase()}</div>
          <Link to="/account" onClick={closeMenu}>My profile<ArrowUpRight size={16} /></Link>
          <Link to="/account#bookings" onClick={closeMenu}>My bookings<ArrowUpRight size={16} /></Link>
          <Link to="/account#wishlist" onClick={closeMenu}>My wishlist<Heart size={16} /></Link>
          <Link to="/account#invoices" onClick={closeMenu}>My invoices<ReceiptText size={16} /></Link>
          <button type="button" onClick={customerLogout}>Sign out</button>
        </> : <Link to="/login" onClick={closeMenu}>Sign in<ArrowUpRight size={16} /></Link>}
        <Link to="/equipment" onClick={closeMenu} className="site-nav__mobile-cta">Find your next trek <ArrowUpRight size={17} /></Link>
      </div>}
    </header>
  );
};

export default Navbar;
