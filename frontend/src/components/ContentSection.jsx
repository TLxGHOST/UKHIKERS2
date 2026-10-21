import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

const ContentSection = ({ number, title, text, imagePosition, tag, imageUrl }) => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const fallbackImages = { "01": "/assets/images/hiking-gear.jpg", "02": "/assets/images/8.jpg", "03": "/assets/images/5.jpg" };
  const imageSrc = imageUrl || fallbackImages[number] || "/assets/images/13.jpg";

  return (
    <article ref={sectionRef} className={`nature-story ${imagePosition === "left" ? "nature-story--image-left" : ""} ${isVisible ? "nature-story--visible" : ""}`}>
      <div className="nature-story__copy">
        <div className="nature-story__eyebrow"><Leaf size={14} /> {tag}</div>
        <span className="nature-story__number" aria-hidden="true">{number}</span>
        <h2>{title}</h2>
        <p>{text}</p>
        <Link to="/equipment" className="nature-story__link">Find your trail <ArrowUpRight size={17} /></Link>
      </div>
      <div className="nature-story__visual">
        <img src={imageSrc} alt={title} loading="lazy" />
        <span className="nature-story__image-note">A LITTLE CLOSER TO NATURE <span>·</span> {number}</span>
      </div>
    </article>
  );
};

export default ContentSection;
