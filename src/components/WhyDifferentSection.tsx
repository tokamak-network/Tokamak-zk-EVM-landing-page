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
    const iconProps = { size: 24, className: "text-white" };
    
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
      description: "In Q2 2025, we generated a proof for 1–8 Ethereum transactions in about ~7 minutes on a 32 GB RAM box with a 14-core M4 CPU or RTX 3070 Ti, no exotic rigs.",
      highlight: "~7 minutes",
      color: "from-blue-500 to-blue-700"
    },
    {
      iconType: "usability",
      title: "Usability First",
      description: "GUI Playground + CLI; \"paste tx hash → proof\" flow.",
      highlight: "paste → proof",
      color: "from-blue-600 to-blue-800"
    },
    {
      iconType: "research",
      title: "Research-driven Design",
      description: "Accepted to the Ethereum Foundation Academic Grants (2023); ongoing papers and code.",
      highlight: "EF Grant 2023",
      color: "from-blue-700 to-blue-900"
    }
  ];

  return (
    <section id="why-different-section" className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-heading">
            Why This Is Different
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Zero-knowledge privacy that actually works on your hardware
          </p>
        </div>

        {/* Differences Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {differences.map((diff, index) => (
            <div
              key={index}
              className={`group relative p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-blue-400/50 hover:bg-white/15 transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 h-full flex flex-col ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${diff.color} flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 shadow-lg`}>
                {renderIcon(diff.iconType)}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-200 transition-colors duration-300">
                  {diff.title}
                </h3>
                
                <p className="text-gray-300 leading-relaxed mb-6 flex-1 group-hover:text-gray-200 transition-colors duration-300">
                  {diff.description}
                </p>

                {/* Highlight Badge */}
                <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${diff.color} text-white text-sm font-semibold shadow-md mt-auto`}>
                  <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                  {diff.highlight}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/80">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
            <span className="text-sm font-medium">Ready to try on your machine today</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyDifferentSection;
