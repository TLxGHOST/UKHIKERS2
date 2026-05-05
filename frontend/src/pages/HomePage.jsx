import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SectionNavigation from "../components/SectionNavigation";
import ContentSection from "../components/ContentSection";
import Footer from "../components/Footer";

function HomePage() {
  const [activeSection, setActiveSection] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // ✅ Stable refs (do NOT recreate on every render)
  const sectionRefs = useRef([null, null, null, null]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const currentPosition = window.scrollY + window.innerHeight / 2;

      for (let i = sectionRefs.current.length - 1; i >= 0; i--) {
        const section = sectionRefs.current[i];
        if (section) {
          const sectionTop = section.offsetTop;
          if (currentPosition >= sectionTop) {
            setActiveSection(i);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sections = [
    {
      number: "01",
      title: "What kind of hiker are you?",
      text: "Every great journey starts with knowing who you are on the trail. Whether you're a first-time wanderer or a seasoned peak-chaser, we help match your experience level to the perfect trek.",
      imagePosition: "right",
      tag: "Personalized Matching",
    },
    {
      number: "02",
      title: "Choosing the Perfect Trek",
      text: "From serene forest trails to adrenaline-packed summit climbs, our curated hike listings are designed to match your vibe.",
      imagePosition: "left",
      tag: "Smart Booking",
    },
    {
      number: "03",
      title: "Plan Every Step With Confidence",
      text: "We provide trail maps, itinerary breakdowns, weather forecasts, and local insights so you’re never caught off guard.",
      imagePosition: "right",
      tag: "Seamless Planning",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#0b1d26] font-[Inter] text-[#d1d1d1]">
      {/* Navbar */}
      <Navbar isScrolled={isScrolled} active="Explore" />

      {/* Hero */}
      <section ref={(el) => (sectionRefs.current[0] = el)}>
        <Hero />
      </section>

      {/* Section Nav */}
      <SectionNavigation
        activeSection={activeSection}
        sectionCount={sections.length + 1}
        sectionRefs={sectionRefs}
      />

      {/* Content Sections */}
      {sections.map((section, index) => (
        <section
          key={section.number}
          ref={(el) => (sectionRefs.current[index + 1] = el)}
          className="scroll-mt-20"
        >
          <ContentSection {...section} />
        </section>
      ))}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default HomePage;
