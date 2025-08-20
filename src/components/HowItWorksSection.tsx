"use client";

import React, { useEffect, useState } from "react";
import { Layers, Zap, CheckCircle, FileText, Lock } from "lucide-react";

const HowItWorksSection: React.FC = () => {
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

    const section = document.getElementById("how-it-works-section");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const renderIcon = (iconType: string) => {
    const iconProps = { size: 24, className: "text-current" };
    
    switch (iconType) {
      case "synthesize":
        return <Layers {...iconProps} />;
      case "prove":
        return <Zap {...iconProps} />;
      case "verify":
        return <CheckCircle {...iconProps} />;
      default:
        return null;
    }
  };

  const steps = [
    {
      number: "01",
      title: "Synthesize",
      description: "The compiler picks modular sub-circuits needed for your specific tx/block.",
      iconType: "synthesize",
      color: "from-blue-500 to-blue-700",
      details: "Smart circuit selection for optimal performance"
    },
    {
      number: "02", 
      title: "Prove",
      description: "The backend generates a ZK-SNARK on your machine.",
      iconType: "prove",
      color: "from-blue-600 to-blue-800",
      details: "Local proof generation, no cloud required"
    },
    {
      number: "03",
      title: "Verify",
      description: "Check the proof locally or on-chain (where applicable).",
      iconType: "verify",
      color: "from-blue-700 to-blue-900",
      details: "Instant verification anywhere"
    }
  ];

  return (
    <section id="how-it-works-section" className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-heading">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple 3-step process for zero-knowledge proofs
          </p>
        </div>

        {/* Steps Timeline - Horizontal Flow */}
        <div className="relative mb-16">
          {/* Background connecting line for desktop */}
          <div className="hidden lg:block absolute top-20 left-1/2 transform -translate-x-1/2 w-4/5 h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 opacity-40"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ animationDelay: `${index * 300}ms` }}
              >
                {/* Step Number Circle */}
                <div className="flex justify-center mb-8">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-xl shadow-lg relative z-10`}>
                    {step.number}
                  </div>
                  
                  {/* Arrow to next step (except for last step) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-8 left-1/2 w-full items-center justify-end pointer-events-none pr-4">
                      <div className="w-6 h-6 text-blue-400/60">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200/50">
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center text-white shadow-md`}>
                      {renderIcon(step.iconType)}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                    {step.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed text-center text-sm mb-4">
                    {step.description}
                  </p>

                  {/* Details - Simple text, no button-like appearance */}
                  <div className="text-center">
                    <p className="text-blue-600 text-sm font-medium">
                      {step.details}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Summary */}
        <div className={`text-center transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-sm border border-gray-200/50">
            <div className="flex items-center justify-center space-x-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                  <FileText size={32} className="text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Transaction</span>
              </div>
              
              <div className="flex-1 h-px bg-gradient-to-r from-blue-300 to-blue-500 relative">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-3">
                  <Lock size={32} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">ZK Proof</span>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mt-6">
              From transaction to verified proof in minutes, not hours
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
