export default function About() {
  return (
    <section id="about" className="grid grid-cols-1 md:grid-cols-12 gap-12 pt-12 border-t border-border">
      <div className="md:col-span-4">
        <h2 className="font-mono text-xs text-muted uppercase tracking-widest sticky top-32">
          01 // About
        </h2>
      </div>
      
      <div className="md:col-span-8 space-y-8">
        <div className="text-base text-muted max-w-2xl space-y-6 leading-relaxed">
          <p>
            Computer Engineering Student at Diponegoro University with a focus on AI Development (Computer Vision) and Software Engineering. Experienced in building high-accuracy detection models and managing end-to-end technical projects.
          </p>
          <p>
            Committed to delivering user-centered digital solutions through robust teamwork and cross-platform technical expertise.
          </p>
        </div>

        <div className="bg-[#0F1014] border border-border rounded-md pt-8 p-6 mt-12 max-w-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-8 bg-[#1c1b1b] border-b border-border flex items-center px-4 gap-2">
            <div className="w-2.5 h-2.5 rounded-full dot-mac-red" />
            <div className="w-2.5 h-2.5 rounded-full dot-mac-yellow" />
            <div className="w-2.5 h-2.5 rounded-full dot-mac-green" />
          </div>
          
          <div className="font-mono text-xs text-muted space-y-2 mt-2">
            <p><span className="text-blue-400">&gt;</span> status</p>
            <p className="text-gray-300 pl-4">Bachelor of Computer Engineering Student</p>
            <p><span className="text-blue-400">&gt;</span> institution</p>
            <p className="text-gray-300 pl-4">Diponegoro University (Faculty of Engineering)</p>
            <p><span className="text-blue-400">&gt;</span> focus_areas</p>
            <p className="text-gray-300 pl-4">Computer Vision, CNN, YOLO, Software Engineering</p>
          </div>
        </div>
      </div>
    </section>
  );
}