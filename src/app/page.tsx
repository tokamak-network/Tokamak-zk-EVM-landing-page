import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhoSection from "@/components/WhoSection";
import ThreeWaysSection from "@/components/ThreeWaysSection";
import VideoSection from "@/components/VideoSection";
import WhyDifferentSection from "@/components/WhyDifferentSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
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