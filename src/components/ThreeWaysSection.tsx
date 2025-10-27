"use client";

import React, { useEffect, useState } from "react";
import { Settings, Monitor, Terminal } from "lucide-react";

const ThreeWaysSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("two-ways-section");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const renderIcon = (iconType: string) => {
    const iconProps = { size: 20, className: "text-current" };
    
    switch (iconType) {
      case "core":
        return <Settings {...iconProps} />;
      case "playground":
        return <Monitor {...iconProps} />;
      case "cli":
        return <Terminal {...iconProps} />;
      default:
        return null;
    }
  };

  const ways = [
    {
      title: "Playground",
      subtitle: "(no-code GUI)",
      iconType: "playground",
      color: "blue",
      features: [
        {
          title: "Paste & Prove",
          description: "Paste a transaction hash, press Prove, get a zero-knowledge proof and verify it end-to-end. No code required."
        },
        {
          title: "Learn by Doing",
          description: "Teaches ZK by doing: every step is visible and repeatable."
        }
      ],
      benefit: "Instant, tangible ZK without command lines.",
      ctaText: "Try Playground",
      ctaLink: "https://github.com/tokamak-network/Tokamak-zk-EVM-playgrounds/releases"
    },
    {
      title: "Developer CLI",
      subtitle: "(automation ready)",
      iconType: "cli",
      color: "blue",
      features: [
        {
          title: "Script & Integrate",
          description: "Script proof jobs, integrate with CI, and move from Playground experiments into production pipelines."
        },
        {
          title: "Same Core Technology",
          description: "Same lightweight circuits and prover as the GUI."
        }
      ],
      benefit: "Automation and scale from your own machine.",
      ctaText: "Get CLI",
      ctaLink: "https://github.com/tokamak-network/Tokamak-zk-EVM-playgrounds/releases"
    }
  ];



  return (
    <section id="two-ways-section" className="py-24 bg-gradient-to-b from-[#1a2347] to-[#0a1930]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: '"Jersey 10", "Press Start 2P", monospace' }}>
            Two Ways to Use It
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto" style={{ fontFamily: '"IBM Plex Mono"' }}>
            Choose your entry point into zero-knowledge privacy
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={`flex flex-wrap justify-center mb-12 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {ways.map((way, index) => {
            return (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`mx-2 mb-4 px-6 py-3 font-semibold transition-all duration-300 flex items-center ${
                  activeTab === index
                    ? 'bg-[#028bee] text-white shadow-lg scale-105'
                    : 'bg-gradient-to-b from-[#0a1930] to-[#1a2347] text-white border border-[#4fc3f7] hover:border-[#29b6f6] hover:scale-105'
                }`}
                style={{ fontFamily: '"IBM Plex Mono"' }}
              >
                <div className={`w-5 h-5 mr-2 ${activeTab === index ? 'text-white' : 'text-white/80'}`}>
                  {renderIcon(way.iconType)}
                </div>
                {way.title}
              </button>
            );
          })}
        </div>

        {/* Active Tab Content */}
        <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {ways.map((way, index) => {
            if (index !== activeTab) return null;
            
            return (
              <div key={index} className="max-w-5xl mx-auto">
                <div className="p-8 bg-gradient-to-b from-[#0a1930] to-[#1a2347] border border-[#4fc3f7] shadow-lg">
                  {/* Tab Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#028bee] text-white mb-4 shadow-sm">
                      {way.iconType === "core" && <Settings size={32} className="text-white" />}
                      {way.iconType === "playground" && <Monitor size={32} className="text-white" />}
                      {way.iconType === "cli" && <Terminal size={32} className="text-white" />}
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: '"IBM Plex Mono"' }}>
                      {way.title} <span className="text-white/60 font-normal">{way.subtitle}</span>
                    </h3>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {way.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="p-6 bg-[#0a1930]/50 border border-[#4fc3f7]/30 hover:border-[#4fc3f7] transition-colors duration-300">
                        <h4 className="text-lg font-bold text-white mb-3" style={{ fontFamily: '"IBM Plex Mono"' }}>
                          {feature.title}
                        </h4>
                        <p className="text-white/80 text-sm leading-relaxed" style={{ fontFamily: '"IBM Plex Mono"' }}>
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Benefit Callout with CTA */}
                  <div className="p-6 bg-[#4fc3f7]/10 border border-[#4fc3f7]/50">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      {/* Text on the left */}
                      <div className="flex-1 text-center md:text-left">
                        <h4 className="text-lg font-bold mb-2 text-[#4fc3f7]" style={{ fontFamily: '"IBM Plex Mono"' }}>Why it matters for users:</h4>
                        <p className="text-white/90" style={{ fontFamily: '"IBM Plex Mono"' }}>{way.benefit}</p>
                      </div>
                      
                      {/* Button on the right */}
                      <a
                        href={way.ctaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#028bee] text-white font-semibold transition-all duration-300 hover:bg-[#0277d4] hover:scale-105 shadow-lg hover:shadow-xl group whitespace-nowrap"
                        style={{ fontFamily: '"IBM Plex Mono"' }}
                      >
                        <span>{way.ctaText}</span>
                        <svg 
                          className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ThreeWaysSection;
