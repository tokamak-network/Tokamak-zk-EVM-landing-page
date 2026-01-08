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
      title: "Build Rollups",
      subtitle: "(zk-EVM)",
      iconType: "core",
      color: "blue",
      features: [
        {
          title: "EVM Compatible",
          description: "Deploy existing Solidity contracts without modification. Full compatibility with Ethereum tooling and infrastructure."
        },
        {
          title: "Ethereum Security",
          description: "Every state transition is verified by zero-knowledge proofs, inheriting Ethereum's security guarantees."
        },
        {
          title: "Scalable Throughput",
          description: "Process thousands of transactions off-chain while posting succinct proofs to L1."
        }
      ],
      benefit: "Scale your dApps with Ethereum-grade security.",
      ctaText: "View on GitHub",
      ctaLink: "https://github.com/tokamak-network/Tokamak-zk-EVM"
    },
    {
      title: "Secure Assets",
      subtitle: "(Threshold Signatures)",
      iconType: "playground",
      color: "blue",
      features: [
        {
          title: "Distributed Key Control",
          description: "Split critical keys among multiple parties. No single point of failure or trust."
        },
        {
          title: "Threshold Authorization",
          description: "Require M-of-N participants to approve before any transaction goes through."
        },
        {
          title: "On-chain Simplicity",
          description: "Appears as a single standard signature on-chain—compatible with existing wallets and protocols."
        }
      ],
      benefit: "Enterprise-grade key management for DAOs and teams.",
      ctaText: "View on GitHub",
      ctaLink: "https://github.com/tokamak-network/threshold-signature-Frost"
    },
    {
      title: "Private Channels",
      subtitle: "(App Isolation)",
      iconType: "cli",
      color: "blue",
      features: [
        {
          title: "Private Execution",
          description: "Create isolated execution lanes where transactions and balances remain hidden from the public."
        },
        {
          title: "ZK-Verified State",
          description: "Ethereum only sees state roots and proofs—never the underlying transaction data."
        },
        {
          title: "Application Specific",
          description: "Each app gets its own private channel, ensuring complete isolation between different use cases."
        }
      ],
      benefit: "True privacy for sensitive applications.",
      ctaText: "View on GitHub",
      ctaLink: "https://github.com/tokamak-network/Tokamak-zkp-channel-manager"
    }
  ];



  return (
    <section 
      id="two-ways-section" 
      className="relative z-10 py-24 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #1a2347 0%, #0d1f3c 50%, #0a1930 100%)",
        boxShadow: "0 -20px 60px rgba(0, 0, 0, 0.8)"
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4fc3f7]/40 to-transparent" />
      
      {/* Background elements */}
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-[#4fc3f7]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-80 h-80 bg-[#029cdc]/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: '"Jersey 10", "Press Start 2P", monospace' }}>
            How to Use It
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto" style={{ fontFamily: '"IBM Plex Mono"' }}>
            Multiple paths to zero-knowledge powered applications
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
