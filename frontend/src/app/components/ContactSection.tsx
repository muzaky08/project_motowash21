import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Clock,
  Copy,
  ExternalLink,
  Instagram,
  MapPin,
  Maximize2,
  MessageCircle,
  Minus,
  Music2,
  Navigation,
  Plus,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { useInView } from "../hooks/useInView";

const LOCATION_NAME = "GARASI.21 MOTOWASH";
const LOCATION_ADDRESS = "Kota Serang, Banten";
const MAPS_LINK = "https://maps.app.goo.gl/THMMayGHMDBc9JfW8";
const GOOGLE_MAPS_SEARCH =
  "https://www.google.com/maps/search/?api=1&query=GARASI.21%20MOTOWASH%2C%20Kota%20Serang%2C%20Banten";
const MAP_QUERY = "GARASI.21%20MOTOWASH%2C%20Kota%20Serang%2C%20Banten";
const WHATSAPP_LINK = "https://wa.me/6281990945953?text=Halo%20Garasi.21%20Motowash";

function getWibOperationalStatus() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const currentMinutes = hour * 60 + minute;
  const isOpen = currentMinutes >= 8 * 60 && currentMinutes < 18 * 60;

  return {
    isOpen,
    label: isOpen ? "Buka sekarang" : "Tutup sekarang",
  };
}

export default function ContactSection() {
  const [ref, isInView] = useInView({ threshold: 0.16 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapZoom, setMapZoom] = useState(16);
  const [operationalStatus, setOperationalStatus] = useState(getWibOperationalStatus);

  const mapEmbedUrl = useMemo(
    () => `https://www.google.com/maps?q=${MAP_QUERY}&z=${mapZoom}&output=embed`,
    [mapZoom],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setOperationalStatus(getWibOperationalStatus());
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  const openExternal = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyLocation = async () => {
    const text = `${LOCATION_NAME}, ${LOCATION_ADDRESS}\n${MAPS_LINK}`;

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Lokasi berhasil disalin.");
    } catch {
      toast.error("Gagal menyalin lokasi.");
    }
  };

  const shareLocation = async () => {
    const shareData = {
      title: LOCATION_NAME,
      text: `${LOCATION_NAME} - ${LOCATION_ADDRESS}`,
      url: MAPS_LINK,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if ((error as DOMException).name === "AbortError") return;
      }
    }

    await copyLocation();
    toast.info("Link lokasi disalin sebagai fallback share.");
  };

  const toggleFullscreen = async () => {
    if (!mapContainerRef.current) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await mapContainerRef.current.requestFullscreen();
      }
    } catch {
      toast.error("Mode layar penuh tidak tersedia.");
    }
  };

  const cardMotion = (delay: number) => ({
    initial: { opacity: 0, y: 28 },
    animate: isInView ? { opacity: 1, y: 0 } : {},
    transition: { delay, duration: 0.55 },
  });

  const contactCardClass =
    "group w-full min-h-24 rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:border-[var(--accent-orange)] hover:shadow-[0_18px_45px_rgba(249,115,22,0.18)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-orange)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]";

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[var(--bg-primary)] py-20 text-[var(--text-primary)] transition-colors duration-300 sm:py-32"
    >
      <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--accent-orange)]/10 blur-3xl lg:left-1/4 lg:h-96 lg:w-96" />

      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-12 max-w-2xl text-center sm:mb-16"
        >
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-[var(--accent-orange)] sm:text-base">
            Hubungi Kami
          </span>
          <h2 className="mb-4 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
            Tetap <span className="text-[var(--accent-orange)]">Terhubung</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base text-[var(--text-secondary)] sm:text-lg">
            Ikuti media sosial kami, chat via WhatsApp, atau langsung datang ke lokasi GARASI.21 MOTOWASH.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2 lg:gap-12">
          <motion.div {...cardMotion(0.15)}>
            <h3 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">Media Sosial</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              <button
                type="button"
                onClick={() => openExternal("https://instagram.com/garasi.21motowash")}
                className={contactCardClass}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-[var(--accent-orange)] transition-transform duration-300 group-hover:scale-110">
                    <Instagram className="text-white" size={28} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-orange)]">
                      Instagram
                    </p>
                    <p className="break-words text-sm text-[var(--text-secondary)]">@garasi.21motowash</p>
                  </div>
                  <ExternalLink className="h-5 w-5 shrink-0 text-[var(--text-secondary)] group-hover:text-[var(--accent-orange)]" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => openExternal("https://tiktok.com/@garasi.21motowash")}
                className={contactCardClass}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--text-primary)] transition-transform duration-300 group-hover:scale-110">
                    <Music2 className="text-[var(--bg-card)]" size={28} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-orange)]">
                      TikTok
                    </p>
                    <p className="break-words text-sm text-[var(--text-secondary)]">@garasi.21motowash</p>
                  </div>
                  <ExternalLink className="h-5 w-5 shrink-0 text-[var(--text-secondary)] group-hover:text-[var(--accent-orange)]" />
                </div>
              </button>
            </div>
          </motion.div>

          <motion.div {...cardMotion(0.28)}>
            <h3 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">Kontak Langsung</h3>

            <button
              type="button"
              onClick={() => openExternal(WHATSAPP_LINK)}
              className="group mb-4 flex min-h-32 w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-700 to-emerald-500 p-8 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-[0_18px_50px_rgba(16,185,129,0.28)] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]"
            >
              <MessageCircle className="h-7 w-7 animate-pulse" />
              <div className="text-center">
                <p className="mb-1 text-xl font-bold">Chat WhatsApp</p>
                <p className="text-sm opacity-90">Hubungi kami langsung</p>
              </div>
            </button>

            <div className={contactCardClass}>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-orange)]/10">
                  <MapPin className="text-[var(--accent-orange)]" size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-[var(--text-primary)]">Lokasi</p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
                        operationalStatus.isOpen
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                          : "border-red-500/30 bg-red-500/10 text-red-500"
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {operationalStatus.label}
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)]">{LOCATION_ADDRESS}</p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">Jam Operasional: 08:00 - 18:00 WIB</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={copyLocation}
                      className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-[var(--border-color)] px-4 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)]"
                    >
                      <Copy className="h-4 w-4" />
                      Salin
                    </button>
                    <button
                      type="button"
                      onClick={shareLocation}
                      className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-[var(--border-color)] px-4 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)]"
                    >
                      <Share2 className="h-4 w-4" />
                      Share Location
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          {...cardMotion(0.42)}
          ref={mapContainerRef}
          className="mx-auto mt-14 max-w-6xl overflow-hidden rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm sm:mt-16"
        >
          <div className="flex flex-col gap-4 border-b border-[var(--border-color)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <p className="text-lg font-bold text-[var(--text-primary)]">{LOCATION_NAME}</p>
              <p className="text-sm text-[var(--text-secondary)]">{LOCATION_ADDRESS}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openExternal(GOOGLE_MAPS_SEARCH)}
                className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-[var(--border-color)] px-4 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)]"
              >
                <ExternalLink className="h-4 w-4" />
                Buka di Google Maps
              </button>
              <button
                type="button"
                onClick={() => openExternal(MAPS_LINK)}
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[var(--accent-orange)] px-4 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              >
                <Navigation className="h-4 w-4" />
                Petunjuk Arah
              </button>
            </div>
          </div>

          <div className="relative h-[250px] overflow-hidden sm:h-[400px]">
            {!mapLoaded && (
              <div className="absolute inset-0 z-10 animate-pulse bg-[var(--bg-card)]">
                <div className="h-full w-full bg-gradient-to-r from-transparent via-[var(--accent-orange)]/10 to-transparent" />
              </div>
            )}
            <iframe
              key={mapEmbedUrl}
              title="Lokasi GARASI.21 MOTOWASH"
              src={mapEmbedUrl}
              className="h-full w-full border-0 transition-[filter] duration-300 dark:[filter:invert(90%)_hue-rotate(180deg)]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              onLoad={() => setMapLoaded(true)}
            />

            <div className="absolute right-3 top-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMapLoaded(false);
                  setMapZoom((zoom) => Math.min(20, zoom + 1));
                }}
                className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)]/95 text-[var(--text-primary)] shadow-lg backdrop-blur transition-colors hover:text-[var(--accent-orange)]"
                aria-label="Zoom in"
              >
                <Plus className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMapLoaded(false);
                  setMapZoom((zoom) => Math.max(10, zoom - 1));
                }}
                className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)]/95 text-[var(--text-primary)] shadow-lg backdrop-blur transition-colors hover:text-[var(--accent-orange)]"
                aria-label="Zoom out"
              >
                <Minus className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)]/95 text-[var(--text-primary)] shadow-lg backdrop-blur transition-colors hover:text-[var(--accent-orange)]"
                aria-label="Full screen"
              >
                <Maximize2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
