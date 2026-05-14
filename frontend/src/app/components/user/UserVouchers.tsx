import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Ticket, Copy, Check, Star, History as HistoryIcon, Download, QrCode, ChevronRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { voucherService, pointsService, bookingCardService } from "../../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { downloadBookingCard } from "../../../utils/downloadBookingCard";
import Logo from "../Logo";

export default function UserVouchers() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<"cards" | "vouchers">("cards");
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [points, setPoints] = useState<any>({ total_points: 0, history: [] });
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [voucherRes, pointsRes, cardsRes] = await Promise.all([
        voucherService.getActiveVouchers(),
        pointsService.getUserPoints(token!),
        bookingCardService.getUserCards(token!)
      ]);
      setVouchers(voucherRes.data || []);
      setPoints(pointsRes.data);
      setCards(cardsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Kode voucher disalin!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = async (card: any) => {
    setIsDownloading(card.card_code);
    try {
      toast.info("Menyiapkan unduhan...");
      await downloadBookingCard({
        cardCode: card.card_code,
        serviceName: card.service,
        date: new Date(card.date).toLocaleDateString('id-ID'),
        time: card.time,
        status: card.status
      });
      toast.success("Kartu berhasil diunduh!");
    } catch (error: any) {
      console.error("Download failed:", error);
      toast.error(`Gagal mengunduh: ${error.message || 'Kesalahan sistem'}`);
    } finally {
      setIsDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff7a00] border-t-transparent"></div>
          <p className="font-medium animate-pulse">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 px-4 sm:px-6">
      {/* Loyalty Points Summary */}
      <section className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Star size={100} className="text-[#ff7a00]" />
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="bg-[#ff7a00]/20 p-4 rounded-2xl transform transition-transform group-hover:scale-110">
              <Star className="text-[#ff7a00]" size={28} fill="#ff7a00" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium mb-1 uppercase tracking-widest">Poin Loyalitas</p>
              <h3 className="text-3xl font-black text-foreground tracking-tight">
                {points.total_points} <span className="text-sm font-normal text-muted-foreground ml-1">Poin</span>
              </h3>
            </div>
          </div>

          <div className="flex-1 max-w-xs w-full">
            <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase tracking-wider text-muted-foreground">
              <span>Progress Reward</span>
              <span className="text-[#ff7a00]">{points.total_points}/100</span>
            </div>
            <div className="bg-muted rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((points.total_points / 100) * 100, 100)}%` }}
                className="bg-[#ff7a00] h-full rounded-full shadow-[0_0_10px_rgba(255,122,0,0.4)]"
              />
            </div>
          </div>

          <button className="flex items-center gap-2 text-xs font-bold text-[#ff7a00] hover:bg-[#ff7a00]/10 px-4 py-2 rounded-xl transition-all border border-[#ff7a00]/20">
            <HistoryIcon size={16} />
            Riwayat
          </button>
        </div>
      </section>

      {/* Tabs Selection */}
      <div className="flex p-1 bg-muted/50 rounded-2xl w-fit mx-auto border border-border backdrop-blur-sm">
        <button
          onClick={() => setActiveTab("cards")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "cards" ? "bg-[#ff7a00] text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <QrCode size={16} />
          Kartu Booking
        </button>
        <button
          onClick={() => setActiveTab("vouchers")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "vouchers" ? "bg-[#ff7a00] text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <Ticket size={16} />
          Voucher Promo
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "cards" ? (
          <motion.div
            key="cards"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-10 max-w-4xl mx-auto"
          >
            {/* Active Cards Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <h3 className="text-sm font-bold text-foreground">KARTU AKTIF</h3>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {cards.filter(c => c.status === 'pending').length === 0 ? (
                  <div className="col-span-2 bg-card/50 border border-border rounded-3xl p-8 text-center">
                    <p className="text-xs text-muted-foreground">Tidak ada kartu aktif</p>
                  </div>
                ) : (
                  cards.filter(c => c.status === 'pending').map((card) => (
                    <div key={card.id} className="flex flex-col gap-3">
                      <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-xl relative">
                        <div className="bg-gradient-to-r from-[#ff7a00] to-[#ff9500] p-3 text-white flex justify-between items-center">
                          <Logo variant="full" size="sm" />
                          <span className="text-[9px] font-black uppercase tracking-tighter opacity-80">E-Ticket Card</span>
                        </div>
                        <div className="p-5 pb-3 flex flex-col items-center text-center">
                          <div className="bg-muted p-3 rounded-2xl mb-3 border border-border/50">
                            <QrCode size={100} className="text-foreground" />
                          </div>
                          <div className="space-y-0.5 mb-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Booking Code</p>
                            <h4 className="text-xl font-black text-[#ff7a00] font-mono tracking-tighter">{card.card_code}</h4>
                          </div>
                          <div className="w-full grid grid-cols-2 gap-3 border-y border-border py-3 mb-4">
                            <div className="text-left">
                              <p className="text-[9px] font-bold text-muted-foreground uppercase">Layanan</p>
                              <p className="font-bold text-xs text-foreground truncate">{card.service}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] font-bold text-muted-foreground uppercase">Status</p>
                              <div className="flex justify-end">
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500">PENDING</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/50 w-full p-2.5 rounded-xl">
                            <ShieldCheck size={12} className="text-green-500" />
                            Tunjukkan kepada admin saat tiba
                          </div>
                        </div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-background border-2 border-border rounded-full" />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-background border-2 border-border rounded-full" />
                      </div>
                      <button
                        onClick={() => handleDownload(card)}
                        disabled={!!isDownloading}
                        className="w-full bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-[#ff7a00]/10"
                      >
                        {isDownloading === card.card_code ? "Memproses..." : <><Download size={16} /> Download PNG</>}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* History Section */}
            {cards.filter(c => c.status !== 'pending').length > 0 && (
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2 opacity-60">
                  <HistoryIcon size={16} className="text-muted-foreground" />
                  <h3 className="text-sm font-bold text-muted-foreground">RIWAYAT KARTU</h3>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {cards.filter(c => c.status !== 'pending').map((card) => (
                    <div 
                      key={card.id} 
                      className="group relative bg-card border border-border rounded-xl p-3 opacity-60 hover:opacity-100 transition-all cursor-default grayscale hover:grayscale-0"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="bg-muted p-1 rounded-lg">
                          <QrCode size={24} className="text-muted-foreground" />
                        </div>
                        <span className={`text-[8px] font-black px-1 py-0.5 rounded-full ${card.status === 'validated' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                          {card.status === 'validated' ? 'DIGUNAKAN' : 'EXPIRED'}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono font-bold text-[#ff7a00]">{card.card_code}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{card.service}</p>
                      <p className="text-[8px] text-muted-foreground mt-1">{new Date(card.date).toLocaleDateString('id-ID')}</p>
                      
                      <button
                        onClick={() => handleDownload(card)}
                        className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                      >
                        <Download size={20} className="text-[#ff7a00]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cards.length === 0 && (
              <div className="bg-card border-2 border-dashed border-border rounded-3xl p-12 text-center">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="text-muted-foreground" size={32} />
                </div>
                <h4 className="text-lg font-bold text-foreground mb-1">Belum ada kartu booking</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Lakukan booking layanan terlebih dahulu untuk mendapatkan kartu digital ini.
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="vouchers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {vouchers.length === 0 ? (
              <div className="col-span-full bg-card border border-border rounded-3xl p-12 text-center flex flex-col items-center">
                <div className="bg-[#ff7a00]/10 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                  <Ticket className="text-[#ff7a00]" size={36} />
                </div>
                <h4 className="text-lg font-bold text-foreground mb-2">Kumpulkan poin untuk tukar voucher!</h4>
                <p className="text-xs text-muted-foreground max-w-xs mb-6">
                  Setiap transaksi akan memberikan poin yang bisa Anda tukarkan dengan potongan harga menarik.
                </p>
                <button
                  onClick={() => window.location.href = '/user/dashboard/bookings'}
                  className="bg-[#ff7a00] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:scale-105 transition-transform flex items-center gap-2"
                >
                  Booking Sekarang
                  <ChevronRight size={16} />
                </button>
              </div>
            ) : (
              vouchers.map((voucher) => (
                <motion.div
                  key={voucher.id}
                  className="bg-gradient-to-br from-[#ff7a00] to-[#ff9500] rounded-2xl p-4 text-white shadow-lg relative overflow-hidden group min-h-[160px] flex flex-col justify-between"
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform" />

                  <div className="flex items-start justify-between mb-3 relative z-10">
                    <div>
                      <h3 className="text-lg font-black leading-tight">{voucher.title}</h3>
                      <p className="text-white/80 text-[10px] font-medium truncate max-w-[120px]">{voucher.description}</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-xl">
                      <Ticket size={20} />
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 mb-3 relative z-10 border border-white/10">
                    <p className="text-[8px] font-black text-white/60 mb-1 uppercase tracking-widest">KODE PROMO</p>
                    <div className="flex items-center justify-between">
                      <code className="text-xl font-black tracking-tighter font-mono">{voucher.code}</code>
                      <button
                        onClick={() => copyCode(voucher.code, voucher.id)}
                        className="bg-white text-[#ff7a00] p-1.5 rounded-lg hover:scale-110 transition-transform shadow-sm"
                      >
                        {copiedId === voucher.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-end justify-between relative z-10">
                    <div>
                      <p className="text-white/60 text-[8px] font-bold uppercase mb-0.5">Potongan</p>
                      <p className="text-lg font-black">
                        {voucher.type === 'percent' ? `${Number(voucher.value)}%` : `Rp${Number(voucher.value).toLocaleString('id-ID')}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-[8px] font-bold uppercase mb-0.5">Berlaku s/d</p>
                      <p className="text-[10px] font-black">
                        {new Date(voucher.valid_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

