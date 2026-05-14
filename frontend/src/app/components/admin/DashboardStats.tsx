import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Calendar, Users, Package, TrendingUp, MessageCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { bookingService, chatService, serviceService, userService } from "../../../services/api";
import { getSocket } from "../../../services/socket";

interface DashboardStatsProps {
  onNavigate?: (path: string) => void;
}

export default function DashboardStats({ onNavigate }: DashboardStatsProps) {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const socket = getSocket(token);
    const reload = () => loadStats();

    socket.on("booking:created", reload);
    socket.on("booking:updated", reload);
    socket.on("message:new", reload);
    socket.on("message:sent", reload);

    return () => {
      socket.off("booking:created", reload);
      socket.off("booking:updated", reload);
      socket.off("message:new", reload);
      socket.off("message:sent", reload);
    };
  }, [token]);

  const loadStats = async () => {
    if (!token) return;
    try {
      const [bookingData, userData, serviceData, conversationData] = await Promise.all([
        bookingService.getAllBookings(token),
        userService.getAllUsers(token),
        serviceService.getServices(),
        chatService.getConversations(token),
      ]);

      setBookings(bookingData || []);
      setUsers((userData || []).filter((user: any) => user.role === "user"));
      setServices(serviceData || []);
      setConversations(conversationData || []);
    } catch (error) {
      console.error("Error loading admin dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString("en-CA");
  const todayBookings = bookings.filter((booking) => booking.date === today).length;
  const pendingBookings = bookings.filter((booking) => booking.status === "Menunggu").length;
  const unreadChats = conversations.reduce((total, conversation) => total + Number(conversation.unread_count || 0), 0);

  const statCards = [
    {
      title: "Booking Hari Ini",
      value: todayBookings,
      icon: Calendar,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10",
      path: "/admin/dashboard/bookings",
    },
    {
      title: "Total Pelanggan",
      value: users.length,
      icon: Users,
      iconColor: "text-green-500",
      bgColor: "bg-green-500/10",
      path: "/admin/dashboard/bookings",
    },
    {
      title: "Total Layanan",
      value: services.length,
      icon: Package,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-500/10",
      path: "/admin/dashboard/services",
    },
    {
      title: "Booking Menunggu",
      value: pendingBookings,
      icon: TrendingUp,
      iconColor: "text-[#ff7a00]",
      bgColor: "bg-[#ff7a00]/10",
      path: "/admin/dashboard/bookings",
    },
  ];

  const recentActivities = useMemo(() => {
    const bookingActivities = bookings.slice(0, 6).map((booking) => ({
      id: `booking-${booking.id}`,
      icon: Calendar,
      title: `Booking ${booking.service}`,
      description: `${booking.name} - ${booking.status} - ${booking.date} ${booking.time}`,
      created_at: booking.updated_at || booking.created_at,
      path: "/admin/dashboard/bookings",
    }));

    const chatActivities = conversations.slice(0, 6).map((conversation) => ({
      id: `chat-${conversation.id}`,
      icon: MessageCircle,
      title: `Chat ${conversation.name}`,
      description: conversation.last_message || "Percakapan baru",
      created_at: conversation.last_message_at,
      path: "/admin/chat",
    }));

    return [...bookingActivities, ...chatActivities]
      .filter((activity) => activity.created_at)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);
  }, [bookings, conversations]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Dashboard Overview</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.button
            type="button"
            key={stat.title}
            onClick={() => onNavigate?.(stat.path)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="bg-card border border-border rounded-xl p-6 text-left hover:border-[#ff7a00]/70 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={stat.iconColor} size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-2">{loading ? "..." : stat.value}</p>
            <p className="text-muted-foreground text-sm">{stat.title}</p>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-8 bg-card border border-border rounded-xl p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h3 className="text-xl font-bold text-foreground">Aktivitas Terbaru</h3>
            <p className="text-sm text-muted-foreground">
              {pendingBookings} booking menunggu dan {unreadChats} chat belum dibaca.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.("/admin/chat")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#ff7a00] text-white hover:bg-[#e96f00] transition-colors"
          >
            <MessageCircle size={18} />
            Buka Chat
          </button>
        </div>

        {recentActivities.length === 0 ? (
          <div className="rounded-lg border border-border bg-muted/30 p-6 text-center text-muted-foreground">
            Belum ada aktivitas terbaru.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentActivities.map((activity) => (
              <button
                key={activity.id}
                type="button"
                onClick={() => onNavigate?.(activity.path)}
                className="w-full flex gap-3 py-4 first:pt-0 last:pb-0 text-left hover:bg-muted/40 transition-colors rounded-lg px-2"
              >
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
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
