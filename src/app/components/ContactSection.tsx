import { motion } from "motion/react";
import { Instagram, Music2, MessageCircle, MapPin } from "lucide-react";
import { useInView } from "../hooks/useInView";

export default function ContactSection() {
  const [ref, isInView] = useInView({ threshold: 0.2 });

  const openWhatsApp = () => {
    window.open("https://wa.me/6281234567890", "_blank");
  };

  const openInstagram = () => {
    window.open("https://instagram.com/garasi.21motowash", "_blank");
  };

  const openTikTok = () => {
    window.open("https://tiktok.com/@garasi.21motowash", "_blank");
  };

  return (
    <section id="contact" className="py-20 sm:py-32 bg-white dark:bg-[#111111] relative overflow-hidden transition-colors duration-300">
      {/* Decorative Background */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#ff7a00]/10 dark:bg-[#ff7a00]/10 rounded-full blur-3xl" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-[#ff7a00] font-semibold text-sm sm:text-base mb-4 tracking-wider uppercase">
            Hubungi Kami
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Tetap <span className="text-[#ff7a00]">Terhubung</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Ikuti kami di media sosial atau hubungi langsung via WhatsApp
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Media Sosial</h3>
            <div className="space-y-4">
              {/* Instagram */}
              <button
                onClick={openInstagram}
                className="w-full bg-gray-50 dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-gray-800 hover:border-[#ff7a00] rounded-xl p-6 flex items-center gap-4 transition-all duration-300 hover:transform hover:scale-105 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Instagram className="text-white" size={28} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-gray-900 dark:text-white font-semibold text-lg group-hover:text-[#ff7a00] transition-colors">
                    Instagram
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">@garasi.21motowash</p>
                </div>
              </button>

              {/* TikTok */}
              <button
                onClick={openTikTok}
                className="w-full bg-gray-50 dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-gray-800 hover:border-[#ff7a00] rounded-xl p-6 flex items-center gap-4 transition-all duration-300 hover:transform hover:scale-105 group"
              >
                <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Music2 className="text-white" size={28} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-gray-900 dark:text-white font-semibold text-lg group-hover:text-[#ff7a00] transition-colors">
                    TikTok
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">@garasi.21motowash</p>
                </div>
              </button>
            </div>
          </motion.div>

          {/* WhatsApp Contact */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Kontak Langsung</h3>
            
            {/* WhatsApp Button */}
            <button
              onClick={openWhatsApp}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-green-500/50 mb-6"
            >
              <MessageCircle size={48} />
              <div className="text-center">
                <p className="font-bold text-xl mb-1">Chat WhatsApp</p>
                <p className="text-sm opacity-90">Hubungi kami langsung</p>
              </div>
            </button>

            {/* Location */}
            <div className="bg-gray-50 dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#ff7a00]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-[#ff7a00]" size={24} />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-semibold text-lg mb-2">Lokasi</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Kota Serang, Banten
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Jam Operasional: 08:00 - 18:00 WIB
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Map Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-16 bg-gray-50 dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden h-64 sm:h-80 flex items-center justify-center"
        >
          <div className="text-center">
            <MapPin className="text-[#ff7a00] mx-auto mb-4" size={48} />
            <p className="text-gray-900 dark:text-white font-semibold text-xl mb-2">GARASI.21 MOTOWASH</p>
            <p className="text-gray-600 dark:text-gray-400">Kota Serang, Banten</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
