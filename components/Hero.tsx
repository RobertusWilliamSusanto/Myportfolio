import React from "react";
import { ArrowRight, Download } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section 
      id="home" 
      className="min-h-[80vh] flex flex-col justify-center items-center text-center px-4 py-8 md:py-12"
      aria-label="Hero Section"
    >
      <div className="max-w-3xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-forwards">
        
        {/* Availability Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-[11px] font-mono text-muted mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="uppercase tracking-wider">Available for Opportunities</span>
        </div>

        {/* Profile Avatar Centered */}
        <div className="relative w-32 h-32 md:w-36 md:h-36 mb-6 rounded-full border border-border/80 overflow-hidden bg-surface p-1 shadow-2xl">
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image
              src="/profile.png"
              alt="Robertus William Susanto profile photo"
              fill
              sizes="(max-width: 768px) 128px, 144px"
              priority
              fetchPriority="high"
              className="object-cover"
            />
          </div>
        </div>

        {/* Subtitle / Status Tag */}
        <p className="font-mono text-[11px] md:text-xs text-muted mb-3 uppercase tracking-[0.2em]">
          Computer Engineering Student // Diponegoro University
        </p>
        
        {/* Title with Pure CSS Typewriter (Zero JS Overhead, Fast LCP) */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 flex items-center justify-center min-h-[1.2em] leading-tight max-w-full">
          <span 
            className="animate-pure-typewriter max-w-full"
            aria-label="Robertus William Susanto"
          >
            Robertus William Susanto
          </span>
        </h1>
        
        {/* Description Centered */}
        <p className="text-sm md:text-base text-muted/90 mb-8 max-w-xl leading-relaxed font-sans">
          Focusing on AI Development (Computer Vision) and Software Engineering. Experienced in building high-accuracy detection models and managing end-to-end technical projects.
        </p>
        
        {/* Call to Actions Centered */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <a
            href="#projects"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-foreground text-background font-mono text-xs font-semibold hover:bg-foreground/90 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[44px]"
          >
            VIEW PROJECTS
            <ArrowRight size={14} className="ml-2" aria-hidden="true" />
          </a>
          <a
            href="/CV.pdf"
            download="CV_Robertus_William_Susanto.pdf"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-surface hover:bg-border-hover border border-border text-foreground font-mono text-xs font-medium transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[44px]"
          >
            <Download size={14} className="mr-2" aria-hidden="true" />
            DOWNLOAD CV
          </a>
        </div>
      </div>
    </section>
  );
}