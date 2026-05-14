import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Ticket, Plus, Edit, Trash2, QrCode, 
  CheckCircle, RefreshCw, Calendar, 
  User, Bike, Clock, History, AlertCircle, ToggleLeft, ToggleRight, XCircle
} from "lucide-react";
import { toast } from "sonner";
import { voucherService, bookingCardService } from "../../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function VoucherManagement() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<"manage" | "validate">("manage");
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Validation State
  const [validateCode, setValidateCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [recentValidations, setRecentValidations] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    type: "percent" as "percent" | "nominal",
    value: 0,
    min_order: 0,
    quota: 0,
    valid_from: "",
    valid_until: "",
    is_active: true,
  });

  useEffect(() => {
    if (token) {
      loadVouchers();
    }
  }, [token]);

  const loadVouchers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await voucherService.getAdminVouchers(token);
      setVouchers(response.data || []);
    } catch (error) {
      console.error('Error loading vouchers:', error);
      toast.error("Gagal memuat voucher");
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "GRS";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (editingId) {
        await voucherService.updateVoucher(Number(editingId), formData, token);
        toast.success("Voucher berhasil diperbarui!");
      } else {
        await voucherService.createVoucher(formData, token);
        toast.success("Voucher berhasil dibuat!");
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadVouchers();
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan voucher");
    }
  };

  const handleEdit = (voucher: any) => {
    setFormData({
      code: voucher.code,
      title: voucher.title,
      description: voucher.description || "",
      type: voucher.type,
      value: Number(voucher.value),
      min_order: Number(voucher.min_order),
      quota: voucher.quota,
      valid_from: new Date(voucher.valid_from).toISOString().split('T')[0],
      valid_until: new Date(voucher.valid_until).toISOString().split('T')[0],
      is_active: Boolean(voucher.is_active),
    });
    setEditingId(voucher.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm("Yakin ingin menghapus voucher ini? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      await voucherService.deactivateVoucher(Number(id), token);
      toast.success("Voucher berhasil dihapus");
      loadVouchers();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus voucher");
    }
  };

  const handleToggleStatus = async (voucher: any) => {
    if (!token) return;
    try {
      await voucherService.updateVoucher(voucher.id, { ...voucher, is_active: !voucher.is_active }, token);
      toast.success(`Voucher ${!voucher.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
      loadVouchers();
    } catch (error: any) {
      toast.error("Gagal mengubah status");
    }
  };

  const handleValidate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateCode || !token) return;

    try {
      setIsValidating(true);
      setValidationResult(null);
      setValidationError(null);
      
      const response = await bookingCardService.getCardDetail(validateCode, token);
      if (response.success) {
        setValidationResult(response.data);
      } else {
        setValidationError(response.message);
      }
    } catch (error: any) {
      setValidationError(error.message || "Kode tidak ditemukan atau sudah digunakan");
    } finally {
      setIsValidating(false);
    }
  };

  const confirmValidation = async () => {
    if (!token || !validationResult) return;
    try {
      setIsValidating(true);
      const response = await bookingCardService.validateCard(validationResult.card_code, token);
      if (response.success) {
        toast.success("Booking berhasil divalidasi!");
        setRecentValidations(prev => [validationResult, ...prev].slice(0, 10));
        setValidationResult(null);
        setValidateCode("");
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal memvalidasi");
    } finally {
      setIsValidating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      title: "",
      description: "",
      type: "percent",
      value: 0,
      min_order: 0,
      quota: 0,
      valid_from: "",
      valid_until: "",
      is_active: true,
    });
  };

  const getVoucherStatus = (v: any) => {
    const now = new Date();
    if (!v.is_active) return { label: "Nonaktif", color: "bg-muted text-muted-foreground" };
    if (now > new Date(v.valid_until)) return { label: "Kedaluwarsa", color: "bg-red-500/20 text-red-500" };
    return { label: "Aktif", color: "bg-green-500/20 text-green-500" };
  };

  if (loading && vouchers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff7a00] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex w-full sm:w-auto p-1 bg-muted rounded-2xl border border-border">
          <button
            onClick={() => setActiveTab("manage")}
            className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "manage" ? "bg-[#ff7a00] text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Ticket size={16} />
            Kelola Voucher
          </button>
          <button
            onClick={() => setActiveTab("validate")}
            className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "validate" ? "bg-[#ff7a00] text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <QrCode size={16} />
            Validasi Booking
          </button>
        </div>

        {activeTab === "manage" && (
          <button
            onClick={() => {
              resetForm();
              setEditingId(null);
              setShowForm(true);
            }}
            className="inline-flex items-center justify-center gap-2 bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold transition-all shadow-lg shadow-[#ff7a00]/20"
          >
            <Plus size={18} />
            Tambah Voucher
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "manage" ? (
          <motion.div
            key="manage"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Kode</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Tipe</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Nilai</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Kuota</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {vouchers.map((v) => {
                    const status = getVoucherStatus(v);
                    return (
                      <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono font-bold text-[#ff7a00]">{v.code}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{v.title}</div>
                        </td>
                        <td className="px-6 py-4 capitalize text-sm">{v.type === 'percent' ? 'Persentase' : 'Nominal'}</td>
                        <td className="px-6 py-4 font-bold text-sm">
                          {v.type === 'percent' ? `${v.value}%` : `Rp ${Number(v.value).toLocaleString()}`}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {v.used_count || 0} / {v.quota}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleToggleStatus(v)}
                              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
                              title={v.is_active ? "Nonaktifkan" : "Aktifkan"}
                            >
                              {v.is_active ? <ToggleRight className="text-[#ff7a00]" /> : <ToggleLeft />}
                            </button>
                            <button
                              onClick={() => handleEdit(v)}
                              className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(v.id)}
                              className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="validate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid lg:grid-cols-3 gap-5 sm:gap-8"
          >
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Input Kode Booking</h3>
                <form onSubmit={handleValidate} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2.5 sm:gap-4 mb-6 sm:mb-8">
                  <div className="relative min-w-0">
                    <QrCode className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} />
                    <input
                      type="text"
                      value={validateCode}
                      onChange={(e) => setValidateCode(e.target.value.toUpperCase())}
                      placeholder="Masukkan Kode (Contoh: GRS-2025-XXXXXX)"
                      className="w-full min-w-0 bg-muted border border-border rounded-xl sm:rounded-2xl pl-9 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 font-mono font-bold text-sm sm:text-base text-foreground focus:border-[#ff7a00] outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isValidating || !validateCode}
                    className="bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold shadow-lg shadow-[#ff7a00]/20 disabled:opacity-50 transition-all inline-flex items-center justify-center gap-2"
                  >
                    {isValidating && <RefreshCw size={16} className="animate-spin" />}
                    Validasi
                  </button>
                </form>

                {validationError && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl"
                  >
                    <AlertCircle size={20} />
                    <p className="font-bold text-sm">{validationError}</p>
                  </motion.div>
                )}

                {validationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/5 border-2 border-green-500/30 rounded-3xl p-6"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="bg-green-500 text-white p-3 rounded-2xl">
                        <CheckCircle size={32} />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Kode Booking</p>
                        <h4 className="text-2xl font-black text-foreground font-mono">{validationResult.card_code}</h4>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 mb-8">
                      <div className="flex gap-4">
                        <div className="bg-muted p-3 rounded-xl h-fit">
                          <User size={20} className="text-[#ff7a00]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase">Pelanggan</p>
                          <p className="font-black text-foreground">{validationResult.name}</p>
                          <p className="text-xs text-muted-foreground">{validationResult.phone}</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="bg-muted p-3 rounded-xl h-fit">
                          <Bike size={20} className="text-[#ff7a00]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase">Layanan</p>
                          <p className="font-black text-foreground">{validationResult.service}</p>
                          <p className="text-xs text-muted-foreground">Motor {validationResult.bike_size}</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="bg-muted p-3 rounded-xl h-fit">
                          <Calendar size={20} className="text-[#ff7a00]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase">Jadwal</p>
                          <p className="font-black text-foreground">
                            {new Date(validationResult.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={12} />
                            {validationResult.time}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={confirmValidation}
                        disabled={isValidating}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-green-500/20"
                      >
                        Konfirmasi Selesai
                      </button>
                      <button
                        onClick={() => setValidationResult(null)}
                        className="bg-muted hover:bg-muted/80 text-foreground px-8 py-4 rounded-2xl font-bold transition-all"
                      >
                        Batal
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5 sm:mb-6">
                  <History size={18} className="text-[#ff7a00]" />
                  <h3 className="text-base sm:text-lg font-bold">Validasi Terbaru</h3>
                </div>
                {recentValidations.length === 0 ? (
                  <div className="py-8 sm:py-12 text-center">
                    <p className="text-muted-foreground text-sm italic">Belum ada validasi hari ini</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentValidations.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-muted/40 rounded-2xl border border-border/50">
                        <div className="bg-green-500/20 p-2 rounded-xl text-green-500">
                          <CheckCircle size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-foreground truncate">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{item.card_code}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="bg-gradient-to-r from-[#ff7a00] to-[#ff9500] p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">{editingId ? "Edit Voucher" : "Tambah Voucher Baru"}</h3>
                <button onClick={() => setShowForm(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                  <XCircle size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-foreground font-bold mb-2 text-sm uppercase tracking-wider">Judul Voucher</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Contoh: Diskon Lebaran"
                      className="w-full bg-muted border border-border rounded-2xl px-4 py-3 text-foreground outline-none focus:border-[#ff7a00] transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-foreground font-bold mb-2 text-sm uppercase tracking-wider">Kode Voucher</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="flex-1 bg-muted border border-border rounded-2xl px-4 py-3 text-foreground font-mono font-bold outline-none focus:border-[#ff7a00] transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={generateRandomCode}
                        className="bg-muted hover:bg-muted/80 text-foreground p-3 rounded-2xl border border-border transition-all"
                        title="Acak Kode"
                      >
                        <RefreshCw size={20} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-foreground font-bold mb-2 text-sm uppercase tracking-wider">Tipe Diskon</label>
                    <div className="flex gap-4 p-1 bg-muted rounded-2xl border border-border">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'percent' })}
                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                          formData.type === 'percent' ? 'bg-[#ff7a00] text-white' : 'text-muted-foreground'
                        }`}
                      >
                        PERSENTASE (%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'nominal' })}
                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                          formData.type === 'nominal' ? 'bg-[#ff7a00] text-white' : 'text-muted-foreground'
                        }`}
                      >
                        NOMINAL (RP)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-foreground font-bold mb-2 text-sm uppercase tracking-wider">Nilai Diskon</label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                      className="w-full bg-muted border border-border rounded-2xl px-4 py-3 text-foreground outline-none focus:border-[#ff7a00] transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-foreground font-bold mb-2 text-sm uppercase tracking-wider">Min. Transaksi</label>
                    <input
                      type="number"
                      value={formData.min_order}
                      onChange={(e) => setFormData({ ...formData, min_order: Number(e.target.value) })}
                      className="w-full bg-muted border border-border rounded-2xl px-4 py-3 text-foreground outline-none focus:border-[#ff7a00] transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-foreground font-bold mb-2 text-sm uppercase tracking-wider">Kuota</label>
                    <input
                      type="number"
                      value={formData.quota}
                      onChange={(e) => setFormData({ ...formData, quota: Number(e.target.value) })}
                      className="w-full bg-muted border border-border rounded-2xl px-4 py-3 text-foreground outline-none focus:border-[#ff7a00] transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-foreground font-bold mb-2 text-sm uppercase tracking-wider">Masa Berlaku</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={formData.valid_from}
                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                        className="w-full bg-muted border border-border rounded-2xl px-4 py-3 text-foreground text-xs outline-none focus:border-[#ff7a00]"
                        required
                      />
                      <span className="text-muted-foreground">-</span>
                      <input
                        type="date"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                        className="w-full bg-muted border border-border rounded-2xl px-4 py-3 text-foreground text-xs outline-none focus:border-[#ff7a00]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white py-4 rounded-2xl font-black shadow-lg shadow-[#ff7a00]/20"
                  >
                    {editingId ? "Update Voucher" : "Buat Voucher"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-8 bg-muted hover:bg-muted/80 text-foreground rounded-2xl font-bold transition-all"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
