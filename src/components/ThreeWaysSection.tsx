"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Layers, KeyRound, Zap, Github, ChevronRight } from "lucide-react";

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

  const renderIcon = (iconType: string, size: number = 20) => {
    const iconProps = { size, className: "text-current" };
    
    switch (iconType) {
      case "shield":
        return <ShieldCheck {...iconProps} />;
      case "layers":
        return <Layers {...iconProps} />;
      case "key":
        return <KeyRound {...iconProps} />;
      case "zap":
        return <Zap {...iconProps} />;
      default:
        return null;
    }
  };

  const ways = [
    {
      title: "Tokamak Private App Channels",
      shortTitle: "Private App Channels",
      iconType: "shield",
      features: [
        {
          title: "User-Controlled L2",
          description: "Autonomous, private, and independent Layer 2 channels created, operated, and closed by users."
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
      githubLink: "https://github.com/tokamak-network/Tokamak-zkp-channel-manager"
    },
    {
      title: "Tokamak zk-EVM",
      shortTitle: "zk-EVM",
      iconType: "layers",
      features: [
        {
          title: "Low Proving Overhead",
          description: "Affordable on-chain verification with low proving overhead—generate zero-knowledge proofs even on a gaming laptop."
        },
        {
          title: "Full EVM Compatibility",
          description: "Deploy existing Solidity contracts without modification. Full compatibility with Ethereum tooling and infrastructure."
        },
        {
          title: "Ethereum Security",
          description: "Every state transition is verified by zero-knowledge proofs, inheriting Ethereum's security guarantees."
        }
      ],
      benefit: "Scale your dApps with Ethereum-grade security.",
      githubLink: "https://github.com/tokamak-network/Tokamak-zk-EVM"
    },
    {
      title: "Threshold Signature App",
      shortTitle: "Threshold Signature",
      iconType: "key",
      features: [
        {
          title: "Async Signing",
          description: "Minimal signer interaction—no need for all participants to be online at the same time."
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
      githubLink: "https://github.com/tokamak-network/threshold-signature-Frost"
    },
    {
      title: "Tokamak zk-SNARK",
      shortTitle: "zk-SNARK",
      iconType: "zap",
      features: [
        {
          title: "Modular Building Blocks",
          description: "Build bespoke ZK-SNARK circuits like an FPGA—snap together pre-verified building blocks."
        },
        {
          title: "No Per-App Setup",
          description: "Skip huge RAM circuits and eliminate per-app trusted setup ceremonies."
        },
        {
          title: "Fast Iteration",
          description: "Faster proofs, faster iteration—designed for rapid development and deployment."
        }
      ],
      benefit: "The foundational proving system that powers the entire Tokamak ecosystem.",
      githubLink: "https://github.com/tokamak-network/Tokamak-zk-SNARK"
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
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: '"Jersey 10", "Press Start 2P", monospace' }}>
            How to Use It
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto" style={{ fontFamily: '"IBM Plex Mono"' }}>
            Multiple paths to zero-knowledge powered applications
          </p>
        </div>

        {/* Unified Tab + Content Container */}
        <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Tab Navigation - Aligned with content */}
          <div className="relative">
            {/* Tab bar background */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-[#4fc3f7]/30" />
            
            {/* Scrollable tab container for mobile */}
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex min-w-max sm:min-w-0 sm:grid sm:grid-cols-4 gap-1">
                {ways.map((way, index) => {
                  const isActive = activeTab === index;
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`
                        relative flex-1 group
                        px-4 py-4 sm:py-5
                        flex items-center justify-center gap-2
                        font-medium text-sm sm:text-base
                        transition-all duration-300
                        ${isActive 
                          ? 'text-white' 
                          : 'text-white/60 hover:text-white/90'
                        }
                      `}
                      style={{ fontFamily: '"IBM Plex Mono"' }}
                    >
                      {/* Active tab background */}
                      <div className={`
                        absolute inset-0 
                        bg-gradient-to-b from-[#0a1930] to-[#0d1a2d]
                        border border-[#4fc3f7]/50 border-b-0
                        transition-all duration-300
                        ${isActive ? 'opacity-100' : 'opacity-0'}
                      `} />
                      
                      {/* Hover state for inactive tabs */}
                      <div className={`
                        absolute inset-0 
                        bg-[#4fc3f7]/5
                        transition-all duration-300
                        ${!isActive ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}
                      `} />
                      
                      {/* Active indicator line */}
                      <div className={`
                        absolute bottom-0 left-0 right-0 h-[2px]
                        bg-[#4fc3f7]
                        transition-all duration-300
                        ${isActive ? 'opacity-100' : 'opacity-0'}
                      `} />
                      
                      {/* Tab content */}
                      <div className={`
                        relative z-10 flex items-center gap-2
                        ${isActive ? 'text-[#4fc3f7]' : ''}
                      `}>
                        <span className={`${isActive ? 'text-[#4fc3f7]' : 'text-white/50 group-hover:text-white/70'} transition-colors`}>
                          {renderIcon(way.iconType, 18)}
                        </span>
                        <span className="hidden lg:inline">{way.shortTitle}</span>
                        <span className="lg:hidden whitespace-nowrap">{way.shortTitle}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content Panel - Connected to tabs */}
          <div className="relative">
            {ways.map((way, index) => {
              if (index !== activeTab) return null;
              
              return (
                <div 
                  key={index} 
                  className="
                    bg-gradient-to-b from-[#0d1a2d] via-[#0a1930] to-[#0d1f3c]
                    border border-[#4fc3f7]/50 border-t-0
                    overflow-hidden
                    animate-fadeIn
                  "
                >
                  {/* Content Header with Icon */}
                  <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-[#4fc3f7]/20">
                    <div className="flex items-center gap-4">
                      <div className="
                        flex items-center justify-center 
                        w-14 h-14 
                        bg-gradient-to-br from-[#028bee] to-[#0277d4]
                        shadow-lg shadow-[#028bee]/20
                      ">
                        <span className="text-white">
                          {renderIcon(way.iconType, 28)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: '"IBM Plex Mono"' }}>
                          {way.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="px-6 sm:px-10 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {way.features.map((feature, featureIndex) => (
                        <div 
                          key={featureIndex} 
                          className="
                            group relative
                            p-5
                            bg-[#0a1930]/60
                            border border-[#4fc3f7]/20
                            hover:border-[#4fc3f7]/50
                            hover:bg-[#0a1930]/80
                            transition-all duration-300
                          "
                        >
                          {/* Subtle gradient on hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-[#4fc3f7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <div className="relative z-10">
                            <h4 className="text-base font-bold text-white mb-2" style={{ fontFamily: '"IBM Plex Mono"' }}>
                              {feature.title}
                            </h4>
                            <p className="text-white/70 text-sm leading-relaxed" style={{ fontFamily: '"IBM Plex Mono"' }}>
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer with Benefit & CTA */}
                  <div className="px-6 sm:px-10 py-6 bg-gradient-to-r from-[#4fc3f7]/10 via-[#4fc3f7]/5 to-transparent border-t border-[#4fc3f7]/20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-stretch gap-4">
                        <div className="w-1 bg-[#4fc3f7] flex-shrink-0" />
                        <div>
                          <span className="text-[#4fc3f7] font-semibold text-sm" style={{ fontFamily: '"IBM Plex Mono"' }}>
                            Why it matters:
                          </span>
                          <p className="text-white/90 mt-1" style={{ fontFamily: '"IBM Plex Mono"' }}>
                            {way.benefit}
                          </p>
                        </div>
                      </div>
                      
                      <a
                        href={way.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          inline-flex items-center gap-2 
                          px-5 py-2.5 
                          bg-[#028bee] hover:bg-[#0277d4]
                          text-white font-semibold text-sm
                          transition-all duration-300 
                          hover:scale-[1.02]
                          shadow-lg shadow-[#028bee]/20
                          hover:shadow-xl hover:shadow-[#028bee]/30
                          group
                          whitespace-nowrap
                        "
                        style={{ fontFamily: '"IBM Plex Mono"' }}
                      >
                        <Github size={16} />
                        <span>View on GitHub</span>
                        <ChevronRight size={14} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </section>
  );
};

export default ThreeWaysSection;
