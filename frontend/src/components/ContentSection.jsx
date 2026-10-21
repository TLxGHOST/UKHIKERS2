import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const ContentSection = ({ number, title, text, imagePosition, tag, imageUrl }) => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
    }, { threshold: 0.18 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const fallbackImages = { "01": "/assets/images/hiking-gear.jpg", "02": "/assets/images/8.jpg", "03": "/assets/images/5.jpg" };
  const imageSrc = imageUrl || fallbackImages[number] || "/assets/images/13.jpg";
  return (
    <article ref={sectionRef} className={`story-section ${imagePosition === "left" ? "story-section--image-left" : ""} ${isVisible ? "story-section--visible" : ""}`}>
      <div className="story-section__copy">
        <div className="story-section__tag"><span />{tag}</div>
        <span className="story-section__number" aria-hidden="true">{number}</span>
        <h2>{title}</h2><p>{text}</p>
        <Link to="/equipment" className="story-section__link">Explore the trails <ArrowUpRight size={17} /></Link>
      </div>
      <div className="story-section__visual">
        <img src={imageSrc} alt={title} loading="lazy" />
        <div className="story-section__image-overlay" />
        <span className="story-section__image-index">UKH / {number}</span>
      </div>
    </article>
  );
};
export default ContentSection;