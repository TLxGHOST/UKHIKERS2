import { ArrowUpRight, Mountain } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="site-footer">
    <div className="site-footer__top">
      <div className="site-footer__brand-block">
        <Link to="/" className="site-footer__brand"><span><Mountain size={22} /></span> UK HIKERS</Link>
        <p>Get out there. Find your people.<br />Come back with a story.</p>
      </div>
      <div className="site-footer__links">
        <h3>Make a plan</h3>
        <Link to="/equipment">Explore treks <ArrowUpRight size={15} /></Link>
        <Link to="/track-booking">Track a booking <ArrowUpRight size={15} /></Link>
        <Link to="/about">Our story <ArrowUpRight size={15} /></Link>
      </div>
      <div className="site-footer__note">
        <span className="site-footer__eyebrow">THE OUTDOORS IS CALLING</span>
        <h3>Your next chapter<br />is out there.</h3>
        <Link to="/equipment" className="site-footer__cta">Find your trek <ArrowUpRight size={17} /></Link>
      </div>
    </div>
    <div className="site-footer__bottom">
      <span>© {new Date().getFullYear()} UK Hikers. All rights reserved.</span>
      <span>Made for the wild at heart · <a href="https://www.tejanshu.dev/" target="_blank" rel="noopener noreferrer">TLxGHOST <ArrowUpRight size={12} /></a></span>
    </div>
  </footer>
);
export default Footer;