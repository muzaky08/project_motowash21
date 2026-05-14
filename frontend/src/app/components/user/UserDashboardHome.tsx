import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Calendar, Ticket, MessageCircle, TrendingUp, Bell } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { bookingService, notificationService, voucherService, pointsService, chatService } from "../../../services/api";
import { getSocket } from "../../../services/socket";

interface UserDashboardHomeProps {
  user: {
    name?: string;
    [key: string]: any;
  } | null;
  unreadMessages?: number;
  onNavigate?: (path: string) => void;
}

export default function UserDashboardHome({
  user,
  unreadMessages = 0,
  onNavigate,
}: UserDashboardHomeProps) {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState<any>({ total_points: 0 });

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 15000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const socket = getSocket(token);

    const reload = () => loadDashboardData();
    socket.on("booking:created", reload);
    socket.on("booking:updated", reload);
    socket.on("notification:new", reload);
    socket.on("profile:updated", reload);
    socket.on("message:new", reload);

    return () => {
      socket.off("booking:created", reload);
      socket.off("booking:updated", reload);
      socket.off("notification:new", reload);
      socket.off("profile:updated", reload);
      socket.off("message:new", reload);
    };
  }, [token]);

  const loadDashboardData = async () => {
    if (!token) return;
    try {
      // Fetch data including messages for activity log
      const [bookingData, voucherRes, notificationData, pointsRes, messageData] = await Promise.all([
        bookingService.getUserBookings(token),
        voucherService.getActiveVouchers(),
        notificationService.getNotifications(token),
        pointsService.getUserPoints(token),
        chatService.getConversations(token) // Fetch recent chat activity
      ]);
      
      setBookings(bookingData || []);
      // Include upcoming vouchers in the count for better UX
      setVouchers(voucherRes.data || []);
      setNotifications(notificationData || []);
      setPoints(pointsRes.data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeBookingCount = useMemo(
    () => bookings.filter((booking) => !["Selesai", "Dibatalkan"].includes(booking.status)).length,
    [bookings],
  );

  const activities = useMemo(() => {
    // 1. Booking Activities
    const bookingActivities = bookings.slice(0, 5).map((booking) => ({
      id: `booking-${booking.id}`,
      icon: Calendar,
      title: `Booking ${booking.service}`,
      description: `Status: ${booking.status} - ${booking.date} ${booking.time}`,
      created_at: booking.updated_at || booking.created_at,
      type: 'booking'
    }));

    // 2. Notification Activities (includes profile updates, receipts, etc.)
    const notificationActivities = notifications.slice(0, 10).map((notification) => ({
      id: `notification-${notification.id}`,
      icon: notification.type === "chat" ? MessageCircle : notification.type === "booking" ? Calendar : Bell,
      title: notification.title,
      description: notification.message,
      created_at: notification.created_at,
      type: notification.type
    }));

    // Merge and Sort
    return [...bookingActivities, ...notificationActivities]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  }, [bookings, notifications]);

  const stats = [
    {
      icon: Calendar,
      title: "Booking Aktif",
      value: loading ? "..." : String(activeBookingCount),
      color: "bg-blue-500",
      path: "/user/dashboard/bookings",
    },
    {
      icon: Ticket,
      title: "Voucher Tersedia",
      value: loading ? "..." : String(vouchers.length),
      color: "bg-green-500",
      path: "/user/dashboard/vouchers",
    },
    {
      icon: MessageCircle,
      title: "Pesan Baru",
      value: String(unreadMessages),
      color: "bg-purple-500",
      path: "/chat",
    },
    {
      icon: TrendingUp,
      title: "Poin Loyalitas",
      value: loading ? "..." : String(points.total_points),
      color: "bg-orange-500",
      path: "/user/dashboard/vouchers",
      tooltip: "Kumpulkan 100 poin untuk voucher diskon 10%"
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#ff7a00] to-[#ff9500] rounded-2xl p-6 sm:p-8 text-white"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
          Selamat Datang, {user?.name || "User"}!
        </h2>
        <p className="text-sm sm:text-base text-white/90">
          Kelola booking, chat admin, voucher, dan aktivitas akun dari satu tempat.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <motion.button
            key={stat.title}
            type="button"
            onClick={() => onNavigate?.(stat.path)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            title={stat.tooltip}
            className="bg-card border border-border rounded-xl p-6 text-left hover:shadow-lg hover:border-[#ff7a00]/60 transition-all relative group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
              {stat.tooltip && (
                <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] px-2 py-1 rounded-md pointer-events-none whitespace-nowrap z-50">
                  {stat.tooltip}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
            <p className="text-muted-foreground text-sm">{stat.title}</p>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-foreground mb-4">Aktivitas Terakhir</h3>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Belum ada aktivitas
          </div>
        ) : (
          <div className="divide-y divide-border">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <activity.icon className="text-[#ff7a00]" size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground text-sm">{activity.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(activity.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
