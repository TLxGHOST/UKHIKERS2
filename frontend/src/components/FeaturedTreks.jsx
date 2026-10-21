import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock3, Mountain } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/home-adventure.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function FeaturedTreks() {
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);
  const railRef = useRef(null);

  useEffect(() => {
    let active = true;
    const loadTreks = async () => {
      try {
        const response = await fetch(`${API}/blogs`);
        if (!response.ok) throw new Error("Unable to load featured treks");
        const result = await response.json();
        if (active) setTreks(Array.isArray(result.data) ? result.data.slice(0, 6) : []);
      } catch (error) {
        console.error("Error loading featured treks:", error);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadTreks();
    return () => { active = false; };
  }, []);

  const moveRail = (direction) => {
    if (!railRef.current) return;
    const card = railRef.current.querySelector(".home-trek-card");
    const distance = card ? card.getBoundingClientRect().width + 20 : 340;
    railRef.current.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  return (
    <>
      <div className="trail-marquee" aria-label="Find your own way. Breathe deeper. Leave the ordinary behind.">
        <div className="trail-marquee__track" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index}>FIND YOUR OWN WAY <i>✳</i> BREATHE DEEPER <i>✳</i> LEAVE THE ORDINARY BEHIND <i>✳</i></span>
          ))}
        </div>
      </div>

      <section className="home-featured" aria-labelledby="home-featured-title">
        <div className="home-featured__top">
          <div>
            <span className="home-featured__eyebrow"><Mountain size={15} /> THE TRAIL BOARD / 001</span>
            <h2 id="home-featured-title">Your next <em>great story.</em></h2>
            <p>Fresh air, new faces, and a view that makes the climb worth it.</p>
          </div>
          <div className="home-featured__controls">
            <button type="button" onClick={() => moveRail(-1)} aria-label="Previous treks"><ArrowLeft size={19} /></button>
            <button type="button" onClick={() => moveRail(1)} aria-label="Next treks"><ArrowRight size={19} /></button>
          </div>
        </div>

        {loading ? (
          <div className="home-featured__loading" role="status"><span className="loader" /><p>Finding your next trail...</p></div>
        ) : treks.length > 0 ? (
          <div className="home-featured__rail" ref={railRef} tabIndex={0} aria-label="Featured treks. Scroll horizontally to explore.">
            {treks.map((trek, index) => (
              <article className="home-trek-card" key={trek._id}>
                <Link to={`/blog/${trek._id}`} className="home-trek-card__image" aria-label={`Explore ${trek.title}`}>
                  <img src={trek.imageUrl || "/assets/images/6.jpg"} alt={trek.title || "Mountain trek"} loading="lazy" />
                  <span className="home-trek-card__index">FIELD NOTE / {String(index + 1).padStart(2, "0")}</span>
                  <span className="home-trek-card__arrow"><ArrowUpRight size={20} /></span>
                </Link>
                <div className="home-trek-card__body">
                  <div className="home-trek-card__meta">
                    <span><Mountain size={13} /> {trek.difficulty || "Find your pace"}</span>
                    <span><Clock3 size={13} /> {trek.duration || "See itinerary"}</span>
                  </div>
                  <h3><Link to={`/blog/${trek._id}`}>{trek.title}</Link></h3>
                  <div className="home-trek-card__bottom">
                    <span>TRIPS FROM <strong>₹{Number(trek.price || 0).toLocaleString("en-IN")}</strong></span>
                    <Link to={`/blog/${trek._id}`} aria-label={`View details for ${trek.title}`}>View trail <ArrowUpRight size={15} /></Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="home-featured__empty">
            <Mountain size={28} /><p>New trails are being prepared. Check back soon.</p>
            <Link to="/equipment">Explore UK Hikers <ArrowUpRight size={16} /></Link>
          </div>
        )}

        {treks.length > 0 && <div className="home-featured__foot"><span>SCROLL TO FIND YOUR NEXT YES <span className="home-featured__foot-line" /></span><Link to="/equipment">Explore all treks <ArrowUpRight size={16} /></Link></div>}
      </section>

      <section className="home-outro">
        <div className="home-outro__image" aria-hidden="true" />
        <div className="home-outro__shade" aria-hidden="true" />
        <div className="home-outro__content">
          <span>LESS SCROLLING. MORE SUMMITING.</span>
          <h2>The view is<br />better <em>out there.</em></h2>
          <p>Pick a trail. Bring your curiosity. We’ll help with the rest.</p>
          <Link to="/equipment">Find your next trek <ArrowUpRight size={18} /></Link>
        </div>
        <div className="home-outro__coordinates" aria-hidden="true">30° N / 79° E<br />UTTARAKHAND, INDIA</div>
      </section>
    </>
  );
}
