import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Clock, Bike, Package, Plus, Ticket, X, Star, Check, ShieldCheck, History as HistoryIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { bookingService, voucherService } from "../../../services/api";
import ReviewModal from "./ReviewModal";

const services = [
  { name: "Regular Wash", price: 30000 },
  { name: "Wash and Wax", price: 50000 },
  { name: "Premium Wash", price: 75000 },
  { name: "Wash and Polish", price: 150000 },
  { name: "Detailing", price: 350000 },
];

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
];

export default function UserBookings() {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    bike_size: "",
    service: "",
    date: "",
    time: "",
    voucher_code: "",
    discount_amount: 0,
  });
  
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);

  useEffect(() => {
    loadBookings();
  }, [token]);

  const loadBookings = async () => {
    if (!token) return;
    try {
      const data = await bookingService.getUserBookings(token);
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error("Gagal memuat booking");
    } finally {
      setLoading(false);
    }
  };

  const handleValidateVoucher = async () => {
    if (!formData.service) {
      toast.error("Pilih layanan terlebih dahulu untuk validasi voucher");
      return;
    }
    if (!formData.voucher_code) {
      toast.error("Masukkan kode voucher terlebih dahulu");
      return;
    }
    if (!token) return;

    try {
      setIsValidatingVoucher(true);
      
      const selectedService = services.find(s => s.name === formData.service);
      const amount = selectedService ? selectedService.price : 50000;

      const response = await voucherService.validateVoucher(formData.voucher_code, amount, token);
      
      if (response.success) {
        setAppliedVoucher({
          code: response.data.code,
          discount: response.data.discount_amount
        });
        setFormData({
          ...formData,
          discount_amount: response.data.discount_amount
        });
        toast.success(`Voucher berhasil! Hemat Rp ${Number(response.data.discount_amount).toLocaleString('id-ID')}`);
      } else {
        toast.error(response.message || "Kode voucher tidak valid");
      }
    } catch (error: any) {
      toast.error(error.message || "Kode voucher tidak valid atau sudah habis");
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setFormData({
      ...formData,
      voucher_code: "",
      discount_amount: 0
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.bike_size || !formData.service || !formData.date || !formData.time) {
      toast.error("Mohon lengkapi semua data!");
      return;
    }

    if (!token) return;

    try {
      const payload = {
        ...formData,
        voucher_code: appliedVoucher?.code || null,
        discount_amount: appliedVoucher?.discount || 0
      };
      await bookingService.createBooking(payload, token);
      toast.success("Booking berhasil dibuat!");
      setShowNewBooking(false);
      setAppliedVoucher(null);
      setFormData({
        name: user?.name || "",
        phone: user?.phone || "",
        bike_size: "",
        service: "",
        date: "",
        time: "",
        voucher_code: "",
        discount_amount: 0,
      });
      loadBookings();
    } catch (error: any) {
      toast.error(error.message || "Gagal membuat booking");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Menunggu":
        return "bg-yellow-500";
      case "Dikonfirmasi":
        return "bg-blue-500";
      case "Sedang Proses":
        return "bg-purple-500";
      case "Selesai":
        return "bg-green-500";
      case "Dibatalkan":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff7a00] border-t-transparent"></div>
          <p className="text-sm font-medium animate-pulse">Memuat data booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Booking Saya</h2>
        <button
          onClick={() => setShowNewBooking(!showNewBooking)}
          className="flex items-center gap-2 bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Booking Baru
        </button>
      </div>

      {showNewBooking && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">Buat Booking Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-foreground font-semibold mb-2">Nama</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="block text-foreground font-semibold mb-2">No. WhatsApp</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="block text-foreground font-semibold mb-2">Ukuran Motor</label>
                <select
                  value={formData.bike_size}
                  onChange={(e) => setFormData({ ...formData, bike_size: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground"
                >
                  <option value="">Pilih ukuran</option>
                  <option value="M">M - Matic, Bebek</option>
                  <option value="L">L - Sport 150-250cc</option>
                  <option value="XL">XL - Sport &gt;250cc, Moge</option>
                </select>
              </div>
              <div>
                <label className="block text-foreground font-semibold mb-2">Layanan</label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground"
                >
                  <option value="">Pilih layanan</option>
                  {services.map((s) => (
                    <option key={s.name} value={s.name}>{s.name} - Rp {s.price.toLocaleString('id-ID')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-foreground font-semibold mb-2">Tanggal</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="block text-foreground font-semibold mb-2">Waktu</label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground"
                >
                  <option value="">Pilih waktu</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-foreground font-semibold mb-2">Punya kode voucher?</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.voucher_code}
                    onChange={(e) => setFormData({ ...formData, voucher_code: e.target.value.toUpperCase() })}
                    placeholder="Contoh: CUCI20"
                    disabled={!!appliedVoucher}
                    className="flex-1 bg-input-background border border-border rounded-lg px-4 py-2 text-foreground uppercase disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={handleValidateVoucher}
                    disabled={isValidatingVoucher || !!appliedVoucher || !formData.voucher_code}
                    className="bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isValidatingVoucher ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : null}
                    Pakai
                  </button>
                </div>
                {appliedVoucher && (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Ticket className="text-green-500" size={18} />
                      <div>
                        <p className="text-green-500 font-bold text-sm">Voucher berhasil!</p>
                        <p className="text-xs text-muted-foreground">Hemat Rp {Number(appliedVoucher.discount).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeVoucher}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-[#ff7a00]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Buat Booking Sekarang
            </button>
          </form>
        </motion.div>
      )}

      <div className="space-y-12">
        {/* Active Bookings Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-[#ff7a00] animate-pulse" />
            <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">Booking Aktif</h3>
          </div>
          
          <div className="grid gap-4">
            {bookings.filter(b => !["Selesai", "Dibatalkan"].includes(b.status)).length === 0 ? (
              <div className="bg-card/50 border border-border rounded-xl p-8 text-center">
                <p className="text-muted-foreground text-sm">Tidak ada booking aktif saat ini</p>
              </div>
            ) : (
              bookings.filter(b => !["Selesai", "Dibatalkan"].includes(b.status)).map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{booking.service}</h3>
                      <p className="text-muted-foreground text-sm">Booking #{booking.id.slice(0, 8)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`${getStatusColor(booking.status)} text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm`}>
                        {booking.status}
                      </span>
                      {booking.card_code && (
                        <div className="bg-[#ff7a00]/10 border border-[#ff7a00]/30 rounded-lg px-3 py-1">
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Kartu Booking</p>
                          <p className="text-[#ff7a00] font-mono font-bold text-sm">{booking.card_code}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-4 gap-4 text-sm relative z-10">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={16} className="text-[#ff7a00]" />
                      {new Date(booking.date).toLocaleDateString('id-ID')}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock size={16} className="text-[#ff7a00]" />
                      {booking.time}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Bike size={16} className="text-[#ff7a00]" />
                      Motor {booking.bike_size}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package size={16} className="text-[#ff7a00]" />
                      {booking.service}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* History Section */}
        {bookings.filter(b => ["Selesai", "Dibatalkan"].includes(b.status)).length > 0 && (
          <div className="space-y-4 pt-8 border-t border-border">
            <div className="flex items-center gap-2 mb-4">
              <HistoryIcon size={20} className="text-muted-foreground" />
              <h3 className="text-lg font-bold text-muted-foreground uppercase tracking-wider">Riwayat Layanan</h3>
            </div>
            
            <div className="grid gap-3">
              {bookings.filter(b => ["Selesai", "Dibatalkan"].includes(b.status)).map((booking) => (
                <div 
                  key={booking.id}
                  className="bg-card border border-border/60 rounded-xl p-4 opacity-75 hover:opacity-100 transition-all group grayscale hover:grayscale-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${booking.status === 'Selesai' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        <ShieldCheck size={20} className={booking.status === 'Selesai' ? 'text-green-500' : 'text-red-500'} />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{booking.service}</h4>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(booking.date).toLocaleDateString('id-ID')} • {booking.time}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {booking.status === 'Selesai' && !booking.is_reviewed && (
                        <button
                          onClick={() => setSelectedBookingForReview(booking)}
                          className="bg-[#ff7a00]/10 text-[#ff7a00] hover:bg-[#ff7a00] hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-[#ff7a00]/20"
                        >
                          Beri Rating
                        </button>
                      )}
                      {booking.is_reviewed && (
                        <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold">
                          <Check size={12} />
                          DINILAI
                        </div>
                      )}
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                        booking.status === 'Selesai' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ReviewModal
        isOpen={!!selectedBookingForReview}
        onClose={() => setSelectedBookingForReview(null)}
        booking={selectedBookingForReview}
        token={token!}
        onSuccess={loadBookings}
      />
    </div>
  );
}
