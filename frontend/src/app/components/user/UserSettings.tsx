import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { User, Mail, Phone, MapPin, Camera, Lock, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { userService, getAvatarUrl } from "../../../services/api";

export default function UserSettings({ hideTitle = false }: { hideTitle?: boolean }) {
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    avatar_url: user?.avatar_url || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        avatar_url: user.avatar_url || "",
      });
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran file (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB!");
      e.target.value = "";
      return;
    }

    if (!token) {
      toast.error("Sesi tidak valid, silakan login kembali.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const result = await userService.uploadAvatar(file, token);
      // Simpan URL relatif dari server ke state dan AuthContext
      setProfile((prev) => ({ ...prev, avatar_url: result.avatar_url }));
      updateUser({ avatar_url: result.avatar_url });
      toast.success("Foto profil berhasil diperbarui!");
    } catch (error: any) {
      toast.error(error.message || "Gagal mengupload foto profil.");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!token) return;

    try {
      await userService.updateProfile(profile, token);
      updateUser(profile);
      toast.success("Profil berhasil diperbarui!");
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Password baru tidak cocok!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password minimal 6 karakter!");
      return;
    }

    toast.info("Fitur ubah password dapat diimplementasikan di route /auth/update-password");
  };

  // Tampilkan avatar: konversi path relatif ke URL penuh
  const displayAvatar = getAvatarUrl(profile.avatar_url);

  return (
    <div className="space-y-6 max-w-3xl">
      {!hideTitle && <h2 className="text-xl sm:text-2xl font-bold text-foreground">Pengaturan Akun</h2>}

      {/* Profile Picture */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-4 sm:p-6"
      >
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Foto Profil</h3>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <div className="relative">
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt="Avatar"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#ff7a00]"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#ff7a00] flex items-center justify-center">
                <User className="text-white" size={32} />
              </div>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
              </div>
            )}
          </div>
          <div className="text-center sm:text-left">
            <label className={`cursor-pointer bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors text-sm sm:text-base ${uploadingAvatar ? 'opacity-60 cursor-not-allowed' : ''}`}>
              <Camera size={18} />
              {uploadingAvatar ? "Mengupload..." : "Upload Foto"}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </label>
            <p className="text-muted-foreground text-sm mt-2">
              JPG, PNG, WebP — maksimal 2MB
            </p>
          </div>
        </div>
      </motion.div>

      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-4 sm:p-6"
      >
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Informasi Profil</h3>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-foreground font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
              <User size={16} className="text-[#ff7a00]" />
              Nama Lengkap
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-foreground font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
              <Mail size={16} className="text-[#ff7a00]" />
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-muted-foreground cursor-not-allowed text-sm sm:text-base"
            />
            <p className="text-xs text-muted-foreground mt-1">Email tidak dapat diubah</p>
          </div>

          <div>
            <label className="block text-foreground font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
              <Phone size={16} className="text-[#ff7a00]" />
              No. WhatsApp
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-foreground font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
              <MapPin size={16} className="text-[#ff7a00]" />
              Lokasi
            </label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="Contoh: Kota Serang, Banten"
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground text-sm sm:text-base"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
          >
            <Save size={18} />
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl p-4 sm:p-6"
      >
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Ubah Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-foreground font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
              <Lock size={16} className="text-[#ff7a00]" />
              Password Baru
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="Minimal 6 karakter"
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-foreground font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
              <Lock size={16} className="text-[#ff7a00]" />
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="Ketik ulang password baru"
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground text-sm sm:text-base"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-6 py-3 rounded-lg font-semibold text-sm sm:text-base"
          >
            Ubah Password
          </button>
        </form>
      </motion.div>
    </div>
  );
}
