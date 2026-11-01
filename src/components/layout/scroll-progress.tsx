"use client";

import React, { useEffect, useState } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const maxScroll =
            document.documentElement.scrollHeight - window.innerHeight;
          const currentProgress =
            maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
          setProgress(currentProgress);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      id="scrollProgress"
      aria-hidden="true"
      className="fixed top-0 left-0 h-[3px] z-[100] transition-[width] duration-75 ease-out pointer-events-none"
      style={{
        width: `${progress}%`,
        background: "linear-gradient(90deg, #c49b3b, #f1d98b)",
        boxShadow: "0 0 9px rgba(216, 182, 92, 0.55)",
      }}
    />
  );
}
