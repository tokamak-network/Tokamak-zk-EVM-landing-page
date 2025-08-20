"use client";

import React, { useEffect, useState } from "react";
import { Users, GitBranch, BookOpen, Shield } from "lucide-react";

const SecuritySection: React.FC = () => {
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

    const section = document.getElementById("security-section");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const securityFeatures = [
    {
      iconType: "users",
      title: "No Single Trusted Party",
      description: "Parameter setup without a single trusted party via pre-SNARK consensus (MPC).",
      color: "from-blue-500 to-blue-700",
      details: "Multi-party computation ensures no central point of trust"
    },
    {
      iconType: "gitbranch",
      title: "Post-SNARK Consensus",
      description: "Post-SNARK consensus to agree on synthesizer outputs in low-trust settings.",
      color: "from-blue-600 to-blue-800",
      details: "Distributed agreement on computation results"
    },
    {
      iconType: "book",
      title: "Open Research & Code",
      description: "Theory, circuits, and implementations are public for review.",
      color: "from-blue-700 to-blue-900",
      details: "Full transparency enables community verification"
    }
  ];

  const renderIcon = (iconType: string) => {
    const iconProps = { size: 24, className: "text-white" };
    
    switch (iconType) {
      case "users":
        return <Users {...iconProps} />;
      case "gitbranch":
        return <GitBranch {...iconProps} />;
      case "book":
        return <BookOpen {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <section id="security-section" className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-300/5 rounded-full blur-3xl"></div>
        
        {/* Floating Security Icons */}
        <div className="absolute top-32 left-1/4 w-8 h-8 text-blue-400/20 animate-float">
          <Shield size={24} />
        </div>
        <div className="absolute bottom-32 right-1/3 w-8 h-8 text-blue-400/20 animate-float-delayed">
          <Users size={24} />
        </div>
        <div className="absolute top-1/2 right-1/4 w-8 h-8 text-blue-400/20 animate-bounce-slow">
          <BookOpen size={24} />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
            <span className="text-white/80 text-sm font-medium">Trust & Safety</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-heading">
            Built for Security
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Zero-knowledge privacy with enterprise-grade security guarantees
          </p>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <div
              key={index}
              className={`group relative p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {renderIcon(feature.iconType)}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                {feature.title}
              </h3>
              
              <p className="text-gray-300 leading-relaxed mb-4 group-hover:text-gray-200 transition-colors duration-300">
                {feature.description}
              </p>

              {/* Details */}
              <div className={`p-4 rounded-xl bg-gradient-to-r ${feature.color} bg-opacity-10 border border-white/10`}>
                <p className="text-white/80 text-sm">
                  {feature.details}
                </p>
              </div>

              {/* Hover Glow */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`}></div>
            </div>
          ))}
        </div>

        {/* Security Statement */}
        <div className={`text-center transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg">
                <Shield size={24} />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-4">
              Security Through Transparency
            </h3>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              Our security model is built on open research, peer review, and community verification. 
              Every component from circuit design to consensus protocols is publicly auditable.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-blue-400 font-bold text-sm mb-1">Ethereum Foundation</div>
                <div className="text-white/80 text-sm">Academic Grant Recipient</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-blue-400 font-bold text-sm mb-1">Peer Reviewed</div>
                <div className="text-white/80 text-sm">Theory & Implementation</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-blue-400 font-bold text-sm mb-1">Open Source</div>
                <div className="text-white/80 text-sm">Full Code Transparency</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Checklist */}
        <div className={`mt-16 text-center transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h4 className="text-xl font-bold mb-8 text-gray-300">Security Checklist</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              "No trusted setup",
              "MPC consensus", 
              "Open source code",
              "Peer reviewed theory"
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-blue-400 mr-3">✓</span>
                <span className="text-white/80 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
