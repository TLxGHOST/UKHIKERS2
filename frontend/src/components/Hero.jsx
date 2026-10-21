import { ArrowDownRight, ArrowUpRight, Compass, Mountain } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => (
  <div className="adventure-hero">
    <div className="adventure-hero__image" aria-hidden="true" />
    <div className="adventure-hero__shade" aria-hidden="true" />
    <div className="adventure-hero__grid" aria-hidden="true" />
    <div className="adventure-hero__content">
      <div className="adventure-eyebrow">
        <span className="adventure-eyebrow__icon"><Mountain size={15} /></span>
        <span>For the wild at heart</span><span className="adventure-eyebrow__line" />
        <span className="adventure-eyebrow__location">Uttarakhand · India</span>
      </div>
      <h1 className="adventure-hero__title">TAKE THE<span>SCENIC</span><span className="adventure-hero__last-line">ROUTE<span className="adventure-hero__period">.</span></span></h1>
      <div className="adventure-hero__bottom">
        <p className="adventure-hero__description">Bigger skies. Quieter trails. Stories worth the climb. Find your next mountain escape with people who know the way.</p>
        <div className="adventure-hero__actions">
          <Link to="/equipment" className="adventure-button adventure-button--accent">Find your trek <ArrowUpRight size={18} /></Link>
          <Link to="/about" className="adventure-button adventure-button--ghost">Meet the hikers <ArrowDownRight size={17} /></Link>
        </div>
      </div>
    </div>
    <div className="adventure-hero__side-note" aria-hidden="true"><span>GO FURTHER</span><span>FEEL MORE</span><span>LEAVE LIGHTLY</span></div>
    <a className="adventure-hero__scroll" href="#trail-stories" aria-label="Scroll to discover"><span>SCROLL TO DISCOVER</span><span className="adventure-hero__scroll-line" /></a>
    <div className="adventure-hero__stamp" aria-hidden="true"><Compass size={19} /><span>YOUR NEXT<br />CHAPTER IS OUT THERE</span></div>
  </div>
);
export default Hero;