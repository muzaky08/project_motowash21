import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { User, Mail, Phone, MapPin, Camera, Lock, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { userService } from "../../../services/api";

export default function UserSettings() {
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

    setUploadingAvatar(true);
    // Note: Integration with custom backend upload would require Multer/Form-data
    // For now, we'll simulate it by using a local preview URL or a placeholder
    const previewUrl = URL.createObjectURL(file);
    setProfile({ ...profile, avatar_url: previewUrl });
    toast.info("Fitur upload file ke server memerlukan konfigurasi Multer di backend.");
    setUploadingAvatar(false);
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

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-foreground">Pengaturan Akun</h2>

      {/* Profile Picture */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Foto Profil</h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#ff7a00] flex items-center justify-center">
                <User className="text-white" size={40} />
              </div>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
              </div>
            )}
          </div>
          <div>
            <label className="cursor-pointer bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors">
              <Camera size={18} />
              Upload Foto
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </label>
            <p className="text-muted-foreground text-sm mt-2">
              JPG, PNG maksimal 2MB
            </p>
          </div>
        </div>
      </motion.div>

      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Informasi Profil</h3>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-foreground font-semibold mb-2 flex items-center gap-2">
              <User size={16} className="text-[#ff7a00]" />
              Nama Lengkap
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground"
            />
          </div>

          <div>
            <label className="block text-foreground font-semibold mb-2 flex items-center gap-2">
              <Mail size={16} className="text-[#ff7a00]" />
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">Email tidak dapat diubah</p>
          </div>

          <div>
            <label className="block text-foreground font-semibold mb-2 flex items-center gap-2">
              <Phone size={16} className="text-[#ff7a00]" />
              No. WhatsApp
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground"
            />
          </div>

          <div>
            <label className="block text-foreground font-semibold mb-2 flex items-center gap-2">
              <MapPin size={16} className="text-[#ff7a00]" />
              Lokasi
            </label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="Contoh: Kota Serang, Banten"
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
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
        className="bg-card border border-border rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Ubah Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-foreground font-semibold mb-2 flex items-center gap-2">
              <Lock size={16} className="text-[#ff7a00]" />
              Password Baru
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="Minimal 6 karakter"
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground"
            />
          </div>

          <div>
            <label className="block text-foreground font-semibold mb-2 flex items-center gap-2">
              <Lock size={16} className="text-[#ff7a00]" />
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="Ketik ulang password baru"
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Ubah Password
          </button>
        </form>
      </motion.div>
    </div>
  );
}
