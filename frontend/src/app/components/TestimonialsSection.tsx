import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Star, Quote, User } from "lucide-react";
import { reviewService, getAvatarUrl } from "../../services/api";

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await reviewService.getReviews();
      if (data && data.length > 0) {
        setReviews(data);
      } else {
        // Fallback dummy reviews if DB is empty
        setReviews([
          {
            id: 'dummy-1',
            user_name: 'Budi Santoso',
            rating: 5,
            comment: 'Layanan sangat memuaskan, motor jadi bersih mengkilap seperti baru lagi!',
            profile_picture: null
          },
          {
            id: 'dummy-2',
            user_name: 'Siti Aminah',
            rating: 5,
            comment: 'Admin sangat ramah dan proses cuci cepat. Harganya pun sangat terjangkau.',
            profile_picture: null
          },
          {
            id: 'dummy-3',
            user_name: 'Agus Pratama',
            rating: 5,
            comment: 'Sudah langganan di sini. Hasilnya tidak pernah mengecewakan. Mantap Garasi.21!',
            profile_picture: null
          }
        ]);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <section id="testimonials" className="py-24 bg-card overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#ff7a00]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ff7a00]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-[#ff7a00]/10 text-[#ff7a00] px-4 py-2 rounded-full text-sm font-bold mb-4"
          >
            <Star size={16} fill="#ff7a00" />
            TESTIMONI PELANGGAN
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-foreground mb-6"
          >
            Apa Kata Mereka Tentang <span className="text-[#ff7a00]">Kami?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Kepuasan Anda adalah prioritas kami. Lihat ulasan jujur dari para pelanggan setia GARASI.21 MOTOWASH.
          </motion.p>
        </div>

        <style>
          {`
            @keyframes marquee-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); } 
            }
            .animate-marquee {
              animation: marquee-scroll 40s linear infinite;
              display: flex;
              width: max-content;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
            .marquee-mask {
              mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
              -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
            }
          `}
        </style>

        <div className="relative w-full overflow-hidden py-4 marquee-mask">
          <div className="animate-marquee">
            {/* Group 1 */}
            <div className="flex gap-8 pr-8">
              {reviews.map((review) => (
                <div
                  key={`${review.id}-1`}
                  className="w-[320px] sm:w-[400px] flex-shrink-0 relative group rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(255,122,0,0.2)]"
                >
                  {/* Glass Background */}
                  <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl z-0 transition-colors group-hover:bg-card" />
                  
                  {/* Decorative Glows */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ff7a00]/10 rounded-full blur-2xl group-hover:bg-[#ff7a00]/20 transition-colors duration-500 z-0" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#ff7a00]/5 rounded-full blur-2xl group-hover:bg-[#ff7a00]/10 transition-colors duration-500 z-0" />
                  
                  {/* Top Accent Line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff7a00] to-transparent opacity-50 group-hover:opacity-100 transition-opacity z-10" />

                  {/* Content Container */}
                  <div className="relative z-10 p-6 sm:p-8 flex flex-col h-full">
                    {/* Header: Stars & Quote */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-1 bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-sm">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? "text-[#ff7a00] fill-[#ff7a00]" : "text-muted fill-muted"}
                          />
                        ))}
                      </div>
                      <div className="bg-[#ff7a00]/10 p-2.5 rounded-full transform group-hover:rotate-12 transition-transform duration-300">
                        <Quote className="text-[#ff7a00]" size={20} />
                      </div>
                    </div>

                    {/* Review Text */}
                    <p className="text-foreground/90 leading-relaxed mb-8 flex-1 italic text-sm sm:text-base font-medium">
                      "{review.comment || "Layanan sangat memuaskan, motor jadi bersih mengkilap!"}"
                    </p>

                    {/* Footer: User Info */}
                    <div className="flex items-center gap-4 bg-muted/40 p-3 sm:p-4 rounded-2xl border border-border/50 group-hover:bg-muted/60 transition-colors">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#ff7a00] p-0.5 bg-background">
                          {review.profile_picture ? (
                            <img
                              src={getAvatarUrl(review.profile_picture)}
                              alt={review.user_name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#ff7a00]/10 rounded-full flex items-center justify-center">
                              <User size={20} className="text-[#ff7a00]" />
                            </div>
                          )}
                        </div>
                        {/* Aesthetic Dot */}
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-foreground text-sm truncate">{review.user_name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a00]" />
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold truncate">Pelanggan Setia</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Group 2 (Duplicate for seamless loop) */}
            <div className="flex gap-8 pr-8">
              {reviews.map((review) => (
                <div
                  key={`${review.id}-2`}
                  className="w-[320px] sm:w-[400px] flex-shrink-0 relative group rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(255,122,0,0.2)]"
                >
                  {/* Glass Background */}
                  <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl z-0 transition-colors group-hover:bg-card" />
                  
                  {/* Decorative Glows */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ff7a00]/10 rounded-full blur-2xl group-hover:bg-[#ff7a00]/20 transition-colors duration-500 z-0" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#ff7a00]/5 rounded-full blur-2xl group-hover:bg-[#ff7a00]/10 transition-colors duration-500 z-0" />
                  
                  {/* Top Accent Line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff7a00] to-transparent opacity-50 group-hover:opacity-100 transition-opacity z-10" />

                  {/* Content Container */}
                  <div className="relative z-10 p-6 sm:p-8 flex flex-col h-full">
                    {/* Header: Stars & Quote */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-1 bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-sm">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? "text-[#ff7a00] fill-[#ff7a00]" : "text-muted fill-muted"}
                          />
                        ))}
                      </div>
                      <div className="bg-[#ff7a00]/10 p-2.5 rounded-full transform group-hover:rotate-12 transition-transform duration-300">
                        <Quote className="text-[#ff7a00]" size={20} />
                      </div>
                    </div>

                    {/* Review Text */}
                    <p className="text-foreground/90 leading-relaxed mb-8 flex-1 italic text-sm sm:text-base font-medium">
                      "{review.comment || "Layanan sangat memuaskan, motor jadi bersih mengkilap!"}"
                    </p>

                    {/* Footer: User Info */}
                    <div className="flex items-center gap-4 bg-muted/40 p-3 sm:p-4 rounded-2xl border border-border/50 group-hover:bg-muted/60 transition-colors">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#ff7a00] p-0.5 bg-background">
                          {review.profile_picture ? (
                            <img
                              src={getAvatarUrl(review.profile_picture)}
                              alt={review.user_name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#ff7a00]/10 rounded-full flex items-center justify-center">
                              <User size={20} className="text-[#ff7a00]" />
                            </div>
                          )}
                        </div>
                        {/* Aesthetic Dot */}
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-foreground text-sm truncate">{review.user_name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a00]" />
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold truncate">Pelanggan Setia</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
