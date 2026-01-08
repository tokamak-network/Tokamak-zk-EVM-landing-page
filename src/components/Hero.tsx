"use client";
import React, { useEffect, useState } from "react";

// Subtle grid pattern background
const GridPattern = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
);

// Subtle floating orbs - monochromatic
const FloatingOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div 
      className="absolute w-96 h-96 rounded-full blur-3xl animate-float"
      style={{
        background: "radial-gradient(circle, rgba(79, 195, 247, 0.08) 0%, transparent 70%)",
        top: "5%",
        left: "5%",
      }}
    />
    <div 
      className="absolute w-80 h-80 rounded-full blur-3xl animate-float-delayed"
      style={{
        background: "radial-gradient(circle, rgba(79, 195, 247, 0.06) 0%, transparent 70%)",
        bottom: "10%",
        right: "10%",
      }}
    />
  </div>
);

const Hero: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative">
      {/* Fixed Background Layer */}
      <div 
        className="fixed inset-0 w-full h-screen z-0"
        style={{
          background: "linear-gradient(180deg, #0a1930 0%, #0d1f3c 50%, #0a1930 100%)",
        }}
      >
        <GridPattern />
        <FloatingOrbs />
        
        {/* Ambient center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#4fc3f7]/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Content Layer - scrolls over the fixed background */}
      <div 
        id="overview"
        className="relative z-10 min-h-screen flex flex-col justify-center items-center"
      >
        {/* Main Content */}
        <div className={`flex flex-col items-center text-center space-y-8 px-2 w-full transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4fc3f7]/10 border border-[#4fc3f7]/20 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4fc3f7] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4fc3f7]"></span>
            </span>
            <span className="text-[#4fc3f7] text-sm font-medium" style={{ fontFamily: '"IBM Plex Mono"' }}>
              Zero-Knowledge Proof Solutions
            </span>
          </div>

          {/* Main Title */}
          <div className="flex flex-nowrap items-center justify-center gap-4 md:gap-8">
            <h1
              className="text-6xl md:text-8xl lg:text-9xl font-bold text-white text-center"
              style={{
                fontFamily: '"Jersey 10", "Press Start 2P", monospace',
                letterSpacing: '0.1rem',
              }}
            >
              Tokamak Network
            </h1>
            <span
              className="text-6xl md:text-8xl lg:text-9xl font-bold text-[#4fc3f7]"
              style={{
                fontFamily: '"Jersey 10", "Press Start 2P", monospace',
                letterSpacing: '0.2rem',
              }}
            >
              ZKP
            </span>
          </div>

          {/* Description */}
          <div className="max-w-3xl">
            <p
              className="text-white/70 text-lg md:text-xl leading-relaxed"
              style={{
                fontFamily: '"IBM Plex Mono"',
              }}
            >
              Making privacy the default for Ethereum. 
              Scalable, verifiable, and accessible to everyone.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-4">
            {/* Primary CTA */}
            <a
              href="#solutions-section"
              className="group inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-[#028bee] hover:bg-[#0277d4] transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{
                fontFamily: '"IBM Plex Mono"',
              }}
            >
              <span>Explore Solutions</span>
              <svg className="ml-2 w-5 h-5 transform group-hover:translate-y-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
            
            {/* Secondary CTA */}
            <a
              href="https://github.com/tokamak-network"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center px-8 py-4 text-lg font-semibold text-[#4fc3f7] border-2 border-[#4fc3f7]/50 hover:border-[#4fc3f7] hover:bg-[#4fc3f7]/10 transition-all duration-300 backdrop-blur-sm"
              style={{
                fontFamily: '"IBM Plex Mono"',
              }}
            >
              <span>View on GitHub</span>
              <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
