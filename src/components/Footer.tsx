"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const Footer: React.FC = () => {
  const LogoImage = "/assets/header/logo.svg";

  return (
    <footer 
      className="relative z-10 text-white overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #1a2347 0%, #0a1930 100%)",
        boxShadow: "0 -20px 60px rgba(0, 0, 0, 0.8)"
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#4fc3f7] to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <Image
                src={LogoImage}
                alt="Tokamak Network"
                width={240}
                height={26}
                className="h-8 w-auto filter brightness-0 invert"
              />
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              High-throughput zero-knowledge proof solutions for Ethereum. Powering zk-EVM rollups, threshold signatures, and private application channels.
            </p>
            <div className="flex space-x-4">
              {/* Official Social Links */}
              <a href="https://x.com/TokamakZKPWorld" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors duration-300" aria-label="Follow us on X (Twitter)">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://t.me/+9My2ZmBemYs2YTFk" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors duration-300" aria-label="Join our Telegram">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
              <a href="https://medium.com/tokamak-network" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors duration-300" aria-label="Read our Medium articles">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75S24 8.83 24 12z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-400">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://www.tokamak.network/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block"
                >
                  Official Website
                </a>
              </li>
              <li>
                <a 
                  href="https://docs.tokamak.network/home/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block"
                >
                  Documentation
                </a>
              </li>
              <li>
                <Link 
                  href="/#who-section" 
                  className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block"
                >
                  Who This Is For
                </Link>
              </li>
              <li>
                <Link 
                  href="/#two-ways-section" 
                  className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block"
                >
                  How to Use
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-400">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://github.com/tokamak-network" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/tokamak-network/Tokamak-zk-EVM-playgrounds/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block"
                >
                  Get Started
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 Tokamak Network ZKP. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
