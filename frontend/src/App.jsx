import { useState, useEffect, useRef } from "react";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SectionNavigation from "./components/SectionNavigation";
import ContentSection from "./components/ContentSection";
import Footer from "./components/Footer";
import AdminSlots from "./pages/AdminSlots";

function App() {
  const [activeSection, setActiveSection] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const sectionRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      // Update navbar transparency
      setIsScrolled(window.scrollY > 50);

      // Find which section is currently in view
      const currentPosition = window.scrollY + window.innerHeight / 2;

      for (let i = sectionRefs.length - 1; i >= 0; i--) {
        const section = sectionRefs[i].current;
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
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Content for each section
  const sections = [
    {
      number: "01",
      title: "What kind of hiker are you?",
      text: "Every great journey starts with knowing who you are on the trail. Whether you're a first-time wanderer or a seasoned peak-chaser, we help match your experience level to the perfect trek. No guesswork—just trails that fit your pace, skill, and sense of adventure.",
      imagePosition: "right",
      tag: "Personalized Matching",
    },
    {
      number: "02",
      title: "Choosing the Perfect Trek",
      text: "From serene forest trails to adrenaline-packed summit climbs, our curated hike listings are designed to match your vibe. With detailed filters, verified ratings, and clear difficulty tags, you’ll find the right trail, not just a random path.",
      imagePosition: "left",
      tag: "Smart Booking",
    },
    {
      number: "03",
      title: "Plan Every Step With Confidence",
      text: "Know your route, timing, and logistics—before you even lace up your boots. We provide trail maps, itinerary breakdowns, weather forecasts, and local insights so you’re never caught off guard. Adventure is thrilling, not confusing.",
      imagePosition: "right",
      tag: "Seamless Planning",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#0b1d26] font-[Inter] text-[#d1d1d1]">
      {/* Navigation */}
      <Navbar isScrolled={isScrolled} active="Explore" />

      {/* Hero Section */}
      <section ref={sectionRefs[0]}>
        <Hero />
      </section>

      {/* Scrolling Navigation */}
      <SectionNavigation
        activeSection={activeSection}
        sectionCount={sections.length + 1}
        sectionRefs={sectionRefs}
      />

      {/* Content Sections */}
      {sections.map((section, index) => (
        <section
          key={section.number}
          ref={sectionRefs[index + 1]}
          className="scroll-mt-20"
          id={`section-${section.number}`}
        >
          <ContentSection
            number={section.number}
            title={section.title}
            text={section.text}
            imagePosition={section.imagePosition}
            tag={section.tag}
          />
        </section>
      ))}

      {/* Footer */}
      <Footer />
      <Analytics />
    </div>
  );
}

export default App;
