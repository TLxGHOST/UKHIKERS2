import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Clock3, MapPin, Mountain, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/trek-interactions.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const DIFFICULTIES = ["All levels", "Easy", "Moderate", "Difficult"];

const EquipmentPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficulty, setDifficulty] = useState("All levels");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchTreks = async () => {
      try {
        const res = await fetch(`${API}/blogs`);
        if (!res.ok) throw new Error("Could not load treks");
        const data = await res.json();
        setTreks(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error("Error fetching treks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTreks();
  }, []);

  const filteredTreks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const filtered = treks.filter((trek) => {
      const matchesSearch = !query || [trek.title, trek.excerpt, trek.description, trek.location, trek.difficulty]
        .some((value) => String(value || "").toLowerCase().includes(query));
      const trekDifficulty = String(trek.difficulty || "").toLowerCase();
      const matchesDifficulty = difficulty === "All levels" || trekDifficulty.includes(difficulty.toLowerCase());
      return matchesSearch && matchesDifficulty;
    });

    if (sortBy === "price-low") filtered.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sortBy === "price-high") filtered.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    if (sortBy === "name") filtered.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
    return filtered;
  }, [treks, searchTerm, difficulty, sortBy]);

  const clearFilters = () => {
    setSearchTerm("");
    setDifficulty("All levels");
    setSortBy("featured");
  };
  const hasActiveFilters = searchTerm.trim() || difficulty !== "All levels" || sortBy !== "featured";

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

      <section className="trek-listing" aria-labelledby="trek-listing-title">
        <div className="trek-listing__heading">
          <div><span className="trek-listing__eyebrow">YOUR NEXT CHAPTER</span><h2 id="trek-listing-title">Find your trail<span>.</span></h2></div>
          {!loading && <p aria-live="polite">{filteredTreks.length} {filteredTreks.length === 1 ? "experience" : "experiences"}{hasActiveFilters ? " found" : " to explore"}</p>}
        </div>

        {!loading && treks.length > 0 && (
          <div className="trek-finder">
            <div className="trek-finder__search">
              <Search size={19} aria-hidden="true" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search treks, places, or keywords..."
                aria-label="Search treks"
              />
              {searchTerm && <button type="button" className="trek-finder__clear-search" onClick={() => setSearchTerm("")} aria-label="Clear search"><X size={16} /></button>}
            </div>
            <div className="trek-finder__bottom">
              <div className="trek-finder__difficulty" role="group" aria-label="Filter by difficulty">
                <span className="trek-finder__label"><SlidersHorizontal size={14} /> DIFFICULTY</span>
                {DIFFICULTIES.map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`trek-filter-chip ${difficulty === level ? "trek-filter-chip--active" : ""}`}
                    onClick={() => setDifficulty(level)}
                    aria-pressed={difficulty === level}
                  >{level}</button>
                ))}
              </div>
              <label className="trek-finder__sort">
                <span>SORT BY</span>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort treks">
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </label>
            </div>
            {hasActiveFilters && <button type="button" className="trek-finder__reset" onClick={clearFilters}>Reset filters <X size={14} /></button>}
          </div>
        )}

        {loading ? (
          <div className="trek-state" role="status"><span className="loader" /><p>Finding the trails...</p></div>
        ) : treks.length === 0 ? (
          <div className="trek-state"><Mountain size={34} /><h3>New trails are on the way.</h3><p>Check back soon for your next mountain escape.</p></div>
        ) : filteredTreks.length === 0 ? (
          <div className="trek-state trek-state--empty">
            <Search size={32} /><h3>No trails match just yet.</h3>
            <p>Try a different search or open up your difficulty filter.</p>
            <button type="button" className="trek-finder__reset trek-finder__reset--empty" onClick={clearFilters}>Show all treks <ArrowUpRight size={15} /></button>
          </div>
        ) : (
          <div className="trek-grid" aria-live="polite">
            {filteredTreks.map((trek, index) => (
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
