"use client";

import { useEffect } from "react";

export function ParallaxBackground() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      if (reducedMotion.matches) {
        document.documentElement.style.setProperty("--scroll-depth", "0");
        return;
      }

      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight || 1;
      const depth = Math.min(window.scrollY / scrollable, 1);
      document.documentElement.style.setProperty(
        "--scroll-depth",
        depth.toFixed(4),
      );
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    reducedMotion.addEventListener("change", update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      reducedMotion.removeEventListener("change", update);
    };
  }, []);

  return (
    <div aria-hidden="true" className="site-background">
      <div className="background-layer background-layer--base" />
      <div className="background-layer background-layer--math-far" />
      <div className="background-layer background-layer--math-near" />
    </div>
  );
}
