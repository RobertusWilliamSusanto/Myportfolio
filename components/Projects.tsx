"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Info, ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react"; // Tambahan ikon ZoomIn dan X

const projects = [
  {
    title: "AI Pneumonia & Plant Disease Detection",
    description: "An advanced object detection system developed to identify pneumonia from chest X-rays and detect various diseases in plant leaves. The model demonstrates high accuracy in distinguishing healthy and infected subjects.",
    tech: "YOLO, CNN, Python",
    year: "2025",
    image: "/project-ai.jpg",
  },
  {
    title: "KriptoApp - Cryptography Calculator",
    description: "A web-based application designed to perform and track cryptographic encryptions and decryptions. Features robust support for classical algorithms including Hill, Vigenere, Enigma, and Playfair ciphers.",
    tech: "Web Technologies, Algorithms",
    year: "2026",
    image: "/Kriptografi.jpg",
  },
  {
    title: "Desktop Task Management",
    description: "A desktop-based task management application equipped with a clean Graphical User Interface (GUI). Built to streamline daily workflows, manage task priorities, and optimize personal productivity.",
    tech: "Python, GUI Automation",
    year: "2024",
    image: "/project-todo.jpg",
  }
];

export default function Projects() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // State untuk gambar yang dizoom

  const nextProject = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
  };

  const prevProject = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + projects.length) % projects.length);
  };

  return (
    <section id="projects" className="py-24 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h3 className="text-3xl md:text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Featured Projects
        </h3>
        <p className="text-slate-400">A showcase of my recent works and technical explorations.</p>
      </motion.div>

      <div className="relative">
        
        <button 
          onClick={prevProject} 
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-20 bg-slate-800 p-3 md:p-4 rounded-full hover:bg-blue-600 transition-colors border border-slate-700 shadow-xl group"
        >
          <ChevronLeft size={24} className="text-slate-300 group-hover:text-white" />
        </button>

        <button 
          onClick={nextProject} 
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-20 bg-slate-800 p-3 md:p-4 rounded-full hover:bg-blue-600 transition-colors border border-slate-700 shadow-xl group"
        >
          <ChevronRight size={24} className="text-slate-300 group-hover:text-white" />
        </button>

        <div className="overflow-hidden rounded-3xl bg-slate-800/30 border border-slate-700/50 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex flex-col lg:flex-row gap-8 lg:gap-12 p-6 md:p-8"
            >
              {/* SISI KIRI: GAMBAR PROYEK */}
              <div className="w-full lg:w-3/5">
                {/* Tambahkan cursor-zoom-in dan event onClick di sini */}
                <div 
                  className="relative w-full h-64 md:h-[400px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/50 shadow-lg group cursor-zoom-in"
                  onClick={() => setSelectedImage(projects[currentIndex].image)}
                >
                  <Image
                    src={projects[currentIndex].image}
                    alt={projects[currentIndex].title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Overlay Ikon Kaca Pembesar saat Kursor diarahkan */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <ZoomIn size={48} className="text-white opacity-80" />
                  </div>
                </div>
              </div>

              {/* SISI KANAN: INFORMASI PROYEK */}
              <div className="w-full lg:w-2/5 flex flex-col justify-center">
                <p className="text-slate-300 text-lg leading-relaxed mb-8">
                  {projects[currentIndex].description}
                </p>

                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/80">
                  <h5 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                    Project Info <Info size={16} className="text-slate-400" />
                  </h5>
                  <ul className="space-y-4 text-slate-400 text-sm md:text-base">
                    <li className="flex flex-col sm:flex-row sm:gap-2 border-b border-slate-800 pb-2">
                      <strong className="text-slate-200 min-w-[120px]">Project Name:</strong> 
                      <span className="text-blue-400">{projects[currentIndex].title}</span>
                    </li>
                    <li className="flex flex-col sm:flex-row sm:gap-2 border-b border-slate-800 pb-2">
                      <strong className="text-slate-200 min-w-[120px]">Build with:</strong> 
                      <span>{projects[currentIndex].tech}</span>
                    </li>
                    <li className="flex flex-col sm:flex-row sm:gap-2">
                      <strong className="text-slate-200 min-w-[120px]">Year:</strong> 
                      <span>{projects[currentIndex].year}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex justify-center gap-3 mt-8">
        {projects.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "bg-blue-500 w-8" : "bg-slate-600 hover:bg-slate-400 w-2.5"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* LIGHTBOX MODAL UNTUK ZOOM GAMBAR */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)} // Klik background gelap akan menutup gambar
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 cursor-zoom-out"
          >
            {/* Tombol X (Close) di pojok kanan atas */}
            <button 
              className="absolute top-6 right-6 md:top-8 md:right-8 z-50 p-2 bg-slate-800/50 hover:bg-red-500 rounded-full text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={24} />
            </button>

            {/* Gambar yang Di-zoom */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()} // Mencegah gambar tertutup kalau nggak sengaja keklik gambarnya
              className="relative w-full max-w-5xl h-[70vh] md:h-[85vh] rounded-xl overflow-hidden shadow-2xl"
            >
              <Image
                src={selectedImage}
                alt="Zoomed Project Image"
                fill
                className="object-contain" // object-contain memastikan seluruh gambar terlihat tanpa terpotong
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}