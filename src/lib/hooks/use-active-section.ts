"use client";

import { useEffect, useState } from "react";

export interface ActiveSectionInfo {
  id: string;
  label: string;
  number: string;
}

export const SECTION_MAP: ActiveSectionInfo[] = [
  { id: "home", label: "HOME", number: "01" },
  { id: "services", label: "SERVICES", number: "02" },
  { id: "our-approach", label: "OUR APPROACH", number: "03" },
  { id: "menu", label: "MENU", number: "04" },
  { id: "why", label: "WHY US", number: "05" },
  { id: "contact", label: "CONTACT", number: "06" },
];

export function useActiveSection() {
  const [activeSection, setActiveSection] = useState<ActiveSectionInfo>(
    SECTION_MAP[0]
  );

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          const currentId = visible[0].target.id;
          const match = SECTION_MAP.find((item) => item.id === currentId);
          if (match) {
            setActiveSection(match);
          }
        }
      },
      {
        rootMargin: "-24% 0px -58% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75],
      }
    );

    SECTION_MAP.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return activeSection;
}
