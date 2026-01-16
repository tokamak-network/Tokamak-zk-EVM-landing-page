"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Zap, Layers, KeyRound, ShieldCheck } from "lucide-react";

interface Solution {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  status: "available" | "coming-soon";
  iconType: "zap" | "layers" | "key" | "shield";
}

const solutions: Solution[] = [
  {
    id: "private-channels",
    number: "01",
    title: "Tokamak Private App Channels",
    tagline: "Your own private execution lane",
    description: "Autonomous, private, and independent Layer 2 channels created, operated, and closed by users. Ethereum only sees state roots and zero knowledge proofs.",
    features: [
      "User controlled L2",
      "Hidden transactions",
      "App isolation"
    ],
    status: "coming-soon",
    iconType: "shield"
  },
  {
    id: "zk-evm",
    number: "02",
    title: "Tokamak zk EVM",
    tagline: "Ethereum compatible zero knowledge execution",
    description: "Affordable on chain verification with low proving overhead so you can generate zero knowledge proofs even on a gaming laptop. EVM compatibility with Ethereum security.",
    features: [
      "Low proving overhead",
      "Gaming laptop capable",
      "EVM compatibility"
    ],
    status: "available",
    iconType: "layers"
  },
  {
    id: "threshold-signature",
    number: "03",
    title: "Threshold Signature App",
    tagline: "Shared control, single signature",
    description: "Minimal signer interaction, eliminating the need for all participants to be online at the same time. On chain it appears as a single signature, compatible with existing wallets and protocols.",
    features: [
      "Async signing",
      "Threshold authorization",
      "Wallet compatible"
    ],
    status: "coming-soon",
    iconType: "key"
  },
  {
    id: "zk-snark",
    number: "04",
    title: "Tokamak zk SNARK",
    tagline: "Modular zero knowledge circuits like FPGA",
    description: "Build bespoke zk SNARK circuits like an FPGA. Snap together pre verified building blocks to skip huge RAM circuits and eliminate per app setup for faster proofs and faster iteration.",
    features: [
      "Modular building blocks",
      "No per app setup",
      "Fast iteration"
    ],
    status: "available",
    iconType: "zap"
  }
];

const renderIcon = (iconType: string, size: number = 32) => {
  const iconClass = `w-${size/4} h-${size/4} text-[#4fc3f7]`;
  
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
      return <Zap size={size} className={iconClass} />;
  }
};

const SolutionCard = ({ 
  solution, 
  index, 
  isVisible 
}: { 
  solution: Solution; 
  index: number; 
  isVisible: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isEven = index % 2 === 0;

  return (
    <Link
      href={`/solutions/${solution.id}`}
      aria-label={`Open ${solution.title}`}
      className={`stacking-card relative block bg-gradient-to-br from-[#0d1f3c] to-[#0a1628] border border-white/10 p-8 md:p-12 lg:p-16 mb-8 transform origin-top transition-all duration-500 ${
        isHovered ? 'border-[#4fc3f7]/50 shadow-2xl shadow-[#4fc3f7]/10' : ''
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
      style={{ 
        transitionDelay: `${index * 150}ms`,
        position: 'sticky',
        top: `${100 + index * 20}px`,
        zIndex: index
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect on hover */}
      <div className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(79, 195, 247, 0.1) 0%, transparent 70%)'
      }} />

      <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} justify-between gap-8 lg:gap-16 relative z-10`}>
        {/* Content Side */}
        <div className="lg:w-1/2 flex flex-col justify-center">
          {/* Number */}
          <span 
            className={`text-[#4fc3f7] font-mono text-xl mb-4 block transition-all duration-300 ${
              isHovered ? 'translate-x-2' : ''
            }`}
            style={{ fontFamily: '"IBM Plex Mono"' }}
          >
            {solution.number}
          </span>

          {/* Title */}
          <h3 
            className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 transition-all duration-300 ${
              isHovered ? 'text-white' : 'text-white/90'
            }`}
            style={{ fontFamily: '"Jersey 10", "Press Start 2P", monospace' }}
          >
            {solution.title}
          </h3>

          {/* Tagline */}
          <p 
            className={`text-[#4fc3f7] text-lg md:text-xl font-medium mb-6 transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-90'
            }`}
            style={{ fontFamily: '"IBM Plex Mono"' }}
          >
            {solution.tagline}
          </p>

          {/* Description */}
          <p 
            className="text-white/60 text-base lg:text-lg leading-relaxed mb-8"
            style={{ fontFamily: '"IBM Plex Mono"' }}
          >
            {solution.description}
          </p>

          {/* Features as pills */}
          <div className="flex flex-wrap gap-3">
            {solution.features.map((feature, idx) => (
              <span
                key={idx}
                className={`px-4 py-2 text-sm border transition-all duration-300 ${
                  isHovered 
                    ? 'border-[#4fc3f7]/50 bg-[#4fc3f7]/10 text-[#4fc3f7]' 
                    : 'border-white/20 bg-white/5 text-white/70'
                }`}
                style={{ 
                  fontFamily: '"IBM Plex Mono"',
                  transitionDelay: `${idx * 50}ms`
                }}
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Visual Side */}
        <div className="lg:w-1/2 relative">
          <div className={`relative h-64 md:h-80 lg:h-96 overflow-hidden transition-all duration-500 ${
            isHovered ? 'scale-[1.02]' : ''
          }`}>
            {/* Background pattern */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0a1930] to-[#1a2347]" />
            
            {/* Animated grid */}
            <div 
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage: `linear-gradient(to right, #4fc3f7 1px, transparent 1px), linear-gradient(to bottom, #4fc3f7 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}
            />

            {/* Central icon with glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`relative transition-all duration-500 ${isHovered ? 'scale-110' : ''}`}>
                {/* Glow behind icon */}
                <div className={`pointer-events-none absolute inset-0 blur-3xl transition-opacity duration-500 ${
                  isHovered ? 'opacity-60' : 'opacity-30'
                }`} style={{
                  background: 'radial-gradient(circle, rgba(79, 195, 247, 0.5) 0%, transparent 70%)',
                  width: '200px',
                  height: '200px',
                  transform: 'translate(-50%, -50%)',
                  left: '50%',
                  top: '50%'
                }} />
                
                {/* Icon container */}
                <div className={`relative p-8 border transition-all duration-500 ${
                  isHovered 
                    ? 'bg-[#4fc3f7]/20 border-[#4fc3f7]/50' 
                    : 'bg-[#4fc3f7]/10 border-[#4fc3f7]/20'
                }`}>
                  {renderIcon(solution.iconType, 64)}
                </div>
              </div>
            </div>

            {/* Floating particles */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-2 h-2 bg-[#4fc3f7]/30 rounded-full transition-all duration-1000 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    transform: isHovered ? `translateY(-${20 + i * 10}px)` : 'translateY(0)',
                    transitionDelay: `${i * 100}ms`
                  }}
                />
              ))}
            </div>

              {/* Status badge */}
              <div className="absolute bottom-4 right-4">
                <span className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#4fc3f7] bg-black/60 backdrop-blur border border-[#4fc3f7]/30">
                  <span className="w-2 h-2 bg-[#4fc3f7] rounded-full animate-pulse" />
                  Open Source
                </span>
              </div>

            {/* Corner decorations */}
            <div className={`pointer-events-none absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 transition-all duration-300 ${
              isHovered ? 'border-[#4fc3f7]' : 'border-white/20'
            }`} />
            <div className={`pointer-events-none absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 transition-all duration-300 ${
              isHovered ? 'border-[#4fc3f7]' : 'border-white/20'
            }`} />
            <div className={`pointer-events-none absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 transition-all duration-300 ${
              isHovered ? 'border-[#4fc3f7]' : 'border-white/20'
            }`} />
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
        <div className={`pointer-events-none h-full bg-gradient-to-r from-transparent via-[#4fc3f7] to-transparent transition-all duration-700 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />
      </div>
    </Link>
  );
};

const SolutionsSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.05 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="solutions-section" 
      className="relative py-24 overflow-hidden z-10"
      style={{
        background: "linear-gradient(180deg, #0a1930 0%, #0d1f3c 50%, #0a1930 100%)",
        boxShadow: "0 -20px 60px rgba(0, 0, 0, 0.8)"
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4fc3f7]/50 to-transparent" />
      
      {/* Background grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #4fc3f7 1px, transparent 1px), linear-gradient(to bottom, #4fc3f7 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#4fc3f7]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#029cdc]/6 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`mb-20 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#4fc3f7]" />
            <span 
              className="text-[#4fc3f7] text-sm font-medium uppercase tracking-wider"
              style={{ fontFamily: '"IBM Plex Mono"' }}
            >
              Our Solutions
            </span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#4fc3f7]" />
          </div>
          
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: '"Jersey 10", "Press Start 2P", monospace' }}
          >
            Four Pillars of <span className="text-[#4fc3f7]">Privacy</span>
          </h2>
          
          <p 
            className="text-lg text-white/60 max-w-2xl mx-auto"
            style={{ fontFamily: '"IBM Plex Mono"' }}
          >
            A complete ecosystem of zero-knowledge solutions for Ethereum
          </p>
        </div>

        {/* Stacking Cards */}
        <div className="pb-32">
          {solutions.map((solution, index) => (
            <SolutionCard 
              key={solution.id} 
              solution={solution} 
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-12 bg-gradient-to-r from-[#0d1f3c] to-[#0a1628] border border-white/10">
            <div className="text-center md:text-left">
              <p 
                className="text-white/40 text-sm mb-2"
                style={{ fontFamily: '"IBM Plex Mono"' }}
              >
                Ready to build with Tokamak?
              </p>
              <p 
                className="text-white text-xl font-medium"
                style={{ fontFamily: '"IBM Plex Mono"' }}
              >
                Get started with our open-source tools
              </p>
            </div>
            <a
              href="https://github.com/tokamak-network"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#028bee] text-white font-medium transition-all duration-300 hover:bg-[#0277d4] hover:scale-105 overflow-hidden"
              style={{ fontFamily: '"IBM Plex Mono"' }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span className="relative z-10">View on GitHub</span>
              <svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;
