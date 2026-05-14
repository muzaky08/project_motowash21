import { Heart } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-gray-900 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo and Tagline */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Logo variant="full" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Thank you sudah memilih kami sebagai spesialis cuci motor.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-800 my-8" />

        {/* Bottom */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-500 text-sm flex items-center justify-center gap-2">
            Made with <Heart className="text-[#ff7a00]" size={16} fill="#ff7a00" /> Di Kota Serang
          </p>
          <p className="text-gray-500 dark:text-gray-600 text-xs mt-2">
            © 2026 GARASI.21 MOTOWASH. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
