import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
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
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import DashboardStats from "../../components/admin/DashboardStats";
import BookingManagement from "../../components/admin/BookingManagement";
import ServiceManagement from "../../components/admin/ServiceManagement";
import GalleryManagement from "../../components/admin/GalleryManagement";
import VoucherManagement from "../../components/admin/VoucherManagement";
import AdminChat from "../../components/admin/AdminChat";

type TabType = "dashboard" | "bookings" | "services" | "gallery" | "vouchers" | "chat" | "notifications";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      navigate("/admin");
    }
  }, [token, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  const tabs = [
    { id: "dashboard" as TabType, name: "Dashboard", icon: LayoutDashboard },
    { id: "bookings" as TabType, name: "Booking", icon: Calendar },
    { id: "services" as TabType, name: "Layanan", icon: Package },
    { id: "gallery" as TabType, name: "Galeri", icon: ImageIcon },
    { id: "vouchers" as TabType, name: "Voucher", icon: Ticket },
    { id: "chat" as TabType, name: "Chat", icon: MessageCircle },
    { id: "notifications" as TabType, name: "Notifikasi", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[#ff7a00] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <div>
                <h1 className="text-foreground font-bold text-lg leading-tight">ADMIN PANEL</h1>
                <p className="text-[#ff7a00] text-xs font-semibold">GARASI.21 MOTOWASH</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
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

              {/* User Profile */}
              <div className="flex items-center gap-3 px-3 py-1 bg-muted rounded-lg border border-border">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-foreground leading-tight">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground leading-tight capitalize">{user?.role || 'Admin'}</p>
                </div>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-[#ff7a00]" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#ff7a00] flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-[#ff7a00] text-white shadow-lg"
                    : "bg-card text-muted-foreground hover:bg-muted border border-border"
                }`}
              >
                <tab.icon size={20} />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "dashboard" && <DashboardStats />}
          {activeTab === "bookings" && <BookingManagement />}
          {activeTab === "services" && <ServiceManagement />}
          {activeTab === "gallery" && <GalleryManagement />}
          {activeTab === "vouchers" && <VoucherManagement />}
          {activeTab === "chat" && <AdminChat />}
          {activeTab === "notifications" && (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Bell className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground">Fitur notifikasi admin sedang dimigrasi ke sistem baru</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
