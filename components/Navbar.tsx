"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12 py-4 flex justify-between items-center">
        {/* Brand Name */}
        <Link 
          href="#home" 
          className="text-xs md:text-sm font-bold tracking-tight font-mono text-foreground hover:text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded uppercase"
        >
          PORTFOLIO ROBERTUS
        </Link>
        
        {/* Desktop Links - Clean, Elegant & Minimalist */}
        <div className="hidden md:flex items-center gap-8 font-mono text-xs tracking-wider text-muted">
          <Link href="#about" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded uppercase">ABOUT</Link>
          <Link href="#projects" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded uppercase">PROJECTS</Link>
          <Link href="#experience" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded uppercase">EXPERIENCE</Link>
          <Link href="#skills" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded uppercase">SKILLS</Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
          className="md:hidden text-foreground p-1 focus-visible:outline-none"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border px-6 py-6 flex flex-col gap-4 font-mono text-xs">
          <Link href="#about" onClick={() => setMobileMenuOpen(false)} className="text-muted hover:text-foreground py-1">ABOUT</Link>
          <Link href="#projects" onClick={() => setMobileMenuOpen(false)} className="text-muted hover:text-foreground py-1">PROJECTS</Link>
          <Link href="#experience" onClick={() => setMobileMenuOpen(false)} className="text-muted hover:text-foreground py-1">EXPERIENCE</Link>
          <Link href="#skills" onClick={() => setMobileMenuOpen(false)} className="text-muted hover:text-foreground py-1">SKILLS</Link>
        </div>
      )}
    </nav>
  );
}