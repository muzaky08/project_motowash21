import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, X, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { reviewService } from "../../../services/api";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  token: string;
  onSuccess: () => void;
}

export default function ReviewModal({ isOpen, onClose, booking, token, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Silakan berikan bintang rating terlebih dahulu");
      return;
    }

    try {
      setIsSubmitting(true);
      await reviewService.createReview({
        booking_id: booking.id,
        rating,
        comment
      }, token);
      
      toast.success("Terima kasih atas ulasan Anda!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Gagal mengirim ulasan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-card border border-border w-full max-w-md rounded-3xl p-8 relative z-10 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-8">
              <div className="bg-[#ff7a00]/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="text-[#ff7a00]" size={32} fill="#ff7a00" />
              </div>
              <h3 className="text-2xl font-black text-foreground">Beri Ulasan</h3>
              <p className="text-muted-foreground text-sm">
                Bagaimana pengalaman Anda dengan layanan {booking.service}?
                <br />
                <span className="text-[#ff7a00] font-bold">Yuk review kami, untuk mendapatkan 10 poin loyalitas tambahan!</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating */}
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="transition-transform hover:scale-110"
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      size={40}
                      className={star <= (hover || rating) ? "text-[#ff7a00]" : "text-muted"}
                      fill={star <= (hover || rating) ? "#ff7a00" : "none"}
                    />
                  </button>
                ))}
              </div>

              {/* Comment field */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                  <MessageSquare size={16} />
                  KOMENTAR (OPSIONAL)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan pengalaman Anda..."
                  className="w-full bg-input-background border border-border rounded-2xl p-4 text-foreground focus:ring-2 focus:ring-[#ff7a00] transition-all min-h-[120px] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff7a00]/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    Kirim Ulasan
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
