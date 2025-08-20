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

    const section = document.getElementById("three-ways-section");
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
      title: "ZK Core",
      subtitle: "(the protocol)",
      iconType: "core",
      color: "blue",
      features: [
        {
          title: "Lightweight Circuits",
          description: "Transaction-specific circuits rather than one huge \"EVM-in-a-circuit\". Faster proving, laptop-friendly."
        },
        {
          title: "Pre/Post-SNARK Consensus",
          description: "MPC + threshold to minimize trust when setting parameters and agreeing on synthesized outputs."
        },
        {
          title: "Formal Analysis",
          description: "Formally analyzed frontend/back-end theory with public artifacts."
        }
      ],
      benefit: "Proofs are practical on normal hardware and the setup avoids single points of failure."
    },
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
      benefit: "Instant, tangible ZK without command lines."
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
      benefit: "Automation and scale from your own machine."
    }
  ];



  return (
    <section id="three-ways-section" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-heading">
            The Three Ways to Use It
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                className={`mx-2 mb-4 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center ${
                  activeTab === index
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-200 hover:scale-105'
                }`}
              >
                <div className={`w-5 h-5 mr-2 ${activeTab === index ? 'text-white' : 'text-gray-500'}`}>
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
                <div className="p-8 rounded-2xl bg-white border border-gray-200/50 shadow-sm">
                  {/* Tab Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-600 text-white mb-4 shadow-sm">
                      {way.iconType === "core" && <Settings size={32} className="text-white" />}
                      {way.iconType === "playground" && <Monitor size={32} className="text-white" />}
                      {way.iconType === "cli" && <Terminal size={32} className="text-white" />}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {way.title} <span className="text-gray-500 font-normal">{way.subtitle}</span>
                    </h3>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {way.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
                        <h4 className="text-lg font-bold text-gray-900 mb-3">
                          {feature.title}
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Benefit Callout */}
                  <div className="p-6 bg-blue-50 rounded-xl border border-blue-200/50 text-center">
                    <h4 className="text-lg font-bold mb-2 text-blue-900">Why it matters for users:</h4>
                    <p className="text-blue-700">{way.benefit}</p>
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
