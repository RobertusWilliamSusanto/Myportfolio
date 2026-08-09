"use client";

import React from "react";

export default function Footer() {
  const email = "robertuswilliamsusanto@gmail.com";

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Buka Gmail Composer langsung di tab baru (mencegah popup 'Pick an app' sistem)
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <footer className="w-full py-8 bg-background border-t border-border mt-20">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-muted">
        <div>© 2026 ROBERTUS WILLIAM SUSANTO</div>
        <div className="flex items-center gap-6">
          <a 
            href="https://github.com/RobertusWilliamSusanto" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded uppercase"
          >
            GITHUB
          </a>
          <a 
            href="https://www.linkedin.com/in/robertuswilliamsusanto" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded uppercase"
          >
            LINKEDIN
          </a>
          <a
            href={`mailto:${email}`}
            onClick={handleEmailClick}
            className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded uppercase cursor-pointer"
          >
            EMAIL
          </a>
        </div>
      </div>
    </footer>
  );
}