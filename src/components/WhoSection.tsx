"use client";

import React, { useEffect, useState } from "react";
import { Code2, Shield, Users, FlaskConical } from "lucide-react";

const WhoSection: React.FC = () => {
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

    const section = document.getElementById("who-section");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const renderIcon = (iconType: string) => {
    const iconProps = { size: 24, className: "text-[#4fc3f7]" };
    
    switch (iconType) {
      case "code":
        return <Code2 {...iconProps} />;
      case "shield":
        return <Shield {...iconProps} />;
      case "users":
        return <Users {...iconProps} />;
      case "research":
        return <FlaskConical {...iconProps} />;
      default:
        return null;
    }
  };

  const personas = [
    {
      title: "Rollup Operators",
      description: "Deploy production-ready zk-rollups with full EVM compatibility. Scale your L2 with Ethereum-grade security and minimal operational overhead.",
      iconType: "code",
      color: "from-[#4fc3f7] to-[#29b6f6]"
    },
    {
      title: "dApp Developers",
      description: "Build privacy-first applications using our complete ZKP stack. From DeFi protocols to private voting systems—full developer tooling included.",
      iconType: "shield",
      color: "from-[#4fc3f7] to-[#29b6f6]"
    },
    {
      title: "DAOs & Enterprises",
      description: "Secure multi-sig treasuries with threshold signatures. Create private execution channels for sensitive operations with cryptographic guarantees.",
      iconType: "users",
      color: "from-[#4fc3f7] to-[#29b6f6]"
    },
    {
      title: "Researchers & Auditors",
      description: "Explore cutting-edge ZK cryptography. Inspect our circuits, verify proofs, and contribute to open-source development.",
      iconType: "research",
      color: "from-[#4fc3f7] to-[#29b6f6]"
    }
  ];

  return (
    <section 
      id="who-section" 
      className="relative z-10 py-24 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0d1f3c 0%, #1a2347 50%, #0d1f3c 100%)",
        boxShadow: "0 -20px 60px rgba(0, 0, 0, 0.8)"
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4fc3f7]/40 to-transparent" />
      
      {/* Background elements */}
      <div className="absolute top-20 right-20 w-80 h-80 bg-[#4fc3f7]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#029cdc]/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: '"Jersey 10", "Press Start 2P", monospace' }}>
            Who This Is For
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto" style={{ fontFamily: '"IBM Plex Mono"' }}>
            Zero-knowledge privacy solutions designed for every type of user
          </p>
        </div>

        {/* Personas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {personas.map((persona, index) => (
            <div
              key={index}
              className={`group relative p-8 bg-gradient-to-b from-[#0a1930] to-[#1a2347] border border-[#4fc3f7] hover:border-[#29b6f6] hover:shadow-lg hover:shadow-[#4fc3f7]/20 transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Professional Icon */}
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#0a1930] border-2 border-[#4fc3f7] flex items-center justify-center shadow-md group-hover:scale-110 group-hover:shadow-[#4fc3f7]/50 transition-all duration-300">
                  {renderIcon(persona.iconType)}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-[#4fc3f7] transition-colors duration-300" style={{ fontFamily: '"IBM Plex Mono"' }}>
                    {persona.title}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <p className="text-white/80 leading-relaxed" style={{ fontFamily: '"IBM Plex Mono"' }}>
                {persona.description}
              </p>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoSection;
