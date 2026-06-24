"use client";

import { useEffect } from "react";

const backgroundFormulas = [
  "σ₁ = (α, β, δ, {xʰ}h=0ⁿ⁻¹, {γ⁻¹oᵢ(x)}i=0ˡ⁻¹)",
  "O_prv := δ⁻¹(A + U*α + V*α² + W*α³ + B*α⁴ - ηO_mid - O_pub)",
  "P_g→h(θ) := ∏(d + ωYʰθ₀ + ωʲθ₁ + θ₂) / ∏(d + ωYᵍθ₀ + ωʲθ₁ + θ₂)",
  "R_xyG - R′xyF = r(χ, ζ)g(x, y) - r(ωm⁻¹χ, ζ)f(x, y)",
  "Πχ := (x - χ)⁻¹(P_A + κ₁(V* - V*x,y) + κ₁²P_C)",
];

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
        {backgroundFormulas.slice(0, 3).map((formula) => (
          <span key={formula}>{formula}</span>
        ))}
      </div>
      <div className="background-layer background-layer--formula-mid">
        {backgroundFormulas.slice(2).map((formula) => (
          <span key={formula}>{formula}</span>
        ))}
      </div>
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
