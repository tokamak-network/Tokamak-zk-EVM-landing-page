"use client";

import React, { useEffect, useState } from "react";

const VideoSection: React.FC = () => {
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

    const section = document.getElementById("video-section");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="video-section" className="py-24 bg-gradient-to-b from-[#0a1930] to-[#1a2347] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#4fc3f7]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#29b6f6]/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: '"Jersey 10", "Press Start 2P", monospace', letterSpacing: '0.2rem' }}>
            See It In Action
          </h2>
          <p className="text-xl text-white/80 mx-auto" style={{ fontFamily: '"IBM Plex Mono"' }}>
            Watch how Tokamak ZKP solutions bring privacy and scalability to Ethereum
          </p>
        </div>

        {/* Video Container */}
        <div className={`w-full flex justify-center transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative w-full max-w-5xl">
            <div className="relative w-full pb-[56.25%] bg-[#0a1930] border-2 border-[#4fc3f7] shadow-lg hover:shadow-[#4fc3f7]/20 transition-all duration-300 overflow-hidden">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/UCDVLpwayCI?autoplay=0&mute=0&controls=1&modestbranding=1&rel=0&showinfo=0&fs=1&iv_load_policy=3&loop=1&playlist=UCDVLpwayCI&playsinline=1&cc_load_policy=0&color=white&disablekb=1"
                title="Tokamak zk EVM Demo"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  border: 'none',
                  pointerEvents: 'auto',
                }}
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;

