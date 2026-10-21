import { useEffect, useRef } from "react";
import { ArrowDown, ArrowUpRight, Leaf, Sprout } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return undefined;

    let frameId = 0;
    const updateScrollFade = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const distance = Math.max(1, hero.offsetHeight * 0.58);
        const progress = Math.min(1, Math.max(0, (window.scrollY - hero.offsetTop) / distance));
        hero.style.setProperty("--hero-scroll-progress", progress.toFixed(3));
        hero.style.setProperty("--hero-scroll-offset", `${-progress * 38}px`);
      });
    };

    updateScrollFade();
    window.addEventListener("scroll", updateScrollFade, { passive: true });
    window.addEventListener("resize", updateScrollFade);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updateScrollFade);
      window.removeEventListener("resize", updateScrollFade);
    };
  }, []);

  return (
    <section className="nature-hero" ref={heroRef}>
      <div className="nature-hero__photo" aria-hidden="true" />
      <div className="nature-hero__veil" aria-hidden="true" />
      <div className="nature-hero__content">
        <div className="nature-kicker"><span><Leaf size={15} /></span> Thoughtfully guided journeys · Uttarakhand, India</div>
        <h1>Find your<br /><em>kind of wild.</em></h1>
        <p className="nature-hero__intro">Step away from the everyday and into the mountains. Discover welcoming trails, local knowledge and moments that stay with you long after the journey home.</p>
        <div className="nature-hero__actions">
          <Link to="/equipment" className="nature-button">Explore our treks <ArrowUpRight size={17} /></Link>
          <Link to="/about" className="nature-text-link">A little about us <span>↗</span></Link>
        </div>
      </div>
      <div className="nature-hero__caption"><span className="nature-hero__caption-line" /> <span>THE HIMALAYAS, AT YOUR PACE</span><span className="nature-hero__caption-index">01 / 03</span></div>
      <a className="nature-hero__scroll" href="#trail-stories" aria-label="Scroll to discover"><ArrowDown size={16} /><span>Take the scenic route</span></a>
      <div className="nature-hero__badge"><Sprout size={19} /><span>Leave only<br />footprints.</span></div>
    </section>
  );
};

export default Hero;
