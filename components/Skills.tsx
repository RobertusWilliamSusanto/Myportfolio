const skillCategories = [
  {
    category: "Software & Design",
    items: ["Python (NumPy, Matplotlib)", "C++", "Canva", "Figma (UI/UX)"]
  },
  {
    category: "AI / Machine Learning",
    items: ["YOLO", "Convolutional Neural Networks (CNN)", "Image Processing"]
  },
  {
    category: "Computer Networking",
    items: ["Cisco Packet Tracer", "Router/Switch Configuration"]
  },
  {
    category: "Hardware & Systems",
    items: ["Troubleshooting", "Digital Logic Design", "Microcontrollers"]
  },
  {
    category: "Multimedia",
    items: ["Blender"]
  },
  {
    category: "Languages",
    items: ["Indonesian (Proficient)", "English (Proficient)"]
  }
];

export default function Skills() {
  return (
    <section id="skills" className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pt-12 border-t border-border">
      <div className="md:col-span-3 lg:col-span-3">
        <h2 className="font-mono text-xs text-muted uppercase tracking-widest sticky top-32">
          Skills & Expertise
        </h2>
      </div>
      
      <div className="md:col-span-9 lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {skillCategories.map((cat, index) => (
          <div key={index} className="bg-surface border border-border p-4 transition-colors hover:border-border-hover">
            <h3 className="font-mono text-xs text-foreground uppercase mb-3 border-b border-border pb-2">
              {cat.category}
            </h3>
            <ul className="space-y-1.5">
              {cat.items.map((item, i) => (
                <li key={i} className="text-xs text-muted font-mono flex items-center gap-2">
                  <span className="text-blue-400">&gt;</span> {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}