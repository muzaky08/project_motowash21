import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  MessageCircle,
  Bell,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Home,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { chatService, notificationService, getAvatarUrl } from "../../../services/api";
import { getSocket } from "../../../services/socket";
import UserDashboardHome from "../../components/user/UserDashboardHome";
import UserBookings from "../../components/user/UserBookings";
import UserVouchers from "../../components/user/UserVouchers";
import UserSettings from "../../components/user/UserSettings";
import UserChat from "../../components/user/UserChat";
import Logo from "../../components/Logo";
import LogoutConfirmDialog from "../../components/user/LogoutConfirmDialog";

type TabType = "dashboard" | "bookings" | "vouchers" | "chat" | "settings";

const USER_TAB_PATHS: Record<TabType, string> = {
  dashboard: "/user/dashboard",
  bookings: "/user/dashboard/bookings",
  vouchers: "/user/dashboard/vouchers",
  chat: "/user/dashboard/chat",
  settings: "/user/dashboard/settings",
};

function getTabFromPath(pathname: string): TabType {
  if (pathname.includes("/bookings")) return "bookings";
  if (pathname.includes("/vouchers")) return "vouchers";
  if (pathname.includes("/chat")) return "chat";
  if (pathname.includes("/settings")) return "settings";
  return "dashboard";
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, token, logout } = useAuth();
  const activeTab = getTabFromPath(location.pathname);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const tabs = useMemo(
    () => [
      { id: "dashboard" as TabType, name: "Dashboard", icon: LayoutDashboard, path: USER_TAB_PATHS.dashboard },
      { id: "bookings" as TabType, name: "Booking Saya", icon: Calendar, path: USER_TAB_PATHS.bookings },
      { id: "vouchers" as TabType, name: "Voucher", icon: Ticket, path: USER_TAB_PATHS.vouchers },
      { id: "chat" as TabType, name: "Chat", icon: MessageCircle, path: USER_TAB_PATHS.chat },
      { id: "settings" as TabType, name: "Pengaturan", icon: Settings, path: USER_TAB_PATHS.settings },
    ],
    [],
  );

  useEffect(() => {
    if (!token) {
      navigate("/user/auth");
      return;
    }

    loadHeaderCounts();
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => undefined);
    }
    const interval = setInterval(loadHeaderCounts, 15000);
    return () => clearInterval(interval);
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);
    const handleNewNotification = (notification: any) => {
      setNotifications((prev) => [{ ...notification, is_read: false }, ...prev].slice(0, 8));
      setUnreadNotifications((count) => count + 1);
      toast.info(notification.title || "Notifikasi baru");
    };
    const handleNewMessage = (message: any) => {
      if (message.receiver_id !== user?.id) return;
      setUnreadMessages((count) => count + 1);
      toast.info(message.sender?.name ? `Pesan baru dari ${message.sender.name}` : "Pesan baru");

      if (document.hidden && "Notification" in window && Notification.permission === "granted") {
        new Notification("Pesan baru GARASI.21", {
          body: message.message,
        });
      }
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("message:new", handleNewMessage);
    };
  }, [token, user?.id]);

  const loadHeaderCounts = async () => {
    if (!token) return;
    try {
      const [notificationData, unreadMessageData] = await Promise.all([
        notificationService.getNotifications(token),
        chatService.getUnreadCount(token),
      ]);
      setNotifications(notificationData.slice(0, 8));
      setUnreadNotifications(notificationData.filter((n: any) => !n.is_read).length || 0);
      setUnreadMessages(unreadMessageData.unread_count || 0);
    } catch (error) {
      console.error("Error loading header counts:", error);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    if (!token) return;
    const current = notifications.find((notification) => notification.id === id);
    try {
      await notificationService.markAsRead(id, token);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, is_read: true } : notification,
        ),
      );
      if (!current?.is_read) {
        setUnreadNotifications((count) => Math.max(0, count - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    // Navigasi sesuai tipe notifikasi
    if (notification.type === 'chat') {
      navigate('/user/dashboard/chat');
    } else if (notification.type === 'booking' || notification.type === 'transaction' || notification.title?.toLowerCase().includes('booking')) {
      navigate('/user/dashboard/bookings');
    } else if (notification.type === 'voucher' || notification.title?.toLowerCase().includes('voucher')) {
      navigate('/user/dashboard/vouchers');
    } else if (notification.title?.toLowerCase().includes('profil')) {
      navigate('/user/dashboard/settings');
    }

    setIsNotificationsOpen(false); // Tutup dropdown notifikasi

    // Tandai sebagai sudah dibaca jika belum
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!token || unreadNotifications === 0) return;
    try {
      await notificationService.markAllAsRead(token);
      setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
      setUnreadNotifications(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (user?.email) {
        localStorage.setItem("lastUserEmail", user.email);
      }
      logout();
      navigate("/user/auth");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <UserDashboardHome
            user={user}
            unreadMessages={unreadMessages}
            onNavigate={(path) => navigate(path)}
          />
        );
      case "bookings":
        return <UserBookings />;
      case "vouchers":
        return <UserVouchers />;
      case "settings":
        return <UserSettings />;
      default:
        return <UserDashboardHome user={user} unreadMessages={unreadMessages} />;
    }
  };

  const HeaderActions = () => (
    <>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg bg-muted hover:bg-[#ff7a00]/20 border border-border transition-all duration-300"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Moon className="w-5 h-5 text-[#ff7a00]" />
        ) : (
          <Sun className="w-5 h-5 text-[#ff7a00]" />
        )}
      </button>

      <div className="relative">
        <button
          onClick={() => setIsNotificationsOpen((open) => !open)}
          className="relative p-2 rounded-lg bg-muted hover:bg-[#ff7a00]/20 border border-border transition-all duration-300"
          aria-label="Notifikasi"
        >
          <Bell className="w-5 h-5 text-foreground" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center">
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          )}
        </button>

        {isNotificationsOpen && (
          <div className="absolute -right-2 top-12 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card shadow-2xl overflow-hidden ring-1 ring-black/5">
            <div className="p-3 border-b border-border bg-muted/30">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-foreground">Notifikasi</p>
                  <p className="text-[10px] text-muted-foreground">{unreadNotifications} baru</p>
                </div>
                <button
                  type="button"
                  onClick={markAllNotificationsAsRead}
                  disabled={unreadNotifications === 0}
                  className="text-[10px] font-bold text-[#ff7a00] disabled:text-muted-foreground"
                >
                  Baca semua
                </button>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-[11px] text-muted-foreground text-center">Tidak ada notifikasi</div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-3 text-left border-b border-border/60 hover:bg-muted transition-colors ${
                      notification.is_read ? "opacity-60" : "bg-[#ff7a00]/5"
                    }`}
                  >
                    <p className="font-bold text-[11px] text-foreground">{notification.title}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
                    <p className="text-[9px] text-muted-foreground/60 mt-1.5 flex justify-end">
                      {new Date(notification.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );

  if (activeTab === "chat") {
    return (
      <div className="h-[100dvh] w-full bg-background flex flex-col overflow-hidden">
        <UserChat onMessagesRead={loadHeaderCounts} standalone onBack={() => navigate('/user/dashboard')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Logo variant="full" size="sm" clickable onClick={() => navigate("/")} />
              <button 
                onClick={() => navigate("/")}
                className="hidden sm:flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors bg-muted/50 px-3 py-1.5 rounded-lg border border-border"
              >
                <Home size={14} /> Beranda
              </button>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <HeaderActions />

              <button
                type="button"
                onClick={() => navigate(USER_TAB_PATHS.settings)}
                className="flex items-center gap-3 px-3 py-1 bg-muted hover:bg-[#ff7a00]/10 rounded-lg border border-border transition-all"
                aria-label="Buka pengaturan akun"
              >
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground leading-tight">{user?.name}</p>
                  <p className="text-xs text-muted-foreground leading-tight capitalize">{user?.role}</p>
                </div>
                {user?.avatar_url ? (
                  <img src={getAvatarUrl(user.avatar_url)} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-[#ff7a00]" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#ff7a00] flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <HeaderActions />
              <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 border border-border transition-all"
                aria-label="Toggle menu"
              >
                {isMobileSidebarOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {isMobileSidebarOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-card border-b border-border px-4 sm:px-6 py-4 space-y-4"
          >
            <button
              type="button"
              onClick={() => {
                navigate(USER_TAB_PATHS.settings);
                setIsMobileSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 pb-4 border-b border-border text-left"
              aria-label="Buka pengaturan akun"
            >
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
              {user?.avatar_url ? (
                <img src={getAvatarUrl(user.avatar_url)} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-[#ff7a00]" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#ff7a00] flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            <button
              onClick={() => {
                setShowLogoutConfirm(true);
                setIsMobileSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-600/10 hover:bg-red-600/20 border border-red-600/50 transition-all text-red-600"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <div className="hidden sm:flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`relative flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                    activeTab === tab.id
                      ? "bg-[#ff7a00] text-white shadow-lg"
                      : "bg-card text-muted-foreground hover:bg-muted border border-border"
                  }`}
                >
                  <tab.icon size={20} />
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              ))}
            </div>

            <div className="sm:hidden -mx-4">
              <div 
                className="flex items-center gap-2 overflow-x-auto px-4 pb-4 no-scrollbar touch-pan-x" 
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => navigate(tab.path)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-[11px] whitespace-nowrap flex-shrink-0 border select-none ${
                      activeTab === tab.id
                        ? "bg-[#ff7a00] text-white shadow-[0_4px_12px_rgba(255,122,0,0.3)] border-[#ff7a00]"
                        : "bg-card text-muted-foreground hover:bg-muted border-border"
                    }`}
                  >
                    <tab.icon size={14} />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>

      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        isLoading={isLoggingOut}
      />
    </div>
  );
}
