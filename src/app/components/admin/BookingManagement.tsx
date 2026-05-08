import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Trash2, Edit, Search, Filter } from "lucide-react";
import { toast } from "sonner";

interface Booking {
  id: number;
  name: string;
  phone: string;
  bikeSize: string;
  service: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Booking | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, filterStatus]);

  const loadBookings = () => {
    const data = JSON.parse(localStorage.getItem("bookings") || "[]");
    setBookings(data);
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.phone.includes(searchTerm)
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((b) => b.status === filterStatus);
    }

    setFilteredBookings(filtered);
  };

  const handleDelete = (id: number) => {
    if (confirm("Yakin ingin menghapus booking ini?")) {
      const updated = bookings.filter((b) => b.id !== id);
      localStorage.setItem("bookings", JSON.stringify(updated));
      setBookings(updated);
      toast.success("Booking berhasil dihapus!");
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditingId(booking.id);
    setEditData({ ...booking });
  };

  const handleSaveEdit = () => {
    if (!editData) return;

    const updated = bookings.map((b) => (b.id === editingId ? editData : b));
    localStorage.setItem("bookings", JSON.stringify(updated));
    setBookings(updated);
    setEditingId(null);
    setEditData(null);
    toast.success("Booking berhasil diupdate!");
  };

  const handleStatusChange = (id: number, status: string) => {
    const updated = bookings.map((b) => (b.id === id ? { ...b, status } : b));
    localStorage.setItem("bookings", JSON.stringify(updated));
    setBookings(updated);
    toast.success(`Status diubah menjadi ${status}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Menunggu":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
      case "Diproses":
        return "bg-blue-500/20 text-blue-500 border-blue-500/50";
      case "Selesai":
        return "bg-green-500/20 text-green-500 border-green-500/50";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/50";
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">Manajemen Booking</h2>
        <div className="text-gray-400">
          Total: <span className="text-[#ff7a00] font-bold">{filteredBookings.length}</span> booking
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid sm:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Cari nama atau nomor telepon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1a1a] border-2 border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-[#ff7a00] focus:outline-none transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-[#1a1a1a] border-2 border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#ff7a00] focus:outline-none transition-colors appearance-none"
          >
            <option value="all">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-[#1a1a1a] border-2 border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#111111] border-b border-gray-800">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Pelanggan
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Motor
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Layanan
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Jadwal
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada booking ditemukan
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-[#222222] transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-white font-semibold">{booking.name}</p>
                        <p className="text-gray-400 text-sm">{booking.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[#ff7a00] font-semibold">{booking.bikeSize}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-white">{booking.service}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-white">{booking.date}</p>
                        <p className="text-gray-400 text-sm">{booking.time} WIB</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          booking.status
                        )} bg-transparent focus:outline-none`}
                      >
                        <option value="Menunggu">Menunggu</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(booking)}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && editData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] border-2 border-gray-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold text-white mb-4">Edit Booking</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Nama</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full bg-[#111111] border-2 border-gray-800 rounded-lg px-4 py-2 text-white focus:border-[#ff7a00] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white mb-2">No WhatsApp</label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full bg-[#111111] border-2 border-gray-800 rounded-lg px-4 py-2 text-white focus:border-[#ff7a00] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Jenis Motor</label>
                <select
                  value={editData.bikeSize}
                  onChange={(e) => setEditData({ ...editData, bikeSize: e.target.value })}
                  className="w-full bg-[#111111] border-2 border-gray-800 rounded-lg px-4 py-2 text-white focus:border-[#ff7a00] focus:outline-none"
                >
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </select>
              </div>
              <div>
                <label className="block text-white mb-2">Tanggal</label>
                <input
                  type="date"
                  value={editData.date}
                  onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                  className="w-full bg-[#111111] border-2 border-gray-800 rounded-lg px-4 py-2 text-white focus:border-[#ff7a00] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Jam</label>
                <input
                  type="text"
                  value={editData.time}
                  onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                  className="w-full bg-[#111111] border-2 border-gray-800 rounded-lg px-4 py-2 text-white focus:border-[#ff7a00] focus:outline-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Simpan
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditData(null);
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
