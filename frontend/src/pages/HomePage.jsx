import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SectionNavigation from "../components/SectionNavigation";
import ContentSection from "../components/ContentSection";
import Footer from "../components/Footer";
import FeaturedTreks from "../components/FeaturedTreks";

function HomePage() {
  const [activeSection, setActiveSection] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const sectionRefs = useRef([null, null, null, null]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
      const currentPosition = window.scrollY + window.innerHeight / 2;
      for (let i = sectionRefs.current.length - 1; i >= 0; i--) {
        const section = sectionRefs.current[i];
        if (section && currentPosition >= section.offsetTop) {
          setActiveSection(i);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sections = [
    {
      number: "01",
      title: "A trail for every kind of hiker.",
      text: "Every great journey starts with knowing what feels right for you. Whether this is your first mountain walk or your next summit, we help you find a trek that fits your pace, experience and sense of adventure.",
      imagePosition: "right",
      tag: "Find your pace",
    },
    {
      number: "02",
      title: "Small details. Better journeys.",
      text: "From quiet forest paths to big Himalayan views, explore thoughtfully chosen treks with clear details to help you decide where to go next.",
      imagePosition: "left",
      tag: "Choose your trail",
    },
    {
      number: "03",
      title: "Feel ready before you set off.",
      text: "Know what to expect, understand your itinerary and plan with confidence. We want you to spend less time worrying about the details and more time enjoying the way there.",
      imagePosition: "right",
      tag: "Go with confidence",
    },
  ];

  return (
    <div className="nature-home">
      <Navbar isScrolled={isScrolled} active="Explore" />
      <section ref={(el) => (sectionRefs.current[0] = el)}><Hero /></section>
      <SectionNavigation activeSection={activeSection} sectionCount={sections.length + 1} sectionRefs={sectionRefs} />
      <div className="nature-stories" id="trail-stories">
        <div className="nature-section-intro">
          <span className="nature-section-intro__eyebrow">A BETTER WAY TO GET OUT THERE</span>
          <h2>Good trails.<br /><em>Good people.</em> Great memories.</h2>
          <p>We believe the best adventures are the ones that leave you feeling a little more connected — to the mountains, and to each other.</p>
        </div>
        {sections.map((section, index) => (
          <section key={section.number} ref={(el) => (sectionRefs.current[index + 1] = el)} className="scroll-mt-20">
            <ContentSection {...section} />
          </section>
        ))}
      </div>
      <FeaturedTreks />
      <Footer />
    </div>
  );
}

export default HomePage;
