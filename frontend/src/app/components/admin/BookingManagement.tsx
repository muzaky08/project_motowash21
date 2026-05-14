import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Filter, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { bookingService } from "../../../services/api";
import { getSocket } from "../../../services/socket";

interface Booking {
  id: string;
  name: string;
  phone: string;
  bike_size: string;
  service: string;
  date: string;
  time: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

const statuses = ["Menunggu", "Dikonfirmasi", "Sedang Proses", "Selesai", "Dibatalkan"];

export default function BookingManagement() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const socket = getSocket(token);
    const reload = () => loadBookings();

    socket.on("booking:created", reload);
    socket.on("booking:updated", reload);

    return () => {
      socket.off("booking:created", reload);
      socket.off("booking:updated", reload);
    };
  }, [token]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, filterStatus]);

  const loadBookings = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await bookingService.getAllBookings(token);
      setBookings(data || []);
    } catch (error: any) {
      console.error("Error loading admin bookings:", error);
      toast.error(error.message || "Gagal memuat booking customer");
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (searchTerm) {
      const keyword = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.name.toLowerCase().includes(keyword) ||
          booking.phone.includes(searchTerm) ||
          booking.service.toLowerCase().includes(keyword),
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((booking) => booking.status === filterStatus);
    }

    setFilteredBookings(filtered);
  };

  const handleStatusChange = async (id: string, status: string) => {
    if (!token) return;
    setUpdatingId(id);
    try {
      await bookingService.updateBookingStatus(id, status, token);
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, status, updated_at: new Date().toISOString() } : booking,
        ),
      );
      toast.success(`Status booking diubah menjadi ${status}`);
    } catch (error: any) {
      toast.error(error.message || "Gagal mengubah status booking");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Menunggu":
        return "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/40";
      case "Dikonfirmasi":
        return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/40";
      case "Sedang Proses":
        return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/40";
      case "Selesai":
        return "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/40";
      case "Dibatalkan":
        return "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/40";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Manajemen Booking</h2>
          <p className="text-sm text-muted-foreground">
            Menampilkan booking yang masuk dari user/customer.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-muted-foreground">
            Total: <span className="text-[#ff7a00] font-bold">{filteredBookings.length}</span> booking
          </div>
          <button
            type="button"
            onClick={loadBookings}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-6 grid sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Cari nama, nomor telepon, atau layanan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-input-background border border-border rounded-lg pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-[#ff7a00] focus:outline-none transition-colors"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-input-background border border-border rounded-lg pl-10 pr-4 py-3 text-foreground focus:border-[#ff7a00] focus:outline-none transition-colors appearance-none"
          >
            <option value="all">Semua Status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                {["Pelanggan", "Motor", "Layanan", "Jadwal", "Status", "Dibuat"].map((heading) => (
                  <th key={heading} className="px-4 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    Memuat booking customer...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    Tidak ada booking ditemukan
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-foreground font-semibold">{booking.name}</p>
                        <p className="text-muted-foreground text-sm">{booking.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[#ff7a00] font-semibold">{booking.bike_size}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-foreground">{booking.service}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-foreground">{booking.date}</p>
                        <p className="text-muted-foreground text-sm">{booking.time} WIB</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={booking.status}
                        disabled={updatingId === booking.id}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          booking.status,
                        )} bg-transparent focus:outline-none disabled:opacity-60`}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-muted-foreground text-sm">
                        {new Date(booking.created_at).toLocaleString("id-ID")}
                      </p>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
