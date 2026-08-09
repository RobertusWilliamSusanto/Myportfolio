export default function About() {
  return (
    <section id="about" className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pt-12 border-t border-border" aria-label="About Me">
      <div className="md:col-span-3 lg:col-span-3">
        <h2 className="font-mono text-xs text-muted uppercase tracking-widest sticky top-32">
          About
        </h2>
      </div>
      
      <div className="md:col-span-9 lg:col-span-9">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Statement Column */}
          <div className="lg:col-span-7 text-base md:text-lg text-muted/90 space-y-6 leading-relaxed">
            <p>
              Computer Engineering Student at Diponegoro University with a focus on AI Development (Computer Vision) and Software Engineering. Experienced in building high-accuracy detection models and managing end-to-end technical projects.
            </p>
            <p className="text-sm md:text-base text-muted">
              Committed to delivering user-centered digital solutions through robust teamwork and cross-platform technical expertise.
            </p>
          </div>

          {/* Side Terminal Block Column */}
          <div 
            className="lg:col-span-5 bg-[#0F1014] border border-border rounded-md pt-8 p-5 relative overflow-hidden"
            role="region"
            aria-label="System status overview"
          >
            <div className="absolute top-0 left-0 right-0 h-8 bg-[#1c1b1b] border-b border-border flex items-center px-4 gap-2" aria-hidden="true">
              <div className="w-2.5 h-2.5 rounded-full dot-mac-red" />
              <div className="w-2.5 h-2.5 rounded-full dot-mac-yellow" />
              <div className="w-2.5 h-2.5 rounded-full dot-mac-green" />
            </div>
            
            <div className="font-mono text-xs text-muted space-y-3 mt-1 break-words">
              <div>
                <p className="text-blue-400">&gt; status</p>
                <p className="text-gray-300 pl-3 mt-0.5">Undergraduate Computer Engineering Student</p>
              </div>
              <div>
                <p className="text-blue-400">&gt; institution</p>
                <p className="text-gray-300 pl-3 mt-0.5">Diponegoro University</p>
              </div>
              <div>
                <p className="text-blue-400">&gt; focus_areas</p>
                <p className="text-gray-300 pl-3 mt-0.5">Computer Vision, CNN, YOLO, Software Eng</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}