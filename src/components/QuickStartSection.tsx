"use client";

import React, { useEffect, useState } from "react";
import { Monitor, Terminal, Settings } from "lucide-react";

const QuickStartSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("quickstart-section");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const renderIcon = (iconType: string) => {
    const iconProps = { size: 24, className: "text-white" };
    
    switch (iconType) {
      case "playground":
        return <Monitor {...iconProps} />;
      case "cli":
        return <Terminal {...iconProps} />;
      case "core":
        return <Settings {...iconProps} />;
      default:
        return null;
    }
  };

  const quickStartOptions = [
    {
      title: "Try in the Playground",
      description: "Paste a tx hash → click Prove → watch the pipeline run → Verify. (No code, runs locally.)",
      iconType: "playground",
      color: "from-blue-500 to-blue-600",
      ctaText: "Open Playground",
      steps: ["Paste", "Prove", "Verify"],
      difficulty: "Beginner"
    },
    {
      title: "Install the CLI",
      description: "npm i -g tokamak-zk. Run tokamak-zk prove --tx <hash> to generate a proof on your machine.",
      iconType: "cli",
      color: "from-blue-600 to-blue-700",
      ctaText: "View Docs",
      steps: ["Install", "Run", "Prove"],
      difficulty: "Intermediate"
    },
    {
      title: "Build with the Core",
      description: "Pull the repo, wire the synthesizer, and use the prover API in your app.",
      iconType: "core",
      color: "from-blue-700 to-blue-800",
      ctaText: "GitHub Repo",
      steps: ["Clone", "Build", "Integrate"],
      difficulty: "Advanced"
    }
  ];

  return (
    <section id="quickstart-section" className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-heading">
            Quick Start
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose your path to zero-knowledge proofs
          </p>
        </div>

        {/* Quick Start Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {quickStartOptions.map((option, index) => (
            <div
              key={index}
              className={`group relative p-8 rounded-2xl bg-white border border-gray-200/50 hover:border-blue-300/60 hover:bg-blue-50/30 transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl h-full flex flex-col ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ animationDelay: `${index * 200}ms` }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Difficulty Badge */}
              <div className="absolute -top-3 right-6">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${option.color} text-white shadow-sm`}>
                  {option.difficulty}
                </span>
              </div>

                            {/* Icon */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center text-white mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                {renderIcon(option.iconType)}
              </div>

              {/* Content - Flex to fill space */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">
                  {option.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                  {option.description}
                </p>

                {/* Steps Visualization */}
                <div className="mb-8">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    {option.steps.map((step, stepIndex) => (
                      <React.Fragment key={stepIndex}>
                        <div className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                          hoveredCard === index 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {step}
                        </div>
                        {stepIndex < option.steps.length - 1 && (
                          <div className={`w-4 h-px transition-all duration-300 ${
                            hoveredCard === index 
                              ? 'bg-blue-300' 
                              : 'bg-gray-300'
                          }`}></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* CTA Button - Always at bottom */}
                <button className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 mt-auto ${
                  hoveredCard === index
                    ? `bg-gradient-to-r ${option.color} text-white shadow-md`
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}>
                  {option.ctaText}
                </button>
              </div>


            </div>
          ))}
        </div>

        {/* Bottom Helper */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl border border-gray-200/50 shadow-sm">
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              Not sure where to start?
            </h4>
            <p className="text-gray-600 mb-4">
              Try the Playground first, it&apos;s the easiest way to see zero-knowledge proofs in action.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                No installation required
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Runs on your machine
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Real Ethereum transactions
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickStartSection;
