"use client";
import { motion } from "framer-motion";
import { Code2, BrainCircuit, Network, Palette, Cpu, Languages } from "lucide-react";

const skillCategories = [
  { title: "Programming", icon: <Code2 />, skills: ["Python", "C++", "NumPy", "Matplotlib"] },
  { title: "AI / Machine Learning", icon: <BrainCircuit />, skills: ["CNN", "YOLO", "Image Processing"] },
  { title: "Networking", icon: <Network />, skills: ["Cisco Packet Tracer", "Network Config"] },
  { title: "Creative", icon: <Palette />, skills: ["Blender", "UI/UX Design", "Canva", "Figma"] },
  { title: "Hardware", icon: <Cpu />, skills: ["Microcontrollers", "Embedded System"] },
  { title: "Languages", icon: <Languages />, skills: ["Indonesian", "English"] },
];

export default function Skills() {
  return (
    <section id="skills" className="py-20 px-4 max-w-6xl mx-auto">
      <h3 className="text-3xl font-bold mb-12 text-center">Technical Arsenal</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skillCategories.map((cat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl hover:border-blue-500/50 transition-colors"
          >
            <div className="text-blue-400 mb-4">{cat.icon}</div>
            <h4 className="text-xl font-semibold mb-4">{cat.title}</h4>
            <div className="flex flex-wrap gap-2">
              {cat.skills.map((skill, i) => (
                <span key={i} className="bg-slate-900 px-3 py-1 rounded-full text-sm text-slate-300">
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}