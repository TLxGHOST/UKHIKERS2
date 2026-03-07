import { useCallback } from "react";

const SectionNavigation = ({ activeSection, sectionCount, sectionRefs }) => {
  const navigateTo = useCallback(
    (index) => {
      const section = sectionRefs[index]?.current;

      if (section) {
        window.scrollTo({
          top: section.offsetTop - 80,
          behavior: "smooth",
        });
      }
    },
    [sectionRefs],
  );

  return (
    <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40 hidden md:flex flex-col items-center">
      <div className="h-40 w-[1px] bg-[#8f9ca3] opacity-30 mb-4"></div>

      {/* Indicators */}
      <div className="flex flex-col space-y-8">
        {Array.from({ length: sectionCount }, (_, i) => {
          const isActive = activeSection === i;

          return (
            <button
              key={i}
              onClick={() => navigateTo(i)}
              className={`relative w-12 h-12 flex items-center justify-center text-sm font-medium
                ${isActive ? "text-white opacity-100" : "text-[#8f9ca3] opacity-70"}
                hover:text-white transition-all duration-300`}
            >
              {i === 0 ? (
                <i className="fas fa-mountain text-lg"></i>
              ) : (
                <span className="font-[Playfair_Display]">{`0${i}`}</span>
              )}

              {/* active line */}
              <span
                className={`absolute left-full ml-2 w-8 h-[1px] bg-white transition-opacity duration-300
                ${isActive ? "opacity-100" : "opacity-0"}`}
              />
            </button>
          );
        })}
      </div>

      <div className="h-40 w-[1px] bg-[#8f9ca3] opacity-30 mt-4"></div>
    </div>
  );
};

export default SectionNavigation;
