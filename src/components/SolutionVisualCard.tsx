"use client";

import React, { useMemo, useState } from "react";
import { Zap, Layers, KeyRound, ShieldCheck } from "lucide-react";

type Props = {
  iconType: "zap" | "layers" | "key" | "shield";
  title: string;
  tagline: string;
};

function renderIcon(iconType: Props["iconType"], size: number = 64) {
  switch (iconType) {
    case "zap":
      return <Zap size={size} className="text-[#4fc3f7]" />;
    case "layers":
      return <Layers size={size} className="text-[#4fc3f7]" />;
    case "key":
      return <KeyRound size={size} className="text-[#4fc3f7]" />;
    case "shield":
      return <ShieldCheck size={size} className="text-[#4fc3f7]" />;
    default:
      return <Zap size={size} className="text-[#4fc3f7]" />;
  }
}

export default function SolutionVisualCard({
  iconType,
  title,
  tagline,
}: Props) {
  const [isHovered, setIsHovered] = useState(false);

  const particles = useMemo(
    () => [
      { left: "22%", top: "28%" },
      { left: "68%", top: "22%" },
      { left: "78%", top: "55%" },
      { left: "35%", top: "70%" },
      { left: "55%", top: "45%" },
      { left: "18%", top: "58%" },
    ],
    [],
  );

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-[#0d1f3c] to-[#0a1628] border border-white/10 transition-all duration-500 ${
        isHovered ? "border-[#4fc3f7]/50 shadow-2xl shadow-[#4fc3f7]/10" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(79, 195, 247, 0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: '"Jersey 10", "Press Start 2P", monospace' }}
            >
              {title}
            </h3>
            <p
              className="text-[#4fc3f7] font-medium"
              style={{ fontFamily: '"IBM Plex Mono"' }}
            >
              {tagline}
            </p>
          </div>
        </div>

        <div
          className={`relative h-72 md:h-80 overflow-hidden transition-all duration-500 ${
            isHovered ? "scale-[1.01]" : ""
          }`}
        >
          {/* Background */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0a1930] to-[#1a2347]" />

          {/* Grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(to right, #4fc3f7 1px, transparent 1px), linear-gradient(to bottom, #4fc3f7 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`relative transition-all duration-500 ${
                isHovered ? "scale-110" : ""
              }`}
            >
              <div
                className={`pointer-events-none absolute inset-0 blur-3xl transition-opacity duration-500 ${
                  isHovered ? "opacity-60" : "opacity-30"
                }`}
                style={{
                  background:
                    "radial-gradient(circle, rgba(79, 195, 247, 0.55) 0%, transparent 70%)",
                  width: "220px",
                  height: "220px",
                  transform: "translate(-50%, -50%)",
                  left: "50%",
                  top: "50%",
                }}
              />

              <div
                className={`relative p-8 border transition-all duration-500 ${
                  isHovered
                    ? "bg-[#4fc3f7]/20 border-[#4fc3f7]/50"
                    : "bg-[#4fc3f7]/10 border-[#4fc3f7]/20"
                }`}
              >
                {renderIcon(iconType, 72)}
              </div>
            </div>
          </div>

          {/* Particles */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {particles.map((p, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-[#4fc3f7]/30 rounded-full transition-all duration-1000 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  left: p.left,
                  top: p.top,
                  transform: isHovered ? `translateY(-${18 + i * 6}px)` : "translateY(0)",
                  transitionDelay: `${i * 90}ms`,
                }}
              />
            ))}
          </div>

          {/* Corners */}
          <div
            className={`pointer-events-none absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 transition-all duration-300 ${
              isHovered ? "border-[#4fc3f7]" : "border-white/20"
            }`}
          />
          <div
            className={`pointer-events-none absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 transition-all duration-300 ${
              isHovered ? "border-[#4fc3f7]" : "border-white/20"
            }`}
          />
          <div
            className={`pointer-events-none absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 transition-all duration-300 ${
              isHovered ? "border-[#4fc3f7]" : "border-white/20"
            }`}
          />
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
        <div
          className={`pointer-events-none h-full bg-gradient-to-r from-transparent via-[#4fc3f7] to-transparent transition-all duration-700 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    </div>
  );
}


