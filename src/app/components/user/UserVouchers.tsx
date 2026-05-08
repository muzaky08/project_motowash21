import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Ticket, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { voucherService } from "../../../services/api";

export default function UserVouchers() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      const data = await voucherService.getActiveVouchers();
      setVouchers(data || []);
    } catch (error) {
      console.error('Error loading vouchers:', error);
      toast.error("Gagal memuat voucher");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Kode voucher disalin!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDiscount = (voucher: any) => {
    if (voucher.discount_type === "percentage") {
      return `${voucher.discount_value}%`;
    }
    return `Rp ${Number(voucher.discount_value).toLocaleString()}`;
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
      <h2 className="text-2xl font-bold text-foreground">Voucher & Promo</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {vouchers.length === 0 ? (
          <div className="col-span-2 bg-card border border-border rounded-xl p-12 text-center">
            <Ticket className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground">Belum ada voucher tersedia</p>
          </div>
        ) : (
          vouchers.map((voucher) => (
            <motion.div
              key={voucher.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-[#ff7a00] to-[#ff9500] rounded-xl p-6 text-white shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{voucher.title}</h3>
                  <p className="text-white/80 text-sm">{voucher.description}</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <Ticket size={24} />
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <p className="text-xs text-white/70 mb-1">KODE VOUCHER</p>
                <div className="flex items-center justify-between">
                  <code className="text-2xl font-bold tracking-wider">{voucher.code}</code>
                  <button
                    onClick={() => copyCode(voucher.code, voucher.id)}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                  >
                    {copiedId === voucher.id ? (
                      <Check size={20} />
                    ) : (
                      <Copy size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-white/70">Diskon</p>
                  <p className="font-bold text-lg">{formatDiscount(voucher)}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/70">Berlaku sampai</p>
                  <p className="font-semibold">
                    {new Date(voucher.valid_until).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>

              {voucher.max_usage > 0 && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">Tersisa</span>
                    <span className="font-semibold">
                      {voucher.max_usage - voucher.current_usage} dari {voucher.max_usage}
                    </span>
                  </div>
                  <div className="mt-2 bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all"
                      style={{
                        width: `${((voucher.max_usage - voucher.current_usage) / voucher.max_usage) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
