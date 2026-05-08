import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Bell, Calendar, Ticket, MessageCircle, Info, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { notificationService } from "../../../services/api";

export default function UserNotifications({
  onNotificationsRead,
}: {
  onNotificationsRead: () => void;
}) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [token]);

  const loadNotifications = async () => {
    if (!token) return;
    try {
      const data = await notificationService.getNotifications(token);
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error("Gagal memuat notifikasi");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      await notificationService.markAsRead(id, token);
      setNotifications(prev =>
        prev.map(notif => notif.id === id ? { ...notif, is_read: true } : notif)
      );
      onNotificationsRead();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "booking":
        return Calendar;
      case "promo":
        return Ticket;
      case "chat":
        return MessageCircle;
      default:
        return Info;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "booking":
        return "bg-blue-500";
      case "promo":
        return "bg-green-500";
      case "chat":
        return "bg-purple-500";
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
        <h2 className="text-2xl font-bold text-foreground">Notifikasi</h2>
        {notifications.some(n => !n.is_read) && (
          <button
            onClick={() => {
              notifications.forEach(n => {
                if (!n.is_read) markAsRead(n.id);
              });
            }}
            className="text-[#ff7a00] hover:underline text-sm"
          >
            Tandai semua sudah dibaca
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Bell className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground">Belum ada notifikasi</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = getIcon(notification.type);
            const iconColor = getIconColor(notification.type);

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-card border rounded-xl p-4 transition-all ${
                  notification.is_read
                    ? "border-border opacity-60"
                    : "border-[#ff7a00] shadow-lg"
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`${iconColor} p-3 rounded-lg flex-shrink-0`}>
                    <Icon className="text-white" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{notification.title}</h3>
                      {notification.is_read && (
                        <CheckCircle2 className="text-green-500 flex-shrink-0" size={16} />
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
