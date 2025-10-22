"use client";

import React, { useEffect, useState } from "react";
import { Link, Zap, Laptop } from "lucide-react";

const FAQSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("faq-section");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const renderIcon = (iconType: string) => {
    const iconProps = { size: 24, className: "text-current" };
    
    switch (iconType) {
      case "chain":
        return <Link {...iconProps} />;
      case "speed":
        return <Zap {...iconProps} />;
      case "laptop":
        return <Laptop {...iconProps} />;
      default:
        return null;
    }
  };

  const faqs = [
    {
      question: "Is this a private chain?",
      answer: "No. It's a Layer-2 privacy solution on Ethereum. Users can always exit back to L1 if trust among L2 participants breaks.",
      iconType: "chain"
    },
    {
      question: "Is this just a state channel?",
      answer: "It borrows ideas from channels and rollups, but is designed for verifiable computation with ZK proofs and optional consensus protocols.",
      iconType: "speed"
    },
    {
      question: "Can I run this on a laptop?",
      answer: "Yes, that's the point. A modern laptop/desktop (e.g., 32 GB RAM; CPU or consumer GPU) is enough to try proofs today.",
      iconType: "laptop"
    }
  ];

  return (
    <section id="faq-section" className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-heading">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Common questions about zero-knowledge privacy
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`group bg-white border border-gray-200/50 hover:border-gray-300/50 shadow-sm hover:shadow-lg transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Question */}
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${
                    openFAQ === index ? 'from-blue-500 to-blue-700' : 'from-gray-200 to-gray-300'
                  } flex items-center justify-center transition-all duration-300 ${
                    openFAQ === index ? 'text-white scale-110' : 'text-gray-600'
                  }`}>
                    {renderIcon(faq.iconType)}
                  </div>
                  <h3 className={`text-xl font-bold transition-all duration-300 ${
                    openFAQ === index 
                      ? 'text-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text' 
                      : 'text-gray-900 group-hover:text-blue-700'
                  }`}>
                    {faq.question}
                  </h3>
                </div>
                
                <div className={`w-8 h-8 bg-gray-100 flex items-center justify-center transition-all duration-300 ${
                  openFAQ === index ? 'rotate-180 bg-blue-100' : 'group-hover:bg-gray-200'
                }`}>
                  <svg 
                    className={`w-4 h-4 transition-colors duration-300 ${
                      openFAQ === index ? 'text-blue-600' : 'text-gray-600'
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Answer */}
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                openFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-8 pb-8">
                  <div className="pl-16">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="p-8 bg-white border border-gray-200/50 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Join our community or check out the documentation for more details.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group inline-flex items-center px-6 py-3 bg-[#028bee] text-white font-semibold hover:bg-[#0277d4] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <span>Join Discord</span>
                <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button className="group inline-flex items-center px-6 py-3 text-white bg-blue-700 border-2 border-blue-700 hover:bg-blue-800 hover:border-blue-800 transform hover:scale-105 transition-all duration-300">
                <span>Read Docs</span>
                <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
