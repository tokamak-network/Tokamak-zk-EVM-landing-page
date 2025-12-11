import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhoSection from "@/components/WhoSection";
import ThreeWaysSection from "@/components/ThreeWaysSection";
import VideoSection from "@/components/VideoSection";
import WhyDifferentSection from "@/components/WhyDifferentSection";
import Footer from "@/components/Footer";
import { SectionTracker } from "@/components/Analytics";

// Section IDs to track for analytics
const TRACKED_SECTIONS = [
  "overview",           // Hero section
  "who-section",        // Who This Is For
  "two-ways-section",   // Three Ways Section
  "video-section",      // Video Section
  "why-different-section", // Why Different Section
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Analytics: Track section views */}
      <SectionTracker sections={TRACKED_SECTIONS} />
      
      <main>
        <Hero />
        <WhoSection />
        <ThreeWaysSection />
        <VideoSection />
        <WhyDifferentSection />
      </main>
      <Footer />
    </div>
  );
}