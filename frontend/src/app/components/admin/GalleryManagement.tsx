import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, Trash2, Upload, Pencil } from "lucide-react";
import { toast } from "sonner";
import { galleryService } from "../../../services/api";
import { useAuth } from "../../contexts/AuthContext";

interface GalleryItem {
  id: number;
  url: string;
  title: string;
  created_at: string;
}

export default function GalleryManagement() {
  const { token } = useAuth();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newImage, setNewImage] = useState({ url: "", title: "" });

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      setIsLoading(true);
      const data = await galleryService.getGallery();
      setGallery(data);
    } catch (error) {
      console.error("Error loading gallery:", error);
      toast.error("Gagal memuat galeri");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin ingin menghapus foto ini?")) {
      try {
        await galleryService.deleteGallery(id, token!);
        setGallery(gallery.filter((item) => item.id !== id));
        toast.success("Foto berhasil dihapus!");
      } catch (error: any) {
        toast.error(error.message || "Gagal menghapus foto");
      }
    }
  };

  const handleStartEdit = (item: GalleryItem) => {
    setNewImage({ url: item.url, title: item.title });
    setEditingId(item.id);
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleSubmit = async () => {
    if (!newImage.url || !newImage.title) {
      toast.error("Mohon lengkapi URL dan judul foto!");
      return;
    }

    try {
      if (isEditing && editingId) {
        const updatedItem = await galleryService.updateGallery(editingId, newImage, token!);
        setGallery(gallery.map(item => item.id === editingId ? { ...item, ...newImage } : item));
        toast.success("Foto berhasil diperbarui!");
      } else {
        const addedItem = await galleryService.addGallery(newImage, token!);
        setGallery([addedItem, ...gallery]);
        toast.success("Foto berhasil ditambahkan!");
      }
      
      setIsAdding(false);
      setIsEditing(false);
      setEditingId(null);
      setNewImage({ url: "", title: "" });
    } catch (error: any) {
      toast.error(error.message || "Gagal memproses foto");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-foreground">Manajemen Galeri</h2>
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
            className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-[#ff7a00] transition-all"
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
                <h3 className="text-white font-bold mb-3 text-sm line-clamp-1">{item.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartEdit(item)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Trash2 size={14} />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {gallery.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Upload className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">Belum ada foto di galeri</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl p-6 max-w-md w-full my-auto"
          >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-foreground">
                  {isEditing ? "Edit Foto" : "Upload Foto Baru"}
                </h3>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setIsEditing(false);
                    setEditingId(null);
                    setNewImage({ url: "", title: "" });
                  }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-foreground mb-2 text-sm font-medium">Judul Foto</label>
                <input
                  type="text"
                  value={newImage.title}
                  onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                  placeholder="Contoh: Sport Bike Detailing"
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-[#ff7a00] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-foreground mb-2 text-sm font-medium">URL Gambar</label>
                <input
                  type="url"
                  value={newImage.url}
                  onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-[#ff7a00] focus:outline-none transition-colors"
                />
                <p className="text-muted-foreground text-xs mt-2">
                  Masukkan URL lengkap gambar dari internet
                </p>
              </div>

              {/* Preview */}
              {newImage.url && (
                <div>
                  <label className="block text-foreground mb-2 text-sm font-medium">Preview</label>
                  <div className="aspect-video rounded-lg overflow-hidden border border-border bg-black/20">
                    <img
                      src={newImage.url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400x225?text=Invalid+URL";
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  {isEditing ? <Pencil size={18} /> : <Upload size={18} />}
                  {isEditing ? "Simpan Perubahan" : "Upload"}
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewImage({ url: "", title: "" });
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors font-semibold"
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
