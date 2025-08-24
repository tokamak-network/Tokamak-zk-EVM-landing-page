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
      description: "Our powerful ZKP backend allows you to generate a batch proof for multiple transactions in few minutes on your home laptop.",
      highlight: "home laptop",
      color: "from-blue-500 to-blue-700"
    },
    {
      iconType: "usability",
      title: "Usability First",
      description: "Simple GUI Playground and powerful CLI tools. Just paste any Ethereum transaction hash, click 'Prove', and get a complete zero-knowledge proof with verification.",
      highlight: "paste → prove → verify",
      color: "from-blue-600 to-blue-800"
    },
    {
      iconType: "research",
      title: "Research-driven Design",
      description: "Ongoing research papers and open-source code development with transparent design principles.",
      highlight: "Open Research",
      color: "from-blue-700 to-blue-900"
    }
  ];

  return (
    <section id="why-different-section" className="py-24 bg-gradient-to-br from-gray-50 to-white text-gray-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-100/60 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-50/80 rounded-full blur-3xl"></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask:radial-gradient(ellipse_100%_70%_at_50%_50%,#000_40%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-heading">
            Why This Is Different
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Zero-knowledge privacy that actually works on your hardware
          </p>
        </div>

        {/* Differences Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {differences.map((diff, index) => (
            <div
              key={index}
              className={`group relative p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/60 hover:border-blue-300/60 hover:bg-white/90 hover:shadow-xl transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 h-full flex flex-col ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${diff.color} flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 shadow-lg`}>
                {renderIcon(diff.iconType)}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                  {diff.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed mb-6 flex-1 group-hover:text-gray-700 transition-colors duration-300">
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
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-blue-50/80 backdrop-blur-md border border-blue-200/60 text-gray-700">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></span>
            <span className="text-sm font-medium">Ready to try on your machine today</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyDifferentSection;
