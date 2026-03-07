import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const elements = [titleRef.current, subtitleRef.current, buttonRef.current];

    elements.forEach((el) => {
      if (el) {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
      }
    });

    setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.style.transition = "all 0.8s ease-out";
        titleRef.current.style.opacity = "1";
        titleRef.current.style.transform = "translateY(0)";
      }
    }, 300);

    setTimeout(() => {
      if (subtitleRef.current) {
        subtitleRef.current.style.transition = "all 0.8s ease-out";
        subtitleRef.current.style.opacity = "1";
        subtitleRef.current.style.transform = "translateY(0)";
      }
    }, 600);

    setTimeout(() => {
      if (buttonRef.current) {
        buttonRef.current.style.transition = "all 0.8s ease-out";
        buttonRef.current.style.opacity = "1";
        buttonRef.current.style.transform = "translateY(0)";
      }
    }, 900);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('/assets/images/6.jpg')",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-[#0b1d26] opacity-40"></div>
      </div>

      {/* Content */}
      <div className="z-10 text-center max-w-4xl">
        <div className="inline-flex items-center mb-8 text-[#e0f0e9]">
          <span className="h-[1px] w-8 bg-[#e0f0e9] mr-4"></span>
          <p className="uppercase tracking-widest text-sm">Hike With Us</p>
        </div>

        <h1
          ref={titleRef}
          className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-white font-[Playfair_Display] leading-tight mb-6"
        >
          Be Prepared For The Mountains And Beyond!
        </h1>

        <p
          ref={subtitleRef}
          className="text-lg md:text-xl text-[#d1d1d1] mb-10"
        >
          A Hiking Trip for Nature Lovers and Adventurers Alike.
        </p>

        <Link
          ref={buttonRef}
          to="/equipment"
          className="inline-flex items-center space-x-2 px-8 py-3 border border-white text-white hover:bg-[#1a2c35] rounded-lg transition-all duration-300"
        >
          <span>Explore Now</span>
          <i className="fas fa-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
};

export default Hero;
