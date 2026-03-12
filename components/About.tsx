"use client";
import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="py-20 px-4 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 md:p-12 rounded-3xl shadow-xl"
      >
        <h3 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          About Me
        </h3>
        <p className="text-slate-300 leading-relaxed text-lg">
          I am a Computer Engineering student at Diponegoro University focused on Artificial Intelligence, software development, and digital technology innovation. I enjoy building modern digital solutions and have strong interest in AI systems, computer networks, and software engineering. My goal is to deliver user-centered digital solutions through robust teamwork and cross-platform technical expertise.
        </p>
      </motion.div>
    </section>
  );
}