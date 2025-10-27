"use client";

import React, { useEffect, useState } from "react";
import { Zap, PenTool, Award } from "lucide-react";

const WhyDifferentSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("why-different-section");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const renderIcon = (iconType: string) => {
    const iconProps = { size: 24, className: "text-[#4fc3f7]" };
    
    switch (iconType) {
      case "performance":
        return <Zap {...iconProps} />;
      case "usability":
        return <PenTool {...iconProps} />;
      case "research":
        return <Award {...iconProps} />;
      default:
        return null;
    }
  };

  const differences = [
    {
      iconType: "performance",
      title: "Laptop-ready Performance",
      description: "Our powerful ZKP backend allows you to generate a batch proof for multiple transactions in few minutes on your home laptop.",
      highlight: "home laptop",
      color: "from-[#4fc3f7] to-[#29b6f6]"
    },
    {
      iconType: "usability",
      title: "Usability First",
      description: "Simple GUI Playground and powerful CLI tools. Just paste any Ethereum transaction hash, click 'Prove', and get a complete zero-knowledge proof with verification.",
      highlight: "paste → prove → verify",
      color: "from-[#4fc3f7] to-[#29b6f6]"
    },
    {
      iconType: "research",
      title: "Research-driven Design",
      description: "Ongoing research papers and open-source code development with transparent design principles.",
      highlight: "Open Research",
      color: "from-[#4fc3f7] to-[#29b6f6]"
    }
  ];

  return (
    <section id="why-different-section" className="py-24 bg-gradient-to-b from-[#0a1930] to-[#1a2347] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#4fc3f7]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#29b6f6]/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#4fc3f7]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: '"Jersey 10", "Press Start 2P", monospace', letterSpacing: '0.2rem' }}>
            Why This Is Different
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto" style={{ fontFamily: '"IBM Plex Mono"' }}>
            Zero-knowledge privacy that actually works on your hardware
          </p>
        </div>

        {/* Differences Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {differences.map((diff, index) => (
            <div
              key={index}
              className={`group relative p-8 bg-gradient-to-b from-[#0a1930] to-[#1a2347] border border-[#4fc3f7] hover:border-[#29b6f6] hover:shadow-lg hover:shadow-[#4fc3f7]/20 transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 h-full flex flex-col ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-[#0a1930] border-2 border-[#4fc3f7] flex items-center justify-center mb-6 group-hover:scale-105 group-hover:shadow-[#4fc3f7]/50 transition-all duration-300 shadow-md">
                {renderIcon(diff.iconType)}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-[#4fc3f7] transition-colors duration-300" style={{ fontFamily: '"IBM Plex Mono"' }}>
                  {diff.title}
                </h3>
                
                <p className="text-white/80 leading-relaxed mb-6 flex-1 group-hover:text-white transition-colors duration-300" style={{ fontFamily: '"IBM Plex Mono"' }}>
                  {diff.description}
                </p>

                {/* Highlight Badge */}
                <div className={`inline-flex items-center px-4 py-2 bg-[#0a1930] border border-[#4fc3f7] text-[#4fc3f7] text-sm font-semibold shadow-md mt-auto`} style={{ fontFamily: '"IBM Plex Mono"' }}>
                  <span className="w-2 h-2 bg-[#4fc3f7] mr-2"></span>
                  {diff.highlight}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="text-white/70 text-base" style={{ fontFamily: '"IBM Plex Mono"' }}>
            Ready to try on your machine today?
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyDifferentSection;
