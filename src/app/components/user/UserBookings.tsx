import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, Clock, Bike, Package, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { bookingService } from "../../../services/api";

const services = [
  "Regular Wash",
  "Wash and Wax",
  "Premium Wash",
  "Wash and Polish",
  "Detailing",
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
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    bike_size: "",
    service: "",
    date: "",
    time: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.bike_size || !formData.service || !formData.date || !formData.time) {
      toast.error("Mohon lengkapi semua data!");
      return;
    }

    if (!token) return;

    try {
      await bookingService.createBooking(formData, token);
      toast.success("Booking berhasil dibuat!");
      setShowNewBooking(false);
      setFormData({
        name: user?.name || "",
        phone: user?.phone || "",
        bike_size: "",
        service: "",
        date: "",
        time: "",
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff7a00] border-t-transparent"></div>
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
                  {services.map((service) => (
                    <option key={service} value={service}>{service}</option>
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
            </div>
            <button
              type="submit"
              className="w-full bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Buat Booking
            </button>
          </form>
        </motion.div>
      )}

      <div className="grid gap-4">
        {bookings.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground">Belum ada booking</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{booking.service}</h3>
                  <p className="text-muted-foreground text-sm">Booking #{booking.id.slice(0, 8)}</p>
                </div>
                <span className={`${getStatusColor(booking.status)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                  {booking.status}
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={16} className="text-[#ff7a00]" />
                  {booking.date}
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
  );
}
