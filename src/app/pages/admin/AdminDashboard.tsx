import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Calendar,
  Package,
  Image as ImageIcon,
  LogOut,
  Sun,
  Moon,
  Ticket,
  MessageCircle,
  Bell,
  Settings,
  Menu,
  X,
  Home,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { bookingService, chatService, getAvatarUrl } from "../../../services/api";
import { getSocket } from "../../../services/socket";
import DashboardStats from "../../components/admin/DashboardStats";
import BookingManagement from "../../components/admin/BookingManagement";
import ServiceManagement from "../../components/admin/ServiceManagement";
import GalleryManagement from "../../components/admin/GalleryManagement";
import VoucherManagement from "../../components/admin/VoucherManagement";
import AdminChat from "../../components/admin/AdminChat";
import AdminSettings from "../../components/admin/AdminSettings";
import Logo from "../../components/Logo";
import LogoutConfirmDialog from "../../components/user/LogoutConfirmDialog";

type TabType = "dashboard" | "bookings" | "services" | "gallery" | "vouchers" | "chat" | "settings";

const ADMIN_TAB_PATHS: Record<TabType, string> = {
  dashboard: "/admin/dashboard",
  bookings: "/admin/dashboard/bookings",
  services: "/admin/dashboard/services",
  gallery: "/admin/dashboard/gallery",
  vouchers: "/admin/dashboard/vouchers",
  chat: "/admin/dashboard/chat",
  settings: "/admin/dashboard/settings",
};

function getAdminTabFromPath(pathname: string): TabType {
  if (pathname.includes("/chat")) return "chat";
  if (pathname.includes("/bookings")) return "bookings";
  if (pathname.includes("/services")) return "services";
  if (pathname.includes("/gallery")) return "gallery";
  if (pathname.includes("/vouchers")) return "vouchers";
  if (pathname.includes("/settings")) return "settings";
  return "dashboard";
}

const getAdminNotificationStorageKey = (adminId?: string) =>
  `garasi21-admin-read-notifications-${adminId || "default"}`;

const getStoredReadAdminNotificationIds = (adminId?: string) => {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(getAdminNotificationStorageKey(adminId)) || "[]"));
  } catch {
    return new Set<string>();
  }
};

const storeReadAdminNotificationIds = (adminId: string | undefined, ids: Set<string>) => {
  localStorage.setItem(getAdminNotificationStorageKey(adminId), JSON.stringify(Array.from(ids).slice(-200)));
};

const getNotificationStamp = (item: any) => item.updated_at || item.created_at || item.last_message_at || "";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, token, logout } = useAuth();
  const activeTab = getAdminTabFromPath(location.pathname);
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [unreadAdminNotifications, setUnreadAdminNotifications] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      navigate("/admin");
    }
  }, [token, user, navigate]);

  useEffect(() => {
    if (!token || user?.role !== "admin") return;
    loadAdminNotifications();
    const interval = setInterval(loadAdminNotifications, 15000);
    return () => clearInterval(interval);
  }, [token, user?.role]);

  useEffect(() => {
    if (!token || user?.role !== "admin") return;
    const socket = getSocket(token);

    const handleBookingCreated = (booking: any) => {
      const itemId = `booking-${booking.id}-${getNotificationStamp(booking)}`;
      const item = {
        id: itemId,
        title: "Booking Baru",
        message: `${booking.name} membuat booking ${booking.service} pada ${booking.date} pukul ${booking.time}.`,
        created_at: booking.created_at || new Date(),
        type: "booking",
        unread: true,
        path: "/admin/dashboard/bookings",
      };
      setAdminNotifications((prev) => [item, ...prev].slice(0, 10));
      setUnreadAdminNotifications((count) => count + 1);
      toast.info(item.title);
    };

    const handleMessageNew = (message: any) => {
      if (message.receiver_id !== user?.id) return;
      const itemId = `chat-${message.sender_id}-${message.created_at || message.id}`;
      const item = {
        id: itemId,
        title: message.sender?.name ? `Chat dari ${message.sender.name}` : "Chat Baru",
        message: message.message,
        created_at: message.created_at || new Date(),
        type: "chat",
        unread: true,
        path: "/admin/chat",
      };
      setAdminNotifications((prev) => [item, ...prev].slice(0, 10));
      setUnreadAdminNotifications((count) => count + 1);
      toast.info(item.title);
    };

    socket.on("booking:created", handleBookingCreated);
    socket.on("message:new", handleMessageNew);
    socket.on("booking:updated", loadAdminNotifications);
    socket.on("message:sent", loadAdminNotifications);

    return () => {
      socket.off("booking:created", handleBookingCreated);
      socket.off("message:new", handleMessageNew);
      socket.off("booking:updated", loadAdminNotifications);
      socket.off("message:sent", loadAdminNotifications);
    };
  }, [token, user?.id, user?.role]);

  const loadAdminNotifications = async () => {
    if (!token) return;
    try {
      const [bookings, conversations] = await Promise.all([
        bookingService.getAllBookings(token),
        chatService.getConversations(token),
      ]);

      const readIds = getStoredReadAdminNotificationIds(user?.id);

      const bookingItems = bookings.slice(0, 8).map((booking: any) => {
        const id = `booking-${booking.id}-${getNotificationStamp(booking)}`;
        return {
          id,
          title: booking.status === "Menunggu" ? "Booking Menunggu" : `Booking ${booking.status}`,
          message: `${booking.name} - ${booking.service} - ${booking.date} ${booking.time}`,
          created_at: booking.updated_at || booking.created_at,
          type: "booking",
          unread: booking.status === "Menunggu" && !readIds.has(id),
          path: "/admin/dashboard/bookings",
        };
      });

      const chatItems = conversations.slice(0, 8).map((conversation: any) => {
        const id = `chat-${conversation.id}-${conversation.last_message_at || ""}`;
        return {
          id,
          title: conversation.unread_count > 0 ? `Chat Baru dari ${conversation.name}` : `Chat ${conversation.name}`,
          message: conversation.last_message || "Percakapan terbaru",
          created_at: conversation.last_message_at,
          type: "chat",
          unread: Number(conversation.unread_count || 0) > 0 && !readIds.has(id),
          path: "/admin/dashboard/chat",
        };
      });

      const items = [...bookingItems, ...chatItems]
        .filter((item) => item.created_at)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      setAdminNotifications(items);
      setUnreadAdminNotifications(items.filter((item) => item.unread).length);
    } catch (error) {
      console.error("Error loading admin notifications:", error);
    }
  };

  const markAdminNotificationAsRead = (id: string) => {
    const readIds = getStoredReadAdminNotificationIds(user?.id);
    readIds.add(id);
    storeReadAdminNotificationIds(user?.id, readIds);
    setAdminNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, unread: false } : notification,
      ),
    );
    setUnreadAdminNotifications((count) => Math.max(0, count - 1));
  };

  const markAllAdminNotificationsAsRead = () => {
    const readIds = getStoredReadAdminNotificationIds(user?.id);
    adminNotifications.forEach((notification) => readIds.add(notification.id));
    storeReadAdminNotificationIds(user?.id, readIds);
    setAdminNotifications((prev) => prev.map((notification) => ({ ...notification, unread: false })));
    setUnreadAdminNotifications(0);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Store avatar before logout
      if (user?.email) {
        localStorage.setItem('lastAdminEmail', user.email);
      }
      logout();
      navigate("/admin");
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const tabs = [
    { id: "dashboard" as TabType, name: "Dashboard", icon: LayoutDashboard },
    { id: "bookings" as TabType, name: "Booking", icon: Calendar },
    { id: "services" as TabType, name: "Layanan", icon: Package },
    { id: "gallery" as TabType, name: "Galeri", icon: ImageIcon },
    { id: "vouchers" as TabType, name: "Voucher", icon: Ticket },
    { id: "chat" as TabType, name: "Chat", icon: MessageCircle },
    { id: "settings" as TabType, name: "Pengaturan", icon: Settings },
  ];

  const AdminNotificationButton = () => (
    <div className="relative">
      <button
        onClick={() => setIsNotificationsOpen((open) => !open)}
        className="relative p-2 rounded-lg bg-muted hover:bg-[#ff7a00]/20 border border-border transition-all duration-300"
        aria-label="Notifikasi admin"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadAdminNotifications > 0 && (
          <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center">
            {unreadAdminNotifications > 9 ? "9+" : unreadAdminNotifications}
          </span>
        )}
      </button>

      {isNotificationsOpen && (
        <div className="absolute right-0 top-12 z-50 w-[340px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-foreground">Informasi Terbaru</p>
                <p className="text-xs text-muted-foreground">{unreadAdminNotifications} belum dibaca</p>
              </div>
              <button
                type="button"
                onClick={markAllAdminNotificationsAsRead}
                disabled={unreadAdminNotifications === 0}
                className="text-xs font-semibold text-[#ff7a00] disabled:text-muted-foreground disabled:cursor-not-allowed"
              >
                Tandai semua dibaca
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {adminNotifications.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">Belum ada informasi terbaru</div>
            ) : (
              adminNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    if (notification.unread) markAdminNotificationAsRead(notification.id);
                    navigate(notification.path);
                    setIsNotificationsOpen(false);
                  }}
                  className={`w-full p-4 text-left border-b border-border/60 hover:bg-muted transition-colors ${
                    notification.unread ? "bg-[#ff7a00]/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      {notification.type === "chat" ? (
                        <MessageCircle size={17} className="text-[#ff7a00]" />
                      ) : (
                        <Calendar size={17} className="text-[#ff7a00]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground">{notification.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{notification.message}</p>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        {new Date(notification.created_at).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (activeTab === "chat") {
    return (
      <div className="h-screen w-full bg-background flex flex-col">
        <AdminChat standalone onBack={() => navigate('/admin/dashboard')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Logo variant="full" clickable onClick={() => navigate("/")} />
              <button 
                onClick={() => navigate("/")}
                className="hidden sm:flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors bg-muted/50 px-3 py-1.5 rounded-lg border border-border"
              >
                <Home size={14} /> Beranda
              </button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Theme Toggle */}
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

              <AdminNotificationButton />

              {/* User Profile */}
              <div className="flex items-center gap-3 px-3 py-1 bg-muted rounded-lg border border-border">
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground leading-tight">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground leading-tight capitalize">{user?.role || 'Admin'}</p>
                </div>
                {user?.avatar_url ? (
                  <img src={getAvatarUrl(user.avatar_url)} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-[#ff7a00]" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#ff7a00] flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
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
              <AdminNotificationButton />
              <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 border border-border transition-all"
                aria-label="Toggle menu"
              >
                {isMobileSidebarOpen ? (
                  <X className="w-5 h-5 text-foreground" />
                ) : (
                  <Menu className="w-5 h-5 text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile User Info & Actions */}
      <AnimatePresence mode="wait">
        {isMobileSidebarOpen && (
          <motion.div
            key="admin-mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-card border-b border-border px-4 sm:px-6 py-4 space-y-4"
          >
            {/* User Profile Info */}
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">{user?.name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role || 'Admin'}</p>
              </div>
              {user?.avatar_url ? (
                <img src={getAvatarUrl(user.avatar_url)} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-[#ff7a00]" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#ff7a00] flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => {
                toggleTheme();
                setIsMobileSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 border border-border transition-all text-foreground"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-5 h-5 text-[#ff7a00]" />
                  <span>Mode Terang</span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5 text-[#ff7a00]" />
                  <span>Mode Gelap</span>
                </>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={() => {
                handleLogoutClick();
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

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Tabs - Responsive */}
          <div className="mb-6 sm:mb-8">
            {/* Desktop Tabs */}
            <div className="hidden sm:flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => navigate(ADMIN_TAB_PATHS[tab.id])}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
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

            {/* Mobile Tabs - Scrollable horizontal */}
            <div className="sm:hidden -mx-4 overflow-hidden">
              <div 
                className="flex items-center gap-2 overflow-x-auto px-4 pb-4 no-scrollbar" 
                style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      navigate(ADMIN_TAB_PATHS[tab.id]);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-[11px] whitespace-nowrap flex-shrink-0 border ${
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

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {activeTab === "dashboard" && <DashboardStats onNavigate={(path) => navigate(path)} />}
            {activeTab === "bookings" && <BookingManagement />}
            {activeTab === "services" && <ServiceManagement />}
            {activeTab === "gallery" && <GalleryManagement />}
            {activeTab === "vouchers" && <VoucherManagement />}
            {activeTab === "chat" && <AdminChat />}
            {activeTab === "settings" && <AdminSettings />}
          </motion.div>
        </div>
      </div>

      {/* Logout Confirm Dialog */}
      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
        isLoading={isLoggingOut}
      />
    </div>
  );
}
