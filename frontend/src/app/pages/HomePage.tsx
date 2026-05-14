import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import ServicesSection from "../components/ServicesSection";
import FeaturesSection from "../components/FeaturesSection";
import GallerySection from "../components/GallerySection";
import BookingSection from "../components/BookingSection";
import TestimonialsSection from "../components/TestimonialsSection";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-[#ff7a00] border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-foreground">GARASI.21 MOTOWASH</h2>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <FeaturesSection />
      <GallerySection />
      <TestimonialsSection />
      <BookingSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
