import { motion } from "motion/react";
import { Users, Award, Wrench, Sparkles } from "lucide-react";
import { useInView } from "../hooks/useInView";

const features = [
  {
    icon: Users,
    title: "Teknisi Profesional",
    description: "Tim teknisi berpengalaman dan terlatih dalam perawatan motor",
  },
  {
    icon: Award,
    title: "Produk Berkualitas",
    description: "Menggunakan produk premium untuk hasil maksimal",
  },
  {
    icon: Wrench,
    title: "Peralatan Modern",
    description: "Dilengkapi dengan peralatan canggih dan teknologi terkini",
  },
  {
    icon: Sparkles,
    title: "Hasil Bersih Maksimal",
    description: "Jaminan kepuasan dengan hasil cuci yang sempurna",
  },
];

export default function FeaturesSection() {
  const [ref, isInView] = useInView({ threshold: 0.2 });

  return (
    <section id="features" className="py-20 sm:py-32 bg-gray-100 dark:bg-[#1a1a1a] relative overflow-hidden transition-colors duration-300">
      {/* Decorative Background */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ff7a00]/10 dark:bg-[#ff7a00]/10 rounded-full blur-3xl" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-[#ff7a00] font-semibold text-sm sm:text-base mb-4 tracking-wider uppercase">
            Keunggulan
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Mengapa Pilih <span className="text-[#ff7a00]">Kami?</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Komitmen kami untuk memberikan layanan terbaik
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="group"
            >
              <div className="bg-white dark:bg-[#111111] border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-8 h-full transition-all duration-300 hover:border-[#ff7a00] hover:shadow-xl hover:shadow-[#ff7a00]/20 hover:transform hover:scale-105">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-[#ff7a00]/10 rounded-xl flex items-center justify-center group-hover:bg-[#ff7a00]/20 transition-all duration-300">
                    <feature.icon className="text-[#ff7a00]" size={32} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#ff7a00] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative Element */}
                <div className="mt-6 w-12 h-1 bg-[#ff7a00] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { number: "500+", label: "Motor Terlayani" },
            { number: "98%", label: "Kepuasan Pelanggan" },
            { number: "5+", label: "Tahun Pengalaman" },
            { number: "10+", label: "Produk Premium" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
              className="text-center p-6 bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-gray-800"
            >
              <p className="text-3xl sm:text-4xl font-bold text-[#ff7a00] mb-2">{stat.number}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
