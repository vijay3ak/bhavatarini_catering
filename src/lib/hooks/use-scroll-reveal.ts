"use client";

import { useEffect } from "react";

export function useScrollReveal() {
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const targets = Array.from(
      document.querySelectorAll(
        "section .section-head, .service, .menu-card, .why-item, .cta, .contact-info, .form, .trust-item"
      )
    );

    targets.forEach((el, i) => {
      if (i % 5 === 1) {
        el.classList.add("reveal-left");
      } else if (i % 5 === 3) {
        el.classList.add("reveal-right");
      } else {
        el.classList.add("reveal");
      }

      if (
        el.classList.contains("service") ||
        el.classList.contains("why-item")
      ) {
        (el as HTMLElement).style.transitionDelay = `${(i % 4) * 85}ms`;
      }
    });

    if (!reduceMotion && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
      );

      targets.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    } else {
      targets.forEach((el) => el.classList.add("is-visible"));
    }
  }, []);
}
