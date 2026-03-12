"use client";
import { motion } from "framer-motion";
import { Mail, Linkedin } from "lucide-react";

export default function Contact() {
  return (
    <section className="py-20 px-4 text-center border-t border-slate-800 mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="text-3xl font-bold mb-6">Let's Connect</h3>
        <p className="text-slate-400 mb-8 max-w-xl mx-auto">
          I'm currently looking for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!
        </p>
        <div className="flex justify-center gap-6">
          <a href="mailto:robertuswilliamsusanto@gmail.com" className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors">
            <Mail size={24} />
            Email
          </a>
          <a href="https://www.linkedin.com/in/robertuswilliamsusanto" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors">
            <Linkedin size={24} />
            LinkedIn
          </a>
        </div>
      </motion.div>
    </section>
  );
}