import { motion } from "motion/react";
import { Check } from "lucide-react";
import { useInView } from "../hooks/useInView";

const services = [
  {
    name: "Regular Wash",
    treatments: [
      "Cuci Body Salju (Snow Wash)",
      "Cuci Kaki-Kaki",
      "Semir Ban",
    ],
    prices: {
      M: "18.000",
      L: "20.000",
      XL: "25.000",
    },
    popular: false,
  },
  {
    name: "Wash and Wax",
    treatments: [
      "Cuci Body Salju",
      "Cuci Kaki-Kaki",
      "Semir Ban",
      "Wax Body Halus",
      "Dressing Body Kasar",
    ],
    prices: {
      M: "25.000",
      L: "30.000",
      XL: "35.000",
    },
    popular: true,
  },
  {
    name: "Premium Wash",
    treatments: [
      "Cuci Body Salju",
      "Cuci Kaki-Kaki",
      "Semir Ban",
      "Wax Body Halus",
      "Dressing Body Kasar",
      "Pembersih Kerak Mesin",
    ],
    prices: {
      M: "55.000",
      L: "65.000",
      XL: "75.000",
    },
    popular: false,
  },
  {
    name: "Wash and Polish",
    treatments: [
      "Cuci Body Salju",
      "Cuci Kaki-Kaki",
      "Semir Ban",
      "Poles Body 3 Step",
      "Step 1 Heavy Cut",
      "Step 2 Medium Cut Polish",
      "Step 3 Finish Plus",
    ],
    prices: {
      M: "185.000",
      L: "200.000",
      XL: "250.000",
    },
    popular: false,
  },
  {
    name: "Detailing",
    treatments: [
      "Cuci Luar Dalam Secara Detail",
      "Degreasing Mesin",
      "Cuci Kaki-Kaki",
      "Wax Body Halus",
      "Dressing Body Kasar",
      "Semir Ban",
    ],
    prices: {
      M: "285.000",
      L: "300.000",
      XL: "350.000",
    },
    popular: false,
  },
];

export default function ServicesSection() {
  const [ref, isInView] = useInView({ threshold: 0.1 });

  return (
    <section id="services" className="py-20 sm:py-32 bg-white dark:bg-[#111111] relative overflow-hidden transition-colors duration-300">
      {/* Decorative Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff7a00]/10 dark:bg-[#ff7a00]/10 rounded-full blur-3xl" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-[#ff7a00] font-semibold text-sm sm:text-base mb-4 tracking-wider uppercase">
            Layanan Kami
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Paket <span className="text-[#ff7a00]">Cuci Motor</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Pilih paket yang sesuai dengan kebutuhan motor Anda
          </p>
        </motion.div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className={`relative bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-6 sm:p-8 border-2 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl group ${
                service.popular
                  ? "border-[#ff7a00] shadow-lg shadow-[#ff7a00]/20"
                  : "border-gray-200 dark:border-gray-800 hover:border-[#ff7a00]/50"
              }`}
            >
              {/* Popular Badge */}
              {service.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#ff7a00] text-white px-4 py-1 rounded-full text-xs font-semibold">
                    POPULER
                  </span>
                </div>
              )}

              {/* Service Name */}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-[#ff7a00] transition-colors">
                {service.name}
              </h3>

              {/* Treatments */}
              <div className="mb-6 space-y-3">
                {service.treatments.map((treatment, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="text-[#ff7a00] mt-1 flex-shrink-0" size={18} />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{treatment}</span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-800 my-6" />

              {/* Prices */}
              <div className="space-y-2">
                <p className="text-gray-500 dark:text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
                  Harga
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(service.prices).map(([size, price]) => (
                    <div key={size} className="text-center">
                      <p className="text-[#ff7a00] font-bold text-xs mb-1">{size}</p>
                      <p className="text-gray-900 dark:text-white font-semibold text-sm">Rp {price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#ff7a00]/0 via-[#ff7a00]/5 to-[#ff7a00]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* Size Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-block bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Kategori Ukuran Motor:</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#ff7a00] rounded-full" />
                <span className="text-gray-900 dark:text-white font-semibold">M:</span>
                <span className="text-gray-600 dark:text-gray-400">Matic, Bebek</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#ff7a00] rounded-full" />
                <span className="text-gray-900 dark:text-white font-semibold">L:</span>
                <span className="text-gray-600 dark:text-gray-400">Sport 150-250cc</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#ff7a00] rounded-full" />
                <span className="text-gray-900 dark:text-white font-semibold">XL:</span>
                <span className="text-gray-600 dark:text-gray-400">Sport &gt;250cc, Moge</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
