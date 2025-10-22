"use client";

import React, { useEffect, useState } from "react";
import { Search, Archive, Building, FileCheck } from "lucide-react";

const RoadmapSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeView, setActiveView] = useState<'today' | 'next'>('today');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("roadmap-section");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const renderIcon = (iconType: string) => {
    const iconProps = { size: 24, className: "text-white" };
    
    switch (iconType) {
      case "search":
        return <Search {...iconProps} />;
      case "filecheck":
        return <FileCheck {...iconProps} />;
      case "archive":
        return <Archive {...iconProps} />;
      case "building":
        return <Building {...iconProps} />;
      default:
        return null;
    }
  };

  const roadmapData = {
    today: {
      title: "Available Today",
      subtitle: "Ready to use right now",
      color: "from-blue-500 to-blue-700",
      bgColor: "bg-blue-50",
      items: [
        {
          iconType: "search",
          title: "EVM Execution Proofs",
          description: "Generate and verify proofs of EVM execution correctness for real Ethereum transactions via Playground/CLI.",
          status: "Live"
        }
      ]
    },
    next: {
      title: "Coming Next",
      subtitle: "On the roadmap",
      color: "from-blue-500 to-blue-700",
      bgColor: "bg-blue-50",
      items: [
        {
          iconType: "filecheck",
          title: "Full Transaction Proofs",
          description: "Move from execution-only to full transaction proofs (sig, input state, post-state).",
          status: "Q1 2025"
        },
        {
          iconType: "archive",
          title: "Proof Aggregation",
          description: "Proof aggregation for batch submissions.",
          status: "Q2 2025"
        },
        {
          iconType: "building",
          title: "Private L2 Channels",
          description: "Replace transactions with proofs for small/mid-sized private L2 groups that settle to Ethereum.",
          status: "Q3 2025"
        }
      ]
    }
  };

  return (
    <section id="roadmap-section" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-heading">
            What You Can Do Today vs Next
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our development roadmap and what&apos;s available now
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className={`flex justify-center mb-12 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gray-100 p-2 flex">
                          <button
                onClick={() => setActiveView('today')}
                className={`px-8 py-4 font-semibold transition-all duration-300 ${
                  activeView === 'today'
                    ? 'bg-[#028bee] text-white shadow-lg scale-105'
                    : 'text-gray-900 hover:text-gray-900 hover:bg-gray-200'
                }`}
            >
              <span className="mr-2">✅</span>
              Today
            </button>
            <button
              onClick={() => setActiveView('next')}
              className={`px-8 py-4 font-semibold transition-all duration-300 ${
                activeView === 'next'
                  ? 'bg-[#028bee] text-white shadow-lg scale-105'
                  : 'text-gray-900 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">🚀</span>
              Next
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {(['today', 'next'] as const).map((view) => {
            if (view !== activeView) return null;
            const data = roadmapData[view];
            
            return (
              <div key={view} className="max-w-5xl mx-auto">
                {/* Header */}
                <div className={`text-center mb-12 p-8 ${data.bgColor}/50 border border-gray-200/50`}>
                  <h3 className={`text-3xl font-bold mb-4 bg-gradient-to-r ${data.color} bg-clip-text text-transparent`}>
                    {data.title}
                  </h3>
                  <p className="text-gray-600 text-lg">{data.subtitle}</p>
                </div>

                {/* Items */}
                <div className="space-y-6">
                  {data.items.map((item, index) => (
                    <div
                      key={index}
                      className={`group p-8 bg-white border border-gray-200/50 hover:border-gray-300/50 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-lg`}
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <div className="flex items-start space-x-6">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-r ${data.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {renderIcon(item.iconType)}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className={`text-xl font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:${data.color} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300`}>
                              {item.title}
                            </h4>
                            <span className={`px-4 py-2 bg-gradient-to-r ${data.color} text-white text-sm font-semibold shadow-sm`}>
                              {item.status}
                            </span>
                          </div>
                          <p className="text-gray-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom CTA */}
                {view === 'today' && (
                  <div className="text-center mt-12">
                    <button className="group inline-flex items-center px-8 py-4 bg-[#028bee] text-white font-semibold hover:bg-[#0277d4] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                      <span>Try It Now</span>
                      <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}

                {view === 'next' && (
                  <div className="text-center mt-12">
                    <div className="inline-flex items-center px-6 py-3 bg-blue-50 border border-blue-200/50 text-blue-700">
                      <span className="w-2 h-2 bg-blue-500 mr-3 animate-pulse"></span>
                      <span className="text-sm font-medium">Follow our progress on GitHub</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RoadmapSection;
