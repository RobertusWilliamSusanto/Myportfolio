"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Fungsi untuk melacak koordinat mouse
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Fungsi untuk mendeteksi apakah kursor sedang menyentuh tombol/link
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Deteksi tag <a>, <button>, atau elemen yang punya class cursor-pointer
      if (
        target.closest("a") || 
        target.closest("button") || 
        window.getComputedStyle(target).cursor === "pointer"
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    // 'hidden md:block' agar kursor kustom ini tidak muncul di HP/Tablet (layar sentuh)
    <div className="hidden md:block">
      {/* Titik Utama (Dot) */}
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-blue-500 rounded-full pointer-events-none z-[9999] mix-blend-screen shadow-[0_0_10px_rgba(59,130,246,0.8)]"
        animate={{
          x: mousePosition.x - 8, // Dikurangi setengah ukuran (16/2) agar pas di tengah
          y: mousePosition.y - 8,
          scale: isHovering ? 2.5 : 1,
          opacity: isHovering ? 0.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
      />
      
      {/* Cincin Bayangan yang mengikuti (Trailing Ring) */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border border-blue-400 rounded-full pointer-events-none z-[9998]"
        animate={{
          x: mousePosition.x - 20, // Dikurangi setengah ukuran (40/2)
          y: mousePosition.y - 20,
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 0 : 1, // Hilang kalau sedang hover tombol
        }}
        transition={{ type: "spring", stiffness: 250, damping: 20, mass: 0.8 }}
      />
    </div>
  );
}