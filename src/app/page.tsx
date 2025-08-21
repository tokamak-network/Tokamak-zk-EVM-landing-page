import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhoSection from "@/components/WhoSection";
import ThreeWaysSection from "@/components/ThreeWaysSection";
import WhyDifferentSection from "@/components/WhyDifferentSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <WhoSection />
        <ThreeWaysSection />
        <WhyDifferentSection />
      </main>
      <Footer />
    </div>
  );
}