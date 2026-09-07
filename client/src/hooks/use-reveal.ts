import { useEffect, useRef } from "react";

export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reduced-motion or no IntersectionObserver: show content immediately
    // instead of leaving it hidden until a scroll trigger.
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      el.classList.add("reveal-in");
      return;
    }
    // Safety net: never leave a section hidden if the observer never fires.
    const fallback = window.setTimeout(() => el.classList.add("reveal-in"), 2500);
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("reveal-in");
            window.clearTimeout(fallback);
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => {
      window.clearTimeout(fallback);
      obs.disconnect();
    };
  }, []);
  return ref;
}
