import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Lock, User } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../../services/api";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "", // Map to email for the API
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Assuming admin login uses email format for backend
      // Map 'admin' username to 'admin@garasi21.com' for demo if needed
      const email = credentials.username.includes('@') 
        ? credentials.username 
        : `${credentials.username}@garasi21.com`;

      const data = await authService.login({
        email,
        password: credentials.password,
      });

      if (data.user.role !== 'admin') {
        toast.error("Hanya admin yang dapat masuk!");
        return;
      }

      login(data.token, data.user);
      toast.success("Login berhasil!");
      navigate("/admin/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Username atau password salah!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff7a00]/10 dark:bg-[#ff7a00]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff7a00]/10 dark:bg-[#ff7a00]/10 rounded-full blur-3xl" />
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
          <h2 className="text-foreground text-2xl font-bold mb-2">Admin Login</h2>
          <p className="text-muted-foreground">Masuk ke dashboard admin</p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="bg-card border-2 border-border rounded-2xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-foreground font-semibold mb-3 flex items-center gap-2">
                <User size={20} className="text-[#ff7a00]" />
                Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                placeholder="admin"
                className="w-full bg-[#111111] border-2 border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#ff7a00] focus:outline-none transition-colors"
                autoComplete="username"
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
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                placeholder="••••••••"
                className="w-full bg-[#111111] border-2 border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#ff7a00] focus:outline-none transition-colors"
                autoComplete="current-password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#ff7a00]/50"
            >
              Login
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-[#111111] border border-gray-800 rounded-lg">
            <p className="text-gray-400 text-xs mb-2">Demo Credentials:</p>
            <p className="text-gray-500 text-xs">Username: admin</p>
            <p className="text-gray-500 text-xs">Password: admin123</p>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center mt-6"
        >
          <a
            href="/"
            className="text-gray-400 hover:text-[#ff7a00] text-sm transition-colors"
          >
            ← Kembali ke Beranda
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
