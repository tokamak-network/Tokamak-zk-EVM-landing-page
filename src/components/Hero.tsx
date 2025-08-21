"use client";

import React, { useEffect, useState, useRef } from "react";
import { FileText, Lock, ArrowRight } from "lucide-react";

const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);


  const [interactiveElements, setInteractiveElements] = useState<Array<{id: number, x: number, y: number, scale: number, rotation: number}>>([]);
  const [clickEffects, setClickEffects] = useState<Array<{id: number, x: number, y: number, timestamp: number}>>([]);
  


  useEffect(() => {
    setIsVisible(true);
    


    // Initialize interactive floating elements (reduced and positioned away from center)
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    
    const newElements = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: Math.random() * screenWidth * 0.3 + (i % 2 === 0 ? 0 : screenWidth * 0.7),
      y: Math.random() * screenHeight * 0.4 + (i % 2 === 0 ? screenHeight * 0.6 : 0),
      scale: Math.random() * 0.5 + 0.5,
      rotation: Math.random() * 360
    }));
    setInteractiveElements(newElements);
    

    
    const handleClick = (e: MouseEvent) => {
      const newEffect = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      };
      setClickEffects(prev => [...prev, newEffect]);
      
      // Remove effect after animation
      setTimeout(() => {
        setClickEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
      }, 1000);
    };
    
    // Enhanced particle animation
    const animateParticles = () => {
      setInteractiveElements(prev => prev.map(element => ({
        ...element,
        rotation: element.rotation + 0.5,
        y: element.y - 0.2,
        x: element.x + Math.sin(Date.now() * 0.001 + element.id) * 0.3,
        ...(element.y < -50 && {
          y: window.innerHeight + 50,
          x: Math.random() * window.innerWidth
        })
      })));
    };
    
    const particleInterval = setInterval(animateParticles, 60);
    window.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('click', handleClick);
      clearInterval(particleInterval);
    };
  }, []);

  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-38"
    >
      {/* Enhanced Interactive Background */}
      <div className="absolute inset-0 z-0 opacity-80">


        {/* Interactive Floating Elements */}
        {interactiveElements.map(element => (
          <div
            key={element.id}
            className="absolute transition-all duration-500 hover:scale-125 cursor-pointer"
            style={{
              left: element.x,
              top: element.y,
              transform: `scale(${element.scale}) rotate(${element.rotation}deg)`,
            }}
          >
            <div className="w-16 h-16 border-2 border-blue-300/40 rounded-lg bg-gradient-to-br from-blue-100/20 to-blue-200/10 backdrop-blur-sm animate-pulse" />
          </div>
        ))}

        {/* Click Effects */}
        {clickEffects.map(effect => (
          <div
            key={effect.id}
            className="absolute pointer-events-none"
            style={{
              left: effect.x - 25,
              top: effect.y - 25,
            }}
          >
            <div className="w-12 h-12 border-4 border-blue-400 rounded-full animate-ping opacity-75" />
            <div className="absolute top-2 left-2 w-8 h-8 bg-blue-400/30 rounded-full animate-pulse" />
          </div>
        ))}
        
        {/* Enhanced Geometric Shapes */}
        <div className="absolute top-32 left-16 w-20 h-20 border-2 border-blue-300/40 rotate-45 animate-spin-slow hover:border-blue-400/60 transition-colors cursor-pointer"></div>
        <div className="absolute top-64 right-24 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-blue-300/20 rounded-full animate-pulse hover:scale-110 transition-transform cursor-pointer"></div>
        <div className="absolute bottom-48 left-32 w-18 h-18 border-3 border-blue-400/30 rounded-full animate-bounce-slow hover:border-blue-500/50 transition-colors cursor-pointer"></div>
        <div className="absolute bottom-32 right-16 w-16 h-16 bg-blue-100/40 rotate-12 animate-pulse delay-1000 hover:rotate-45 transition-transform cursor-pointer"></div>
        <div className="absolute top-1/4 right-1/3 w-12 h-12 border border-blue-200/50 rotate-45 animate-spin-slow delay-500"></div>
        <div className="absolute bottom-1/4 left-1/3 w-14 h-14 bg-gradient-to-r from-blue-100/30 to-blue-200/20 rounded-full animate-float"></div>
        

        
        {/* Dynamic Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[size:60px_60px] [mask:radial-gradient(ellipse_100%_70%_at_50%_0%,#000_40%,transparent_100%)] animate-pulse" />
        
        {/* Enhanced Floating Orbs */}
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-100/50 to-blue-200/30 rounded-full blur-2xl animate-float hover:blur-xl transition-all cursor-pointer"></div>
        <div className="absolute bottom-32 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-200/40 to-blue-300/20 rounded-full blur-3xl animate-float-delayed hover:blur-2xl transition-all cursor-pointer"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/30 to-transparent rounded-full blur-3xl animate-spin-very-slow"></div>
        
        {/* Pulsing Rings */}
        <div className="absolute top-1/3 right-1/4 w-32 h-32 border border-blue-300/20 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/3 left-1/4 w-24 h-24 border-2 border-blue-400/25 rounded-full animate-ping delay-1000"></div>
      </div>

      <div className="relative z-50 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Status Badge */}
          <div className={`inline-flex items-center px-6 py-3 rounded-full bg-white/95 backdrop-blur-md border border-blue-200/50 shadow-lg mb-16 transition-all duration-1000 relative z-50 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
            <span className="text-gray-700 font-medium text-sm">Now Live on Your Machine</span>
          </div>

          {/* Main Headline */}
          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 font-heading tracking-tight leading-none transition-all duration-1000 delay-200 relative z-50 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="bg-gradient-to-r from-blue-600 via-blue-800 to-blue-900 bg-clip-text text-transparent leading-tight block font-bold transform hover:scale-105 transition-transform duration-500">
              OWN YOUR PRIVACY
            </span>
          </h1>

          {/* Value Proposition */}
          <p className={`text-xl md:text-2xl text-gray-600 mb-12 max-w-5xl mx-auto leading-relaxed transition-all duration-1000 delay-400 relative z-50 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Build on Ethereum with{" "}
            <span className="text-blue-600 font-semibold">zero-knowledge privacy</span>, no compromises on speed or security. Try the{" "}
            <span className="text-blue-700 font-semibold">GUI Playground</span>{" "}
            or our{" "}
            <span className="text-blue-700 font-semibold">CLI</span>{" "}
            to generate and verify ZK proofs locally.
          </p>

          {/* Dual CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Primary CTA - Playground */}
            <button className="group relative inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl relative z-50">
              <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Try Playground</span>
              <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Secondary CTA - CLI */}
            <button className="group relative inline-flex items-center px-8 py-4 text-lg font-semibold text-blue-700 bg-white border-2 border-blue-600 rounded-xl hover:bg-blue-50 hover:border-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl relative z-50">
              <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Install CLI</span>
              <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Transaction to ZK Proof Conversion Visual */}
          <div className={`mt-16 mb-16 transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-lg relative z-50">
              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  You Control The Conversion
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Transform any Ethereum transaction into a zero-knowledge proof on your own machine
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-6 space-y-6 sm:space-y-0">
                {/* Transaction */}
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-xl flex items-center justify-center mb-3 mx-auto shadow-sm">
                    <FileText size={28} className="sm:size-9 text-gray-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Transaction</span>
                  <div className="text-xs text-gray-500 mt-1">Visible on-chain</div>
                </div>
                
                {/* Arrow - Mobile: Vertical, Desktop: Horizontal */}
                <div className="sm:flex-1 sm:h-px sm:bg-gradient-to-r from-blue-300 to-blue-500 relative w-px h-12 bg-gradient-to-b sm:w-auto sm:h-px">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <ArrowRight size={12} className="sm:size-4 text-white rotate-90 sm:rotate-0" />
                  </div>
                  <div className="hidden sm:block absolute sm:-top-12 sm:left-1/2 sm:transform sm:-translate-x-1/2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full whitespace-nowrap">
                    Local Proof
                  </div>
                </div>
                
                {/* ZK Proof */}
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-xl flex items-center justify-center mb-3 mx-auto shadow-md">
                    <Lock size={28} className="sm:size-9 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700">ZK Proof</span>
                  <div className="text-xs text-gray-500 mt-1">Privacy preserved</div>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-6 text-center">
                <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    No third parties
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    Runs on your hardware
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                    Verify anywhere
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Scroll Indicator */}
      {/* <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-7 h-12 border-2 border-blue-400/60 rounded-full flex justify-center backdrop-blur-sm bg-white/20">
          <div className="w-1.5 h-4 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div> */}
    </section>
  );
};

export default Hero;
