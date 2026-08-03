"use client";
import { motion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Hero() {
  const [text, setText] = useState("");
  const fullText = "Robertus William Susanto";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) clearInterval(timer);
    }, 90);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="home" className="min-h-[70vh] flex flex-col justify-center gap-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl"
      >
        {/* Profile Avatar */}
        <div className="relative w-36 h-36 mb-8 rounded-full border border-border overflow-hidden bg-surface">
          <Image
            src="/profile.png"
            alt="Robertus William Susanto"
            fill
            sizes="(max-width: 768px) 144px, 144px"
            priority
            fetchPriority="high"
            className="object-cover"
          />
        </div>

        <p className="font-mono text-xs text-muted mb-4 uppercase tracking-widest">
          Computer Engineering Student // Diponegoro University
        </p>
        
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tighter mb-6 flex items-center min-h-[1.2em]">
          {text}
          <span className="w-1 h-[0.9em] bg-foreground ml-1 animate-pulse" />
        </h1>
        
        <p className="text-lg md:text-xl text-muted mb-10 max-w-2xl leading-relaxed">
          Focusing on AI Development (Computer Vision) and Software Engineering. Experienced in building high-accuracy detection models and managing end-to-end technical projects.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <a
            href="#projects"
            className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-background font-mono text-xs font-medium hover:bg-gray-200 transition-colors"
          >
            VIEW PROJECTS
            <ArrowRight size={14} className="ml-2" />
          </a>
          <a
            href="/CV.pdf"
            download="CV_Robertus_William_Susanto.pdf"
            className="inline-flex items-center justify-center px-6 py-3 bg-transparent border border-border text-foreground font-mono text-xs hover:border-border-hover transition-colors"
          >
            <Download size={14} className="mr-2" />
            DOWNLOAD CV
          </a>
        </div>
      </motion.div>
    </section>
  );
}