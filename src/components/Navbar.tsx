"use client";

import React from "react";
import Image from "next/image";

// Using public assets - no imports needed for SVGs in public folder
const LogoImage = "/assets/header/logo.svg";

const AnimatedBanner = () => {
  return (
    <div className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500"></div>
  );
};

const Navigation = () => {
  const scrollToSection = (sectionId: string) => {
    // Check if mobile screen (1359px and below)
    const isMobile = window.innerWidth <= 1359;

    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      // Calculate navigation height offset
      const navigationHeight = isMobile ? 62 : 80; // Mobile navigation height: ~62px, Desktop: 80px
      const targetPosition = elementPosition - navigationHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  };

  const navItems = [
    { id: "who-section", label: "Who" },
    { id: "two-ways-section", label: "How" },
    { id: "why-different-section", label: "Why" },
  ];

  return (
    <>
      {/* Mobile Logo Section - NOT sticky */}
      <div className="desktop:hidden flex justify-center items-center bg-gradient-to-r from-[#0a1930] to-[#1a2347] py-4">
        <Image
          src={LogoImage}
          alt="logo"
          width={318}
          height={27}
          style={{
            width: "318px",
            height: "27px",
            flexShrink: 0,
            aspectRatio: "106/9",
          }}
        />
      </div>

      {/* Desktop Navigation - sticky */}
      <div className="hidden desktop:flex h-[80px] items-center justify-between pl-[40px] border-t-[2px] border-b-[2px] border-[#4fc3f7] bg-gradient-to-r from-[#0a1930] to-[#1a2347] sticky top-0 z-50">
        <div className="flex items-center">
          <Image src={LogoImage} alt="logo" width={334} height={27} />
        </div>

        {/* Centered Navigation Items */}
        <div className="flex gap-x-[72px] font-[500] text-[20px] text-white">
          {navItems.map((item) => (
            <span
              key={item.id}
              style={{ cursor: "pointer" }}
              onClick={() => scrollToSection(item.id)}
              className="hover:text-[#4fc3f7] hover:scale-110 transition-all duration-300"
            >
              {item.label}
            </span>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => window.open("https://github.com/tokamak-network/Tokamak-zk-EVM", "_blank")}
          style={{
            display: "flex",
            padding: "0px 32px",
            alignItems: "center",
            gap: "72px",
            alignSelf: "stretch",
            borderLeft: "2px solid #4fc3f7",
            background: "#028bee",
            color: "#FFF",
            fontFamily: '"IBM Plex Mono"',
            fontSize: "20px",
            fontStyle: "normal",
            fontWeight: 600,
            lineHeight: "normal",
            letterSpacing: "-0.1px",
            cursor: "pointer",
          }}
          className="hover:shadow-lg hover:shadow-[#4fc3f7]/50 hover:bg-[#0277d4] transition-all duration-300"
        >
          Get Started
        </button>
      </div>

      {/* Mobile Navigation - sticky */}
      <div
        className="desktop:hidden flex w-full bg-gradient-to-r from-[#0a1930] to-[#1a2347] sticky top-0 z-50"
        style={{
          borderTop: "2px solid #4fc3f7",
          borderBottom: "2px solid #4fc3f7",
        }}
      >
        {navItems.map((item, index) => (
          <div
            key={item.id}
            className="flex cursor-pointer"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              flex: "1 0 0",
              alignSelf: "stretch",
              background: "#028bee",
              color: "#FFF",
              fontFamily: '"IBM Plex Mono"',
              fontSize: "18px",
              fontStyle: "normal",
              fontWeight: 500,
              lineHeight: "normal",
              letterSpacing: "-0.11px",
              padding: "16px 0",
              borderRight: index < navItems.length - 1 ? "2px solid #4fc3f7" : "none",
            }}
            onClick={() => scrollToSection(item.id)}
          >
            {item.label}
          </div>
        ))}
      </div>
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
