import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhatsAppNewArrivals from "@/components/WhatsAppNewArrivals";
import CategorySection from "@/components/CategorySection";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black text-white"
    >
      <Navbar />
      <main className="pt-4">
        <HeroSection />
        <WhatsAppNewArrivals />
        <CategorySection />
      </main>
      <Footer />
    </motion.div>
  );
}