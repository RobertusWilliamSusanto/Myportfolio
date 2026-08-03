export default function Footer() {
  return (
    <footer className="w-full py-8 bg-background border-t border-border flex flex-col md:flex-row justify-between items-center px-6 md:px-12 gap-4 max-w-6xl mx-auto text-xs font-mono text-muted">
      <div>© 2026 ROBERTUS WILLIAM SUSANTO</div>
      <div className="flex gap-6">
        <a 
          href="https://www.linkedin.com/in/robertuswilliamsusanto" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-foreground transition-colors"
        >
          LINKEDIN
        </a>
        <a 
          href="/CV.pdf" 
          download="CV_Robertus_William_Susanto.pdf"
          className="hover:text-foreground transition-colors"
        >
          CV.PDF
        </a>
      </div>
    </footer>
  );
}