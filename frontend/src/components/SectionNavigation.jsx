import { useCallback } from "react";

const SectionNavigation = ({ activeSection, sectionCount, sectionRefs }) => {
  const navigateTo = useCallback((index) => {
    const section = sectionRefs.current?.[index];
    if (section) window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - 76, behavior: "smooth" });
  }, [sectionRefs]);

  return (
    <nav className="nature-section-nav" aria-label="Homepage sections">
      {Array.from({ length: sectionCount }, (_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => navigateTo(index)}
          className={activeSection === index ? "is-active" : ""}
          aria-label={index === 0 ? "Go to introduction" : `Go to section ${String(index).padStart(2, "0")}`}
          aria-current={activeSection === index ? "location" : undefined}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
        </button>
      ))}
    </nav>
  );
};

export default SectionNavigation;
