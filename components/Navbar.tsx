"use client";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800"
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Nama (Logo) yang bisa diklik untuk kembali ke Home */}
        <a 
          href="#home" 
          className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          R. William S.
        </a>

        {/* Daftar Menu navigasi */}
        <ul className="hidden md:flex gap-6 text-sm font-medium text-slate-300">
          <li><a href="#home" className="hover:text-white transition">Home</a></li>
          <li><a href="#about" className="hover:text-white transition">About</a></li>
          <li><a href="#skills" className="hover:text-white transition">Skills</a></li>
          <li><a href="#projects" className="hover:text-white transition">Projects</a></li>
          <li><a href="#experience" className="hover:text-white transition">Experience</a></li>
        </ul>

      </div>
    </motion.nav>
  );
}