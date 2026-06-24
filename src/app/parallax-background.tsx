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
      <div className="background-layer background-layer--proof">
        <span>state root sealed</span>
        <span>proof accepted</span>
        <span>policy mirror</span>
      </div>
      <svg className="background-layer background-layer--graph-mid" viewBox="0 0 1440 900">
        <path d="M106 214 L312 142 L520 220 L742 180" />
        <path d="M106 338 L312 260 L520 338 L742 180" />
        <path d="M312 142 L520 338" />
        <path d="M312 380 L520 220" />
        <circle cx="106" cy="214" r="10" />
        <circle cx="106" cy="338" r="10" />
        <circle cx="312" cy="142" r="8" />
        <circle cx="312" cy="260" r="8" />
        <circle cx="312" cy="380" r="8" />
        <circle cx="520" cy="220" r="9" />
        <circle cx="520" cy="338" r="9" />
        <path d="M742 154 L768 180 L742 206 L716 180 Z" />
      </svg>
      <svg className="background-layer background-layer--graph-near" viewBox="0 0 1440 900">
        <path d="M862 520 L1012 454 L1194 510 L1310 468" />
        <path d="M862 636 L1012 582 L1194 640 L1310 468" />
        <circle cx="862" cy="520" r="11" />
        <circle cx="862" cy="636" r="11" />
        <circle cx="1012" cy="454" r="9" />
        <circle cx="1012" cy="582" r="9" />
        <circle cx="1012" cy="708" r="9" />
        <circle cx="1194" cy="510" r="10" />
        <circle cx="1194" cy="640" r="10" />
        <path d="M1310 438 L1340 468 L1310 498 L1280 468 Z" />
      </svg>
      <div className="background-layer background-layer--surface">
        <div>
          <span>policy</span>
          <strong>sealed</strong>
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
