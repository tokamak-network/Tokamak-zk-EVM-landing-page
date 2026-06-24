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
      <div className="background-layer background-layer--proof-field">
        <span>TONIGMA</span>
        <span>TONIGMA</span>
      </div>
      <div className="background-layer background-layer--symbol-far" />
      <div className="background-layer background-layer--symbol-near" />
      <div className="background-layer background-layer--surface">
        <div>
          <span>policy</span>
          <strong>sealed</strong>
        </div>
        <div>
          <span>verifier</span>
          <strong>pinned</strong>
        </div>
        <div>
          <span>root</span>
          <strong>0x44b7</strong>
        </div>
        <div>
          <span>mirror</span>
          <strong>current</strong>
        </div>
      </div>
    </div>
  );
}
