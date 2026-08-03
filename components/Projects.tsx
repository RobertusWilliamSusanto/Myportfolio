"use client";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X } from "lucide-react";

const projects = [
  {
    title: "YOLO Framework Object Detection",
    description: "Engineered a high-precision object detection model using the YOLO (You Only Look Once) framework to identify diseases in plants and humans, achieving an accuracy rate exceeding 90%.",
    tech: ["YOLO", "CNN", "Python", "Image Processing"],
    image: "/project-ai.jpg"
  },
  {
    title: "Automated Task Management System",
    description: "Developed an automated task management system using Python to streamline daily workflows and optimize productivity through automation.",
    tech: ["Python", "GUI Automation"],
    image: "/project-todo.jpg"
  },
  {
    title: "Automatic Classic Cryptographic Calculator",
    description: "Creating an Automatic Classic Cryptographic Calculator for automated classical encryption and decryption operations.",
    tech: ["Python", "Algorithms", "Cryptography"],
    image: "/Kriptografi.jpg"
  }
];

export default function Projects() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section id="projects" className="grid grid-cols-1 md:grid-cols-12 gap-12 pt-12 border-t border-border">
      <div className="md:col-span-4">
        <h2 className="font-mono text-xs text-muted uppercase tracking-widest sticky top-32">
          02 // Selected Projects
        </h2>
      </div>
      
      <div className="md:col-span-8 grid grid-cols-1 gap-8">
        {projects.map((project, index) => (
          <motion.article
            key={index}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-surface border border-border p-6 hover:border-border-hover transition-all duration-300 flex flex-col md:flex-row gap-6 group"
          >
            <div 
              onClick={() => setSelectedImage(project.image)}
              className="relative w-full md:w-1/2 h-48 rounded border border-border overflow-hidden bg-background cursor-zoom-in group/img"
            >
              <Image
                src={project.image}
                alt={project.title}
                fill
                loading="lazy"
                decoding="async"
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover group-hover/img:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-background/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <ZoomIn size={24} className="text-foreground" />
              </div>
            </div>

            <div className="w-full md:w-1/2 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground group-hover:text-blue-400 transition-colors mb-2">
                  {project.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed mb-6">
                  {project.description}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {project.tech.map((tech, i) => (
                  <span key={i} className="px-2 py-0.5 bg-background border border-border text-muted font-mono text-[10px] uppercase">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md p-4 cursor-zoom-out"
          >
            <button 
              className="absolute top-6 right-6 z-50 p-2 bg-surface hover:bg-border-hover border border-border rounded-full text-foreground transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={20} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl h-[70vh] md:h-[85vh] rounded-lg overflow-hidden border border-border shadow-2xl bg-background"
            >
              <Image
                src={selectedImage}
                alt="Zoomed Project Preview"
                fill
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}