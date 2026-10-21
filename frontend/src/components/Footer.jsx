import { ArrowUpRight, Mountain, Sprout } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="site-footer nature-footer">
    <div className="nature-footer__invite">
      <span className="nature-footer__leaf"><Sprout size={20} /></span>
      <p>There's a little more room to breathe out there.</p>
      <Link to="/equipment">Find your next trek <ArrowUpRight size={17} /></Link>
    </div>
    <div className="site-footer__top">
      <div className="site-footer__brand-block">
        <Link to="/" className="site-footer__brand"><span><Mountain size={22} /></span> UK HIKERS</Link>
        <p>Thoughtful journeys.<br />Memories made outdoors.</p>
      </div>
      <div className="site-footer__links">
        <h3>Explore</h3>
        <Link to="/equipment">All treks <ArrowUpRight size={15} /></Link>
        <Link to="/track-booking">Track a booking <ArrowUpRight size={15} /></Link>
        <Link to="/about">Our story <ArrowUpRight size={15} /></Link>
      </div>
      <div className="site-footer__note">
        <span className="site-footer__eyebrow">YOUR NEXT CHAPTER</span>
        <h3>Meet us<br />on the trail.</h3>
        <Link to="/equipment" className="site-footer__cta">Browse treks <ArrowUpRight size={17} /></Link>
      </div>
    </div>
    <div className="site-footer__bottom">
      <span>© {new Date().getFullYear()} UK Hikers. All rights reserved.</span>
      <span>Made with care for the outdoors · <a href="https://www.tejanshu.dev/" target="_blank" rel="noopener noreferrer">TLxGHOST <ArrowUpRight size={12} /></a></span>
    </div>
  </footer>
);

export default Footer;
