"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ZoomIn, X, Github, ExternalLink } from "lucide-react";

interface Project {
  title: string;
  description: string;
  tech: string[];
  image: string;
  githubUrl?: string;
  demoUrl?: string;
}

const projects: Project[] = [
  {
    title: "YOLO Framework Object Detection",
    description: "Engineered a high-precision Computer Vision pipeline using the YOLO framework for automated disease identification in botanical and medical datasets. Achieved >90% detection accuracy with real-time inference optimization.",
    tech: ["YOLO", "CNN", "Python", "Image Processing", "OpenCV"],
    image: "/project-ai.jpg",
    githubUrl: "https://github.com/RobertusWilliamSusanto"
  },
  {
    title: "Automated Task Management System",
    description: "Architected a desktop task automation engine in Python to streamline daily workflow scheduling, task categorization, and productivity metric tracking with a lightweight GUI interface.",
    tech: ["Python", "GUI Automation", "Algorithms"],
    image: "/project-todo.jpg",
    githubUrl: "https://github.com/RobertusWilliamSusanto"
  },
  {
    title: "Automatic Classic Cryptographic Calculator",
    description: "Developed a web-based modular cryptography tool implementing classic cipher algorithms (Caesar, Vigenère, Playfair) with automated key validation and encryption/decryption state visualization.",
    tech: ["Python", "Flask", "Cryptography", "Algorithms"],
    image: "/Kriptografi.jpg",
    githubUrl: "https://github.com/RobertusWilliamSusanto/Tugas-Proyek-Kriptografi-Klasik",
    demoUrl: "https://tugas-proyek-kriptografi-klasik.vercel.app"
  }
];

export default function Projects() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section id="projects" className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pt-12 border-t border-border" aria-label="Selected Projects">
      <div className="md:col-span-3 lg:col-span-3">
        <h2 className="font-mono text-xs text-muted uppercase tracking-widest sticky top-32">
          Selected Projects
        </h2>
      </div>
      
      <div className="md:col-span-9 lg:col-span-9 grid grid-cols-1 gap-8">
        {projects.map((project, index) => (
          <article
            key={index}
            className="bg-surface border border-border p-6 md:p-8 hover:border-border-hover transition-all duration-300 flex flex-col lg:flex-row gap-8 group rounded-sm"
          >
            {/* Image Preview Thumbnail */}
            <div 
              onClick={() => setSelectedImage(project.image)}
              className="relative w-full lg:w-1/2 h-56 lg:h-64 rounded border border-border overflow-hidden bg-background cursor-zoom-in group/img shrink-0"
              role="button"
              aria-label={`Zoom preview image for ${project.title}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelectedImage(project.image);
              }}
            >
              <Image
                src={project.image}
                alt={`Screenshot of ${project.title}`}
                fill
                loading="lazy"
                decoding="async"
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover group-hover/img:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-background/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <ZoomIn size={24} className="text-foreground" />
              </div>
            </div>

            {/* Content Column */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between py-1">
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-lg md:text-xl font-semibold text-foreground group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  
                  {/* External Project Links */}
                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted hover:text-foreground transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        aria-label={`View ${project.title} source code on GitHub`}
                      >
                        <Github size={18} />
                      </a>
                    )}
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted hover:text-foreground transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        aria-label={`Visit live demo for ${project.title}`}
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-xs md:text-sm text-muted leading-relaxed mb-6">
                  {project.description}
                </p>
              </div>
              
              {/* Tech Stack Badges */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {project.tech.map((tech, i) => (
                  <span key={i} className="px-2.5 py-1 bg-background border border-border text-muted font-mono text-[11px] uppercase rounded-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Lightbox Modal for Zoomed Image */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md p-4 cursor-zoom-out animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <button 
            className="absolute top-6 right-6 z-50 p-2.5 bg-surface hover:bg-border-hover border border-border rounded-full text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
            onClick={() => setSelectedImage(null)}
            aria-label="Close zoomed image preview"
          >
            <X size={20} />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl h-[70vh] md:h-[85vh] rounded-lg overflow-hidden border border-border shadow-2xl bg-background"
          >
            <Image
              src={selectedImage}
              alt="Zoomed Project Preview"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}