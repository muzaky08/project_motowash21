import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, Edit, Trash2, Ticket } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { voucherService } from "../../../services/api";

export default function VoucherManagement() {
  const { token } = useAuth();
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: 0,
    valid_from: "",
    valid_until: "",
    max_usage: 0,
    current_usage: 0,
    active: true,
  });

  useEffect(() => {
    loadVouchers();
  }, [token]);

  const loadVouchers = async () => {
    try {
      // For admin, we might want a separate route to see inactive ones
      // But for now using the same service
      const data = await voucherService.getActiveVouchers();
      setVouchers(data || []);
    } catch (error) {
      console.error('Error loading vouchers:', error);
      toast.error("Gagal memuat voucher");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    try {
      await voucherService.createVoucher(formData, token);
      toast.success(editingId ? "Voucher berhasil diperbarui!" : "Voucher berhasil dibuat!");
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
      description: voucher.description,
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      valid_from: voucher.valid_from.split('T')[0],
      valid_until: voucher.valid_until.split('T')[0],
      max_usage: voucher.max_usage,
      current_usage: voucher.current_usage,
      active: voucher.active,
    });
    setEditingId(voucher.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus voucher ini?")) return;
    toast.info("Fitur hapus voucher belum dihubungkan ke API admin.");
  };

  const resetForm = () => {
    setFormData({
      code: "",
      title: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      valid_from: "",
      valid_until: "",
      max_usage: 0,
      current_usage: 0,
      active: true,
    });
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
        <h2 className="text-2xl font-bold text-foreground">Manajemen Voucher</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            resetForm();
          }}
          className="flex items-center gap-2 bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Tambah Voucher
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">
            {editingId ? "Edit Voucher" : "Tambah Voucher Baru"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-foreground font-semibold mb-2">Kode Voucher</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="PROMO2026"
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground uppercase"
                  required
                />
              </div>
              <div>
                <label className="block text-foreground font-semibold mb-2">Judul</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Diskon Spesial"
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-foreground font-semibold mb-2">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi voucher..."
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block text-foreground font-semibold mb-2">Tipe Diskon</label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as "percentage" | "fixed" })}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground"
                >
                  <option value="percentage">Persentase (%)</option>
                  <option value="fixed">Nominal (Rp)</option>
                </select>
              </div>
              <div>
                <label className="block text-foreground font-semibold mb-2">
                  Nilai Diskon {formData.discount_type === "percentage" ? "(%)" : "(Rp)"}
                </label>
                <input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-foreground font-semibold mb-2">Berlaku Dari</label>
                <input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-foreground font-semibold mb-2">Berlaku Sampai</label>
                <input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-foreground font-semibold mb-2">Maksimal Penggunaan</label>
                <input
                  type="number"
                  value={formData.max_usage}
                  onChange={(e) => setFormData({ ...formData, max_usage: Number(e.target.value) })}
                  placeholder="100"
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground"
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-foreground font-semibold">Voucher Aktif</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-6 py-3 rounded-lg font-semibold"
              >
                {editingId ? "Update Voucher" : "Simpan Voucher"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="px-6 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80"
              >
                Batal
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {vouchers.length === 0 ? (
          <div className="col-span-2 bg-card border border-border rounded-xl p-12 text-center">
            <Ticket className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground">Belum ada voucher</p>
          </div>
        ) : (
          vouchers.map((voucher) => (
            <motion.div
              key={voucher.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-card border rounded-xl p-6 ${
                voucher.active ? "border-[#ff7a00]" : "border-border opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{voucher.title}</h3>
                  <code className="text-[#ff7a00] font-bold">{voucher.code}</code>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(voucher)}
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(voucher.id)}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-4">{voucher.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Diskon</p>
                  <p className="font-bold text-foreground">
                    {voucher.discount_type === "percentage"
                      ? `${voucher.discount_value}%`
                      : `Rp ${Number(voucher.discount_value).toLocaleString()}`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Terpakai</p>
                  <p className="font-bold text-foreground">
                    {voucher.current_usage} / {voucher.max_usage}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Valid sampai</p>
                  <p className="font-semibold text-foreground">
                    {new Date(voucher.valid_until).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
              {!voucher.active && (
                <div className="mt-4 pt-4 border-t border-border">
                  <span className="text-red-500 text-sm font-semibold">TIDAK AKTIF</span>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
