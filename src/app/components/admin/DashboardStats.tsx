import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Calendar, Users, Package, TrendingUp } from "lucide-react";

interface Booking {
  id: number;
  date: string;
  status: string;
}

export default function DashboardStats() {
  const [stats, setStats] = useState({
    todayBookings: 0,
    totalCustomers: 0,
    totalServices: 5,
    pendingBookings: 0,
  });

  useEffect(() => {
    const bookings: Booking[] = JSON.parse(localStorage.getItem("bookings") || "[]");
    const today = new Date().toISOString().split("T")[0];
    
    const todayBookings = bookings.filter((b) => b.date === today).length;
    const totalCustomers = bookings.length;
    const pendingBookings = bookings.filter((b) => b.status === "Menunggu").length;

    setStats({
      todayBookings,
      totalCustomers,
      totalServices: 5,
      pendingBookings,
    });
  }, []);

  const statCards = [
    {
      title: "Booking Hari Ini",
      value: stats.todayBookings,
      icon: Calendar,
      color: "bg-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Pelanggan",
      value: stats.totalCustomers,
      icon: Users,
      color: "bg-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total Layanan",
      value: stats.totalServices,
      icon: Package,
      color: "bg-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Booking Menunggu",
      value: stats.pendingBookings,
      icon: TrendingUp,
      color: "bg-[#ff7a00]",
      bgColor: "bg-[#ff7a00]/10",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="bg-[#1a1a1a] border-2 border-gray-800 rounded-xl p-6 hover:border-[#ff7a00] transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`text-${stat.color.replace('bg-', '')}`} size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
            <p className="text-gray-400 text-sm">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-8 bg-[#1a1a1a] border-2 border-gray-800 rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">Selamat Datang, Admin!</h3>
        <p className="text-gray-400">
          Gunakan menu di atas untuk mengelola booking, layanan, dan galeri.
        </p>
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="bg-[#111111] border border-gray-800 rounded-lg p-4">
            <p className="text-[#ff7a00] font-semibold mb-1">Quick Tip</p>
            <p className="text-gray-400 text-sm">
              Periksa booking baru setiap hari untuk memastikan tidak ada yang terlewat.
            </p>
          </div>
          <div className="bg-[#111111] border border-gray-800 rounded-lg p-4">
            <p className="text-[#ff7a00] font-semibold mb-1">Info</p>
            <p className="text-gray-400 text-sm">
              Data disimpan di browser localStorage. Clear cache akan menghapus data.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
