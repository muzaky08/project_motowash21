import { useState } from "react";
import { motion } from "motion/react";
import { Calendar, Clock, User, Phone, Bike, Package } from "lucide-react";
import { useInView } from "../hooks/useInView";
import { toast } from "sonner";

const services = [
  "Regular Wash",
  "Wash and Wax",
  "Premium Wash",
  "Wash and Polish",
  "Detailing",
];

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
];

export default function BookingSection() {
  const [ref, isInView] = useInView({ threshold: 0.2 });
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bikeSize: "",
    service: "",
    date: "",
    time: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.bikeSize || !formData.service || !formData.date || !formData.time) {
      toast.error("Mohon lengkapi semua data!");
      return;
    }

    // Save to localStorage
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    const newBooking = {
      id: Date.now(),
      ...formData,
      status: "Menunggu",
      createdAt: new Date().toISOString(),
    };
    bookings.push(newBooking);
    localStorage.setItem("bookings", JSON.stringify(bookings));

    toast.success("Booking berhasil! Kami akan segera menghubungi Anda.");
    
    // Reset form
    setFormData({
      name: "",
      phone: "",
      bikeSize: "",
      service: "",
      date: "",
      time: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="booking" className="py-20 sm:py-32 bg-gray-100 dark:bg-[#1a1a1a] relative overflow-hidden transition-colors duration-300">
      {/* Decorative Background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ff7a00]/10 dark:bg-[#ff7a00]/10 rounded-full blur-3xl" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-[#ff7a00] font-semibold text-sm sm:text-base mb-4 tracking-wider uppercase">
            Booking Online
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Reservasi <span className="text-[#ff7a00]">Sekarang</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Isi formulir di bawah untuk booking jadwal cuci motor Anda
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="bg-white dark:bg-[#111111] border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-8 sm:p-10"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                  <User size={20} className="text-[#ff7a00]" />
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  className="w-full bg-gray-50 dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#ff7a00] focus:outline-none transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                  <Phone size={20} className="text-[#ff7a00]" />
                  No WhatsApp
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  className="w-full bg-gray-50 dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#ff7a00] focus:outline-none transition-colors"
                />
              </div>

              {/* Bike Size */}
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                  <Bike size={20} className="text-[#ff7a00]" />
                  Jenis Motor
                </label>
                <select
                  name="bikeSize"
                  value={formData.bikeSize}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:border-[#ff7a00] focus:outline-none transition-colors"
                >
                  <option value="">Pilih ukuran motor</option>
                  <option value="M">M - Matic, Bebek</option>
                  <option value="L">L - Sport 150-250cc</option>
                  <option value="XL">XL - Sport {">"}250cc, Moge</option>
                </select>
              </div>

              {/* Service */}
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                  <Package size={20} className="text-[#ff7a00]" />
                  Pilih Layanan
                </label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:border-[#ff7a00] focus:outline-none transition-colors"
                >
                  <option value="">Pilih layanan</option>
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                  <Calendar size={20} className="text-[#ff7a00]" />
                  Tanggal
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-gray-50 dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:border-[#ff7a00] focus:outline-none transition-colors"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                  <Clock size={20} className="text-[#ff7a00]" />
                  Jam
                </label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:border-[#ff7a00] focus:outline-none transition-colors"
                >
                  <option value="">Pilih jam</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time} WIB
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#ff7a00]/50 mt-8"
              >
                Booking Sekarang
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
