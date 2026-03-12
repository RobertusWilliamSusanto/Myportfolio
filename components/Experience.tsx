"use client";
import { motion } from "framer-motion";
import { Users, CalendarDays, MonitorPlay, TreePine } from "lucide-react";

const experiences = [
  {
    role: "PMK FT Management & DPA",
    date: "2026 - Present",
    desc: "Spearheaded visual social media strategies, resulting in a 25% increase in follower engagement and consistent brand identity.",
    icon: <Users size={20} />
  },
  {
    role: "Prakarsa FT Committee",
    date: "August 2025",
    desc: "Managed stage production and coordinated technical event layout for a faculty-scale event attended by hundreds of participants.",
    icon: <CalendarDays size={20} />
  },
  {
    role: "Technical Mentor & PR",
    date: "May 2025",
    desc: "Technical mentor and community relations for UI/UX training. Facilitated workshops for 70 participants.",
    icon: <MonitorPlay size={20} />
  },
  {
    role: "Himaskom Menanam Volunteer",
    date: "November 2024",
    desc: "Environmental volunteer participating in reforestation initiatives by planting trees to reduce air pollution.",
    icon: <TreePine size={20} />
  }
];

export default function Experience() {
  return (
    <section id="experience" className="py-24 px-4 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h3 className="text-3xl md:text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Organizations & Volunteering
        </h3>
        <p className="text-slate-400">My journey in leadership, community, and impact.</p>
      </motion.div>

      <div className="relative border-l-2 border-slate-800 ml-4 md:ml-0 md:border-none">
        {/* Garis Tengah Bercahaya (Khusus Desktop) */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent -translate-x-1/2"></div>

        <div className="space-y-12">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative flex flex-col md:flex-row items-start md:items-center justify-between group"
            >
              {/* Titik Ikon Timeline */}
              <motion.div
                whileHover={{ scale: 1.15, rotate: 5 }}
                className="absolute left-[-42px] md:relative md:left-0 md:left-1/2 flex items-center justify-center w-12 h-12 rounded-full border-4 border-slate-900 bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] z-10 md:-translate-x-1/2 group-hover:bg-purple-500 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all duration-300"
              >
                {exp.icon}
              </motion.div>

              {/* Konten Kartu (Kiri dan Kanan bergantian) */}
              <div className={`w-full md:w-[45%] pl-8 md:pl-0 ${index % 2 === 0 ? "md:text-right md:pr-14" : "md:ml-auto md:pl-14"}`}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="block bg-slate-800/40 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/80 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] transition-all duration-300"
                >
                  <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-wider text-blue-400 bg-blue-500/10 rounded-full">
                    {exp.date}
                  </span>
                  <h4 className="text-xl md:text-2xl font-bold text-slate-100 mb-3">{exp.role}</h4>
                  <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                    {exp.desc}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}