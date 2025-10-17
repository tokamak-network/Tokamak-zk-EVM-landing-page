"use client";
import React from "react";

// Star Component for cosmic background
const Star = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div className={`absolute text-white ${className}`} style={style}>
    ✦
  </div>
);

// Plus Sign Component for cosmic background ( this is for the animation of the hero section )
const PlusSign = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div className={`absolute text-white ${className}`} style={style}>
    +
  </div>
);

// Gear Component for cosmic background
const Gear = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div className={`absolute text-white ${className}`} style={style}>
    ⚙
  </div>
);

const Overview = () => {
  return (
    <div
      id="overview"
      className="w-full min-h-screen flex flex-col justify-center items-center relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #0a1930 0%, #1a2347 100%)",
      }}
    >
      {/* Cosmic Background Elements */}
      <Star
        className="text-lg animate-pulse"
        style={{ top: "10%", left: "10%", animationDelay: "0s" }}
      />
      <Star
        className="text-sm animate-pulse"
        style={{ top: "20%", right: "15%", animationDelay: "1s" }}
      />
      <Star
        className="text-xl animate-pulse"
        style={{ top: "30%", left: "20%", animationDelay: "2s" }}
      />
      <PlusSign
        className="text-lg animate-pulse"
        style={{ top: "15%", right: "25%", animationDelay: "0.5s" }}
      />
      <PlusSign
        className="text-sm animate-pulse"
        style={{ bottom: "40%", left: "15%", animationDelay: "1.5s" }}
      />
      <Gear
        className="text-lg animate-pulse"
        style={{ bottom: "20%", right: "10%", animationDelay: "2.5s" }}
      />
      <Star
        className="text-md animate-pulse"
        style={{ bottom: "35%", right: "30%", animationDelay: "0.8s" }}
      />
      <PlusSign
        className="text-xl animate-pulse"
        style={{ top: "60%", left: "8%", animationDelay: "1.8s" }}
      />
      <Star
        className="text-sm animate-pulse"
        style={{ top: "70%", right: "20%", animationDelay: "2.2s" }}
      />
      <Gear
        className="text-sm animate-pulse"
        style={{ top: "25%", left: "85%", animationDelay: "1.2s" }}
      />

      {/* Main Content */}
      <div className="flex flex-col items-center text-center space-y-8 z-10 px-4">
        {/* ZK Proofs. One Click. */}
        <div className="flex flex-col items-center">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-wider"
            style={{
              fontFamily: '"Jersey 10", "Press Start 2P", monospace',
              textShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
            }}
          >
            Own Your Privacy
          </h1>

          {/* Tokamak zk-EVM */}
          <h2
            className="text-6xl md:text-8xl lg:text-[12rem] font-bold mt-4 bg-gradient-to-r from-[#4fc3f7] to-[#29b6f6] bg-clip-text text-transparent"
            style={{
              fontFamily: '"Jersey 10", "Press Start 2P", monospace',
            }}
          >
            Tokamak zk-EVM
          </h2>
        </div>

        {/* Description */}
        <div className="mt-12 text-center">
          <div
            className="text-white text-lg max-w-2xl"
            style={{
              fontFamily: '"IBM Plex Mono"',
              lineHeight: "1.6",
            }}
          >
            Experience true privacy with Tokamak Network&apos;s zero-knowledge Ethereum Virtual Machine. Your data, your control.
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          {/* Primary CTA - Playground */}
          <a
            href="https://github.com/tokamak-network/Tokamak-zk-EVM-playgrounds"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-[#4fc3f7] to-[#29b6f6] hover:from-[#29b6f6] hover:to-[#4fc3f7] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl relative z-50"
            style={{
              fontFamily: '"IBM Plex Mono"',
            }}
          >
            <span>Try Playground</span>
            <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
          
          {/* Secondary CTA - CLI */}
          <a
            href="https://github.com/tokamak-network/Tokamak-zk-EVM"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center px-8 py-4 text-lg font-semibold text-[#4fc3f7] bg-transparent border-2 border-[#4fc3f7] hover:bg-[#4fc3f7] hover:text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl relative z-50"
            style={{
              fontFamily: '"IBM Plex Mono"',
            }}
          >
            <span>Install CLI</span>
            <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>

      {/* Rainbow Stripe at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500"></div>
    </div>
  );
};

const Hero: React.FC = () => {
  return (
    <section className="flex flex-col justify-center items-center">
      <Overview />
    </section>
  );
};

export default Hero;
