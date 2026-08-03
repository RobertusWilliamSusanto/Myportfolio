const experiences = [
  {
    name: "PMK FT 2026 & Dewan Pengurus Angkatan (DPA)",
    date: "2026 – Present",
    desc: "Spearheaded visual social media strategies, resulting in a 25% increase in follower engagement and consistent brand identity across digital platforms."
  },
  {
    name: "Prakarsa FT 2025",
    date: "August 21, 2025",
    desc: "Coordinated stage infrastructure and seating layouts for a faculty-scale event attended by hundreds of participants."
  },
  {
    name: "Digital Creative Class (UI/UX Class)",
    date: "May 31, 2025",
    desc: "Acted as a Technical Mentor and Public Relations lead, facilitating technical workshops for 70 participants and managing stakeholder communications."
  },
  {
    name: "Himaskom Menanam (Volunteer)",
    date: "November 10, 2024",
    desc: "Participated in reforestation initiatives to mitigate air pollution."
  }
];

export default function Experience() {
  return (
    <section id="experience" className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pt-12 border-t border-border">
      <div className="md:col-span-3 lg:col-span-3">
        <h2 className="font-mono text-xs text-muted uppercase tracking-widest sticky top-32">
          Experience
        </h2>
      </div>
      
      <div className="md:col-span-9 lg:col-span-9">
        <div className="relative border-l border-border ml-2 pl-6 md:pl-8 flex flex-col gap-10">
          {experiences.map((exp, index) => (
            <div key={index} className="relative">
              <div className="absolute w-2 h-2 bg-background border border-muted rounded-full -left-[29px] md:-left-[37px] top-1.5" />
              
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs text-muted mb-1">{exp.date}</span>
                <h3 className="text-sm font-semibold text-foreground">{exp.name}</h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">{exp.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}