import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

interface GalleryItem {
  id: number;
  url: string;
  title: string;
  createdAt: string;
}

export default function GalleryManagement() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newImage, setNewImage] = useState({ url: "", title: "" });

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = () => {
    const saved = localStorage.getItem("gallery");
    if (saved) {
      setGallery(JSON.parse(saved));
    } else {
      // Default gallery images
      const defaultGallery: GalleryItem[] = [
        {
          id: 1,
          url: "https://images.unsplash.com/photo-1763142185961-5a47a399e7a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydCUyMG1vdG9yY3ljbGUlMjBzaGluZXxlbnwxfHx8fDE3Nzc2MTc2MTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
          title: "Sport Bike Polish",
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          url: "https://images.unsplash.com/photo-1636761358756-ef34b4ef036a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwcG9saXNoJTIwZGV0YWlsfGVufDF8fHx8MTc3NzYxNzYxNnww&ixlib=rb-4.1.0&q=80&w=1080",
          title: "Detail Cleaning",
          createdAt: new Date().toISOString(),
        },
      ];
      setGallery(defaultGallery);
      localStorage.setItem("gallery", JSON.stringify(defaultGallery));
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Yakin ingin menghapus foto ini?")) {
      const updated = gallery.filter((item) => item.id !== id);
      localStorage.setItem("gallery", JSON.stringify(updated));
      setGallery(updated);
      toast.success("Foto berhasil dihapus!");
    }
  };

  const handleAdd = () => {
    if (!newImage.url || !newImage.title) {
      toast.error("Mohon lengkapi URL dan judul foto!");
      return;
    }

    const item: GalleryItem = {
      id: Date.now(),
      url: newImage.url,
      title: newImage.title,
      createdAt: new Date().toISOString(),
    };

    const updated = [...gallery, item];
    localStorage.setItem("gallery", JSON.stringify(updated));
    setGallery(updated);
    setIsAdding(false);
    setNewImage({ url: "", title: "" });
    toast.success("Foto berhasil ditambahkan!");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">Manajemen Galeri</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Plus size={20} />
          Upload Foto
        </button>
      </div>

      {/* Info */}
      <div className="mb-6 bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
        <p className="text-blue-400 text-sm">
          <strong>Catatan:</strong> Masukkan URL gambar (misalnya dari Unsplash atau hosting lainnya).
          Untuk demo, Anda dapat menggunakan URL Unsplash.
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {gallery.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-[#1a1a1a] border-2 border-gray-800 rounded-xl overflow-hidden hover:border-[#ff7a00] transition-all"
          >
            {/* Image */}
            <div className="aspect-square">
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/400x400?text=Image+Not+Found";
                }}
              />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold mb-2">{item.title}</h3>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <Trash2 size={16} />
                  Hapus
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {gallery.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Upload className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-500">Belum ada foto di galeri</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] border-2 border-gray-800 rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Upload Foto Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Judul Foto</label>
                <input
                  type="text"
                  value={newImage.title}
                  onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                  placeholder="Contoh: Sport Bike Detailing"
                  className="w-full bg-[#111111] border-2 border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#ff7a00] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-white mb-2">URL Gambar</label>
                <input
                  type="url"
                  value={newImage.url}
                  onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#111111] border-2 border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#ff7a00] focus:outline-none transition-colors"
                />
                <p className="text-gray-500 text-xs mt-2">
                  Masukkan URL lengkap gambar dari internet
                </p>
              </div>

              {/* Preview */}
              {newImage.url && (
                <div>
                  <label className="block text-white mb-2">Preview</label>
                  <div className="aspect-square rounded-lg overflow-hidden border border-gray-800">
                    <img
                      src={newImage.url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400x400?text=Invalid+URL";
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Upload size={18} />
                  Upload
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewImage({ url: "", title: "" });
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors"
                >
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
