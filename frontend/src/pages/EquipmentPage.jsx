import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Clock3, MapPin, Mountain, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const EquipmentPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchTreks = async () => {
      try {
        const res = await fetch(`${API}/blogs`);
        const data = await res.json();
        setTreks(data.data || []);
      } catch (error) {
        console.error("Error fetching treks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTreks();
  }, []);

  return (
    <div className="trek-page">
      <Navbar isScrolled={isScrolled} />
      <section className="trek-hero">
        <div className="trek-hero__image" aria-hidden="true" />
        <div className="trek-hero__shade" aria-hidden="true" />
        <div className="trek-hero__content">
          <span className="trek-hero__eyebrow"><Mountain size={15} /> THE MOUNTAINS ARE WAITING</span>
          <h1>Pick your<br /><span>kind of wild.</span></h1>
          <p>From first-time trail days to high-altitude horizons, find a trek that gets you out there.</p>
          <div className="trek-hero__meta"><span><MapPin size={15} /> Uttarakhand, India</span><span><Sparkles size={15} /> Curated for real adventure</span></div>
        </div>
        <span className="trek-hero__index" aria-hidden="true">EXPLORE / 01</span>
      </section>

      <section className="trek-listing">
        <div className="trek-listing__heading">
          <div><span className="trek-listing__eyebrow">YOUR NEXT CHAPTER</span><h2>Find your trail<span>.</span></h2></div>
          {!loading && <p>{treks.length} {treks.length === 1 ? "experience" : "experiences"} to explore</p>}
        </div>

        {loading ? (
          <div className="trek-state"><span className="loader" /><p>Finding the trails...</p></div>
        ) : treks.length === 0 ? (
          <div className="trek-state"><Mountain size={34} /><h3>New trails are on the way.</h3><p>Check back soon for your next mountain escape.</p></div>
        ) : (
          <div className="trek-grid">
            {treks.map((trek, index) => (
              <article key={trek._id} className="trek-card">
                <Link to={`/blog/${trek._id}`} className="trek-card__image-link" aria-label={`View ${trek.title}`}>
                  <div className="trek-card__image-wrap">
                    <img src={trek.imageUrl || "/assets/images/6.jpg"} alt={trek.title} loading="lazy" />
                    <span className="trek-card__number">{String(index + 1).padStart(2, "0")}</span>
                    {trek.discount ? <span className="trek-card__discount">{trek.discount}% OFF</span> : null}
                    <span className="trek-card__image-arrow"><ArrowUpRight size={20} /></span>
                  </div>
                </Link>
                <div className="trek-card__body">
                  <div className="trek-card__eyebrow"><Mountain size={13} /> HIMALAYAN ESCAPE</div>
                  <h3><Link to={`/blog/${trek._id}`}>{trek.title}</Link></h3>
                  <p className="trek-card__excerpt">{trek.excerpt || "Discover a memorable route through the mountains with the UK Hikers crew."}</p>
                  <div className="trek-card__facts">
                    <div><span>DIFFICULTY</span><strong>{trek.difficulty || "All levels"}</strong></div>
                    <div><span>DURATION</span><strong><Clock3 size={13} /> {trek.duration || "See details"}</strong></div>
                  </div>
                  <div className="trek-card__bottom">
                    <div><span>FROM</span><strong>₹{Number(trek.price || 0).toLocaleString("en-IN")}</strong></div>
                    <Link to={`/blog/${trek._id}`} className="trek-card__cta">Explore trek <ArrowUpRight size={16} /></Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default EquipmentPage;