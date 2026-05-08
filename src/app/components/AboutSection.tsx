import { motion } from "motion/react";
import { useInView } from "../hooks/useInView";

export default function AboutSection() {
  const [ref, isInView] = useInView({ threshold: 0.2 });

  return (
    <section id="about" className="py-20 sm:py-32 bg-gray-100 dark:bg-[#1a1a1a] relative overflow-hidden transition-colors duration-300">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff7a00]/10 dark:bg-[#ff7a00]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#ff7a00]/10 dark:bg-[#ff7a00]/5 rounded-full blur-3xl" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block text-[#ff7a00] font-semibold text-sm sm:text-base mb-4 tracking-wider uppercase"
            >
              Tentang Kami
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
            >
              GARASI.21
              <br />
              <span className="text-[#ff7a00]">MOTOWASH</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-gray-600 dark:text-gray-400 text-base sm:text-lg leading-relaxed mb-8"
            >
              <text className="dark:text-gray-400 text-gray-600 text-base sm:text-lg leading-relaxed mb-8">Garasi.21 Motowash adalah tempat cuci motor premium di Kemiri City yang memberikan perawatan terbaik untuk motor Anda menggunakan metode profesional dan produk berkualitas.</text>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="space-y-4"
            >
              {[
                "Teknisi berpengalaman dan terlatih",
                "Produk premium berkualitas tinggi",
                "Peralatan modern dan canggih",
                "Hasil bersih maksimal terjamin",
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-2 h-2 bg-[#ff7a00] rounded-full" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1571568495363-99048b36777b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwY2xlYW5pbmclMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzc3NjE3NjE1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Professional Motorcycle Cleaning"
                className="w-full h-[400px] sm:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 dark:from-[#111111]/60 to-transparent" />
            </div>

            {/* Floating Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute -bottom-6 -left-6 bg-[#ff7a00] p-6 rounded-xl shadow-2xl"
            >
              <div className="text-white">
                <p className="text-4xl font-bold">500+</p>
                <p className="text-sm mt-1">Motor Terlayani</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
