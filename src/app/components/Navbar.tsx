import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Menu, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../contexts/ThemeContext";
import Logo from "./Logo";

export default function Navbar() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { name: "Beranda", href: "#home" },
    { name: "Tentang", href: "#about" },
    { name: "Layanan", href: "#services" },
    { name: "Keunggulan", href: "#features" },
    { name: "Galeri", href: "#gallery" },
    { name: "Booking", href: "#booking" },
    { name: "Kontak", href: "#contact" },
    { name: "Login", href: "/user/auth", isRoute: true },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const handleMenuClick = (item: any) => {
    if (item.isRoute) {
      navigate(item.href);
      setIsMobileMenuOpen(false);
    } else {
      scrollToSection(item.href);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 dark:bg-[#0b1220]/95 backdrop-blur-md shadow-lg border-b border-gray-200/80 dark:border-white/10"
            : "bg-white/85 dark:bg-[#0b1220]/85 backdrop-blur-sm border-b border-gray-200/60 dark:border-white/10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-[72px] lg:h-20 items-center justify-between gap-4">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex min-w-0 items-center"
            >
              <Logo variant="full" size="md" />
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-6">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleMenuClick(item)}
                  className={`whitespace-nowrap text-sm font-semibold text-gray-700 transition-colors duration-300 hover:text-[#ff7a00] dark:text-gray-200 dark:hover:text-[#ff9a3d] lg:text-base ${
                    item.name === 'Login' ? 'bg-[#ff7a00] text-white px-5 py-2.5 rounded-lg hover:bg-[#e96f00] dark:text-white' : ''
                  }`}
                >
                  {item.name}
                </motion.button>
              ))}

              {/* Theme Toggle Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={toggleTheme}
                className="rounded-lg border border-gray-200 bg-gray-100 p-2.5 text-[#ff7a00] transition-all duration-300 hover:bg-[#ff7a00]/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-[#ff7a00]/15"
                aria-label="Toggle theme"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === "dark" ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === "dark" ? (
                    <Moon className="w-5 h-5 text-[#ff7a00]" />
                  ) : (
                    <Sun className="w-5 h-5 text-[#ff7a00]" />
                  )}
                </motion.div>
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-3 lg:hidden">
              <button
                onClick={toggleTheme}
                className="rounded-lg border border-gray-200 bg-gray-100 p-2 text-[#ff7a00] dark:border-white/10 dark:bg-white/5"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-lg p-2 text-gray-800 dark:text-white"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween" }}
            className="fixed inset-0 z-40 bg-white pt-20 dark:bg-[#0b1220] lg:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleMenuClick(item)}
                  className="text-2xl font-semibold text-gray-900 transition-colors duration-300 hover:text-[#ff7a00] dark:text-gray-100 dark:hover:text-[#ff9a3d]"
                >
                  {item.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
