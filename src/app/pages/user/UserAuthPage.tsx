import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Mail, Lock, User, Phone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../../services/api";

export default function UserAuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const data = await authService.login({
          email: formData.email,
          password: formData.password,
        });

        login(data.token, data.user);
        toast.success("Login berhasil!");
        navigate("/user/dashboard");
      } else {
        // Signup
        await authService.register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
        });

        toast.success("Registrasi berhasil! Silakan login.");
        setIsLogin(true);
        setFormData({ email: formData.email, password: "", name: "", phone: "" });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff7a00]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff7a00]/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center justify-center space-x-2 mb-4"
          >
            <div className="w-12 h-12 bg-[#ff7a00] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">G</span>
            </div>
            <div>
              <h1 className="text-foreground font-bold text-xl leading-tight">GARASI.21</h1>
              <p className="text-[#ff7a00] text-sm font-semibold">MOTOWASH</p>
            </div>
          </motion.div>
          <h2 className="text-foreground text-2xl font-bold mb-2">
            {isLogin ? "Login" : "Daftar"}
          </h2>
          <p className="text-muted-foreground">
            {isLogin ? "Masuk ke akun Anda" : "Buat akun baru"}
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="bg-card border-2 border-border rounded-2xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                {/* Name */}
                <div>
                  <label className="block text-foreground font-semibold mb-3 flex items-center gap-2">
                    <User size={20} className="text-[#ff7a00]" />
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                    className="w-full bg-input-background border-2 border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:border-[#ff7a00] focus:outline-none transition-colors"
                    required={!isLogin}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-foreground font-semibold mb-3 flex items-center gap-2">
                    <Phone size={20} className="text-[#ff7a00]" />
                    No. WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full bg-input-background border-2 border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:border-[#ff7a00] focus:outline-none transition-colors"
                    required={!isLogin}
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-foreground font-semibold mb-3 flex items-center gap-2">
                <Mail size={20} className="text-[#ff7a00]" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full bg-input-background border-2 border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:border-[#ff7a00] focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-foreground font-semibold mb-3 flex items-center gap-2">
                <Lock size={20} className="text-[#ff7a00]" />
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-input-background border-2 border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:border-[#ff7a00] focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : isLogin ? "Login" : "Daftar"}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-muted-foreground hover:text-[#ff7a00] transition-colors"
            >
              {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
              <span className="font-semibold text-[#ff7a00]">
                {isLogin ? "Daftar" : "Login"}
              </span>
            </button>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              ← Kembali ke Beranda
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
