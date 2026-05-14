import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useInView } from "../hooks/useInView";
import { galleryService } from "../../services/api";

interface GalleryImage {
  id: number;
  url: string;
  title: string;
}

export default function GallerySection() {
  const [ref, isInView] = useInView({ threshold: 0.1 });
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const data = await galleryService.getGallery();
        setImages(data);
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGallery();
  }, []);

  return (
    <section id="gallery" className="py-20 sm:py-32 bg-white dark:bg-[#111111] relative overflow-hidden transition-colors duration-300">
      {/* Decorative Background */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#ff7a00]/10 dark:bg-[#ff7a00]/10 rounded-full blur-3xl" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-[#ff7a00] font-semibold text-sm sm:text-base mb-4 tracking-wider uppercase">
            Galeri
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Hasil <span className="text-[#ff7a00]">Pekerjaan Kami</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Lihat transformasi motor sebelum dan sesudah perawatan
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
          {isLoading ? (
            // Loading State
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))
          ) : images.length > 0 ? (
            images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group relative overflow-hidden rounded-2xl aspect-square cursor-pointer"
              >
                {/* Image */}
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 dark:from-[#111111] via-gray-900/40 dark:via-[#111111]/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white font-bold text-xl mb-2">{image.title}</h3>
                  <div className="w-12 h-1 bg-[#ff7a00] rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300" />
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 border-2 border-[#ff7a00] opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-gray-500 dark:text-gray-400">Belum ada foto di galeri</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Ingin motor Anda terlihat seperti ini?
          </p>
          <button
            onClick={() => {
              const element = document.querySelector("#booking");
              element?.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#ff7a00]/50"
          >
            Book Sekarang
          </button>
        </motion.div>
      </div>
    </section>
  );
}
