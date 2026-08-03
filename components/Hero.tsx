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
    <section id="home" className="min-h-[85vh] flex flex-col justify-center items-center text-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto flex flex-col items-center"
      >
        {/* Profile Avatar Centered with Subtle Ring */}
        <div className="relative w-32 h-32 md:w-36 md:h-36 mb-6 rounded-full border border-border/80 overflow-hidden bg-surface p-1 shadow-2xl">
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image
              src="/profile.png"
              alt="Robertus William Susanto"
              fill
              sizes="(max-width: 768px) 128px, 144px"
              priority
              fetchPriority="high"
              className="object-cover"
            />
          </div>
        </div>

        {/* Subtitle / Status Tag */}
        <p className="font-mono text-[11px] md:text-xs text-muted mb-4 uppercase tracking-[0.2em]">
          Computer Engineering Student // Diponegoro University
        </p>
        
        {/* Typewriter Title Centered */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 flex items-center justify-center min-h-[1.2em] leading-tight">
          <span>{text}</span>
          <span className="w-[3px] h-[0.85em] bg-foreground ml-1.5 inline-block animate-pulse" />
        </h1>
        
        {/* Description Centered */}
        <p className="text-sm md:text-base text-muted/90 mb-8 max-w-xl leading-relaxed font-sans">
          Focusing on AI Development (Computer Vision) and Software Engineering. Experienced in building high-accuracy detection models and managing end-to-end technical projects.
        </p>
        
        {/* Call to Actions Centered */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <a
            href="#projects"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-foreground text-background font-mono text-xs font-semibold hover:bg-foreground/90 transition-all rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            VIEW PROJECTS
            <ArrowRight size={14} className="ml-2" />
          </a>
          <a
            href="/CV.pdf"
            download="CV_Robertus_William_Susanto.pdf"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-surface hover:bg-border-hover border border-border text-foreground font-mono text-xs font-medium transition-all rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Download size={14} className="mr-2" />
            DOWNLOAD CV
          </a>
        </div>
      </motion.div>
    </section>
  );
}