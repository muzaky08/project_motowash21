import { motion } from "motion/react";
import { Calendar, Ticket, MessageCircle, TrendingUp } from "lucide-react";

interface UserDashboardHomeProps {
  user: {
    name?: string;
    [key: string]: any;
  } | null;
}

export default function UserDashboardHome({ user }: UserDashboardHomeProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#ff7a00] to-[#ff9500] rounded-2xl p-8 text-white"
      >
        <h2 className="text-3xl font-bold mb-2">
          Selamat Datang, {user?.name || "User"}!
        </h2>
        <p className="text-white/90">
          Kelola booking dan dapatkan promo menarik di sini
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: Calendar,
            title: "Booking Aktif",
            value: "0",
            color: "bg-blue-500",
          },
          {
            icon: Ticket,
            title: "Voucher Tersedia",
            value: "0",
            color: "bg-green-500",
          },
          {
            icon: MessageCircle,
            title: "Pesan Baru",
            value: "0",
            color: "bg-purple-500",
          },
          {
            icon: TrendingUp,
            title: "Poin Loyalitas",
            value: "0",
            color: "bg-orange-500",
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
            <p className="text-muted-foreground text-sm">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-foreground mb-4">Aktivitas Terakhir</h3>
        <div className="text-center py-8 text-muted-foreground">
          Belum ada aktivitas
        </div>
      </motion.div>
    </div>
  );
}
