import { useEffect, useRef } from "react";

const ContentSection = ({
  number,
  title,
  text,
  imagePosition,
  tag,
  imageUrl,
}) => {
  const sectionRef = useRef(null);
  const numberRef = useRef(null);
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          setTimeout(() => {
            if (numberRef.current) {
              numberRef.current.style.opacity = "1";
              numberRef.current.style.transform = "translateY(0)";
            }
          }, 100);

          setTimeout(() => {
            if (titleRef.current) {
              titleRef.current.style.opacity = "1";
              titleRef.current.style.transform = "translateY(0)";
            }
          }, 300);

          setTimeout(() => {
            if (textRef.current) {
              textRef.current.style.opacity = "1";
              textRef.current.style.transform = "translateY(0)";
            }
          }, 500);

          setTimeout(() => {
            if (imageRef.current) {
              imageRef.current.style.opacity = "1";
              imageRef.current.style.transform = "scale(1)";
            }
          }, 700);

          observer.disconnect();
        });
      },
      { threshold: 0.2 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  const getFallbackImage = (num) => {
    switch (num) {
      case "01":
        return "/assets/images/hiking-gear.jpg";
      case "02":
        return "/assets/images/8.jpg";
      case "03":
        return "/assets/images/5.jpg";
      default:
        return "/assets/images/13.jpg";
    }
  };

  const imageSrc = imageUrl || getFallbackImage(number);

  return (
    <div
      ref={sectionRef}
      className="min-h-[90vh] flex items-center w-full px-4 sm:px-6 lg:px-8 py-20"
    >
      <div
        className={`max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center ${imagePosition === "left" ? "md:grid-flow-row-dense" : ""}`}
      >
        {/* Text Content */}
        <div className={`${imagePosition === "left" ? "md:col-start-2" : ""}`}>
          {/* Tag */}
          <div className="inline-flex items-center mb-8 text-[#fbd784]">
            <span className="h-[1px] w-8 bg-[#fbd784] mr-4"></span>
            <p className="uppercase tracking-widest text-sm">{tag}</p>
          </div>

          {/* Section Number */}
          <div
            ref={numberRef}
            className="text-[10rem] font-bold text-white opacity-10 leading-none font-[Playfair_Display] absolute -z-10 transform translate-y-[-2rem] md:translate-y-[-4rem]"
            style={{
              opacity: 0,
              transform: "translateY(40px)",
              transition: "all 0.7s ease-out",
            }}
          >
            {number}
          </div>

          {/* Title */}
          <h2
            ref={titleRef}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-[Playfair_Display] leading-tight mb-8 relative z-10"
            style={{
              opacity: 0,
              transform: "translateY(30px)",
              transition: "all 0.7s ease-out",
            }}
          >
            {title}
          </h2>

          {/* Text */}
          <p
            ref={textRef}
            className="text-base md:text-lg text-[#d1d1d1] mb-8 leading-relaxed max-w-lg"
            style={{
              opacity: 0,
              transform: "translateY(20px)",
              transition: "all 0.7s ease-out",
            }}
          >
            {text}
          </p>
        </div>

        {/* Image */}
        <div
          ref={imageRef}
          className="relative h-[50vh] md:h-[60vh] rounded-xl overflow-hidden shadow-xl transform hover:scale-[1.02] transition-all duration-500"
          style={{
            opacity: 0,
            transform: "scale(0.95)",
            transition: "all 0.7s ease-out",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          }}
        >
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover object-center rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default ContentSection;
