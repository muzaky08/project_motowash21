import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";

interface Service {
  id: number;
  name: string;
  treatments: string[];
  prices: {
    M: string;
    L: string;
    XL: string;
  };
}

const defaultServices: Service[] = [
  {
    id: 1,
    name: "Regular Wash",
    treatments: ["Cuci Body Salju (Snow Wash)", "Cuci Kaki-Kaki", "Semir Ban"],
    prices: { M: "18.000", L: "20.000", XL: "25.000" },
  },
  {
    id: 2,
    name: "Wash and Wax",
    treatments: [
      "Cuci Body Salju",
      "Cuci Kaki-Kaki",
      "Semir Ban",
      "Wax Body Halus",
      "Dressing Body Kasar",
    ],
    prices: { M: "25.000", L: "30.000", XL: "35.000" },
  },
  {
    id: 3,
    name: "Premium Wash",
    treatments: [
      "Cuci Body Salju",
      "Cuci Kaki-Kaki",
      "Semir Ban",
      "Wax Body Halus",
      "Dressing Body Kasar",
      "Pembersih Kerak Mesin",
    ],
    prices: { M: "55.000", L: "65.000", XL: "75.000" },
  },
  {
    id: 4,
    name: "Wash and Polish",
    treatments: [
      "Cuci Body Salju",
      "Cuci Kaki-Kaki",
      "Semir Ban",
      "Poles Body 3 Step",
      "Step 1 Heavy Cut",
      "Step 2 Medium Cut Polish",
      "Step 3 Finish Plus",
    ],
    prices: { M: "185.000", L: "200.000", XL: "250.000" },
  },
  {
    id: 5,
    name: "Detailing",
    treatments: [
      "Cuci Luar Dalam Secara Detail",
      "Degreasing Mesin",
      "Cuci Kaki-Kaki",
      "Wax Body Halus",
      "Dressing Body Kasar",
      "Semir Ban",
    ],
    prices: { M: "285.000", L: "300.000", XL: "350.000" },
  },
];

export default function ServiceManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Service | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState<Partial<Service>>({
    name: "",
    treatments: [""],
    prices: { M: "", L: "", XL: "" },
  });

  useEffect(() => {
    const saved = localStorage.getItem("services");
    if (saved) {
      setServices(JSON.parse(saved));
    } else {
      setServices(defaultServices);
      localStorage.setItem("services", JSON.stringify(defaultServices));
    }
  }, []);

  const handleDelete = (id: number) => {
    if (confirm("Yakin ingin menghapus layanan ini?")) {
      const updated = services.filter((s) => s.id !== id);
      localStorage.setItem("services", JSON.stringify(updated));
      setServices(updated);
      toast.success("Layanan berhasil dihapus!");
    }
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setEditData({ ...service, treatments: [...service.treatments] });
  };

  const handleSaveEdit = () => {
    if (!editData) return;

    const updated = services.map((s) => (s.id === editingId ? editData : s));
    localStorage.setItem("services", JSON.stringify(updated));
    setServices(updated);
    setEditingId(null);
    setEditData(null);
    toast.success("Layanan berhasil diupdate!");
  };

  const handleAddService = () => {
    if (!newService.name || !newService.treatments?.[0]) {
      toast.error("Mohon lengkapi data layanan!");
      return;
    }

    const service: Service = {
      id: Date.now(),
      name: newService.name,
      treatments: newService.treatments.filter((t) => t) as string[],
      prices: newService.prices as { M: string; L: string; XL: string },
    };

    const updated = [...services, service];
    localStorage.setItem("services", JSON.stringify(updated));
    setServices(updated);
    setIsAdding(false);
    setNewService({ name: "", treatments: [""], prices: { M: "", L: "", XL: "" } });
    toast.success("Layanan baru berhasil ditambahkan!");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-foreground">Manajemen Layanan</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Plus size={20} />
          Tambah Layanan
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-xl p-6 hover:border-[#ff7a00] transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">{service.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 rounded-lg transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-muted-foreground text-xs font-semibold uppercase mb-2">Treatment:</p>
              <ul className="space-y-1">
                {service.treatments.map((treatment, idx) => (
                  <li key={idx} className="text-muted-foreground text-sm">
                    • {treatment}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-muted-foreground text-xs font-semibold uppercase mb-2">Harga:</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(service.prices).map(([size, price]) => (
                  <div key={size} className="text-center">
                    <p className="text-[#ff7a00] font-bold text-xs">{size}</p>
                    <p className="text-foreground text-sm">Rp {price}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingId && editData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold text-foreground mb-4">Edit Layanan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-foreground mb-2">Nama Layanan</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground focus:border-[#ff7a00] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-foreground mb-2">Treatments</label>
                {editData.treatments.map((treatment, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={treatment}
                    onChange={(e) => {
                      const newTreatments = [...editData.treatments];
                      newTreatments[idx] = e.target.value;
                      setEditData({ ...editData, treatments: newTreatments });
                    }}
                    className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground focus:border-[#ff7a00] focus:outline-none mb-2"
                  />
                ))}
              </div>
              <div>
                <label className="block text-foreground mb-2">Harga</label>
                <div className="grid grid-cols-3 gap-4">
                  {(["M", "L", "XL"] as const).map((size) => (
                    <div key={size}>
                      <label className="block text-muted-foreground text-sm mb-1">{size}</label>
                      <input
                        type="text"
                        value={editData.prices[size]}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            prices: { ...editData.prices, [size]: e.target.value },
                          })
                        }
                        className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-foreground focus:border-[#ff7a00] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Simpan
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditData(null);
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Batal
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold text-foreground mb-4">Tambah Layanan Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-foreground mb-2">Nama Layanan</label>
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground focus:border-[#ff7a00] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-foreground mb-2">Treatments (satu per baris)</label>
                <textarea
                  value={newService.treatments?.join("\n")}
                  onChange={(e) =>
                    setNewService({ ...newService, treatments: e.target.value.split("\n") })
                  }
                  rows={5}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground focus:border-[#ff7a00] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-foreground mb-2">Harga</label>
                <div className="grid grid-cols-3 gap-4">
                  {(["M", "L", "XL"] as const).map((size) => (
                    <div key={size}>
                      <label className="block text-muted-foreground text-sm mb-1">{size}</label>
                      <input
                        type="text"
                        value={newService.prices?.[size] || ""}
                        onChange={(e) =>
                          setNewService({
                            ...newService,
                            prices: { ...newService.prices, [size]: e.target.value } as {
                              M: string;
                              L: string;
                              XL: string;
                            },
                          })
                        }
                        className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-foreground focus:border-[#ff7a00] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddService}
                  className="flex-1 bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Tambah
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewService({ name: "", treatments: [""], prices: { M: "", L: "", XL: "" } });
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Batal
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
