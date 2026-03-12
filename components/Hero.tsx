"use client";
import { motion } from "framer-motion";
import { Mail, Download, Code2 } from "lucide-react";
import Image from "next/image";
import { Typewriter } from "react-simple-typewriter"; // <--- Tambahan library typing

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 px-4 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        
        {/* Foto Profil */}
        <div className="relative w-44 h-44 mx-auto mb-8 group">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-70 blur-md group-hover:opacity-100 group-hover:blur-lg group-hover:duration-200 animate-spin-slow transition-all duration-1000"
            style={{ animationDuration: '8s' }}
          ></motion.div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="relative w-full h-full rounded-full border-4 border-slate-900 overflow-hidden shadow-2xl z-10"
          >
            <Image
              src="/profile.png"
              alt="Robertus William Susanto"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              priority
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700 text-blue-400 mb-6 backdrop-blur-sm shadow-lg"
        >
          <Code2 size={16} />
          <span className="text-sm font-mono tracking-wider">WELCOME TO MY PORTFOLIO</span>
        </motion.div>

 {/* --- NAMA DENGAN EFEK TYPING --- */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="h-12 sm:h-16 md:h-24 mb-4 flex justify-center items-center" 
        >
          {/* Di sini kita ubah text-5xl md:text-7xl menjadi ukuran yang lebih kecil dan bertahap */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight whitespace-nowrap">
            <Typewriter
              words={['Robertus William Susanto']}
              loop={1}
              cursor
              cursorStyle='|'
              typeSpeed={100}
            />
          </h1>
        </motion.div>
        
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-3xl font-medium mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
        >
          Computer Engineering Student
        </motion.h2>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-400 max-w-2xl mx-auto mb-10 text-lg leading-relaxed"
        >
          Focusing on Artificial Intelligence, software development, and digital technology innovation. Passionate about building modern digital solutions.
        </motion.p>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-4 flex-col sm:flex-row"
        >
          <a 
            href="/cv.pdf" 
            download="CV_Robertus_William_Susanto.pdf"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3.5 rounded-full shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-1"
          >
            <Download size={20} />
            Download CV
          </a>
          <a 
            href="https://www.linkedin.com/in/robertuswilliamsusanto" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-slate-800/50 backdrop-blur-md border border-slate-700 hover:bg-slate-700 text-white font-medium px-8 py-3.5 rounded-full transition-all hover:-translate-y-1"
          >
            <Mail size={20} />
            Contact Me
          </a>
        </motion.div>
      </div>
    </section>
  );
}