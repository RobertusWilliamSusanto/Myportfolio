"use client";
import Link from "next/link";

export default function Navbar() {
  const handleConnect = (e: React.MouseEvent) => {
    e.preventDefault();
    const encoded = "cm9iZXJ0dXN3aWxsaWFtc3VzYW50b0BnbWFpbC5jb20=";
    window.location.href = `mailto:${atob(encoded)}`;
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border flex justify-between items-center px-6 md:px-12 py-4 max-w-6xl mx-auto left-0 right-0">
      <Link href="#home" className="text-sm font-bold tracking-tighter font-mono text-foreground">
        ROBERTUS.AI
      </Link>
      
      <div className="hidden md:flex items-center gap-8 font-mono text-xs text-muted">
        <Link href="#about" className="hover:text-foreground transition-colors">ABOUT</Link>
        <Link href="#projects" className="hover:text-foreground transition-colors">PROJECTS</Link>
        <Link href="#experience" className="hover:text-foreground transition-colors">EXPERIENCE</Link>
        <Link href="#skills" className="hover:text-foreground transition-colors">SKILLS</Link>
      </div>

      <button
        onClick={handleConnect}
        className="px-4 py-2 bg-surface hover:bg-border-hover border border-border text-foreground font-mono text-xs transition-colors cursor-pointer"
      >
        CONNECT
      </button>
    </nav>
  );
}