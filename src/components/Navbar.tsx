"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

// Using public assets - no imports needed for SVGs in public folder
const LogoImage = "/assets/header/logo.svg";

const AnimatedBanner = () => {
  return (
    <div className="relative h-1 bg-gradient-to-r from-blue-500 via-blue-700 to-blue-400 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/3 animate-pulse"></div>
    </div>
  );
};

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const navigationHeight = 80;
      const targetPosition = elementPosition - navigationHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: "who-section", label: "Who" },
    { id: "three-ways-section", label: "How" },
    { id: "why-different-section", label: "Why" },
  ];

  return (
    <>
      {/* Professional Clean Navigation */}
      <nav
        className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ease-out bg-transparent`}
      >
        <div className={`${isScrolled ? "max-w-5xl" : "max-w-7xl"} mx-auto px-4 sm:px-6 lg:px-8 transition-[max-width] duration-500`}>
          <div className={`flex items-center justify-between ${isScrolled ? "h-14 sm:h-16 px-4 sm:px-6 rounded-full bg-white/90 backdrop-blur-xl shadow-lg ring-1 ring-black/5 mt-3" : "h-20 mt-0"}`}>
            {/* Logo Section - Left Side */}
            <div className="flex-shrink-0 group">
              <div className="transform hover:scale-105 transition-all duration-300 ease-out">
                <Image
                  src={LogoImage}
                  alt="Tokamak Network"
                  width={200}
                  height={17}
                  className="h-6 w-auto filter drop-shadow-sm"
                />
              </div>
            </div>

            {/* Desktop Navigation Links - Center */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-10">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 group ${isScrolled ? "text-gray-800 hover:text-blue-600" : "text-gray-700 hover:text-blue-600"}`}
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-300 group-hover:w-full rounded-full"></span>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Button - Right Side */}
            <div className="hidden md:block">
              <button
                onClick={() => scrollToSection("quickstart-section")}
                className="relative inline-flex items-center px-7 py-3 text-sm font-semibold rounded-full text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 overflow-hidden group"
              >
                <span className="relative z-10">Get Started</span>
                <svg className="ml-2 -mr-1 w-4 h-4 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600 transition-all duration-200"
              >
                <svg
                  className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6 transform transition-transform duration-300`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6 transform transition-transform duration-300 rotate-180`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-out ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div className="px-4 pt-2 pb-6 space-y-2 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-xl">
            {navItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200 transform hover:translate-x-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.label}
              </button>
            ))}
            <div className="mt-6 px-4">
              <button
                onClick={() => scrollToSection("quickstart-section")}
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started
                <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

const Navbar: React.FC = () => {
  return (
    <>
      <AnimatedBanner />
      <Navigation />
    </>
  );
};

export default Navbar;
