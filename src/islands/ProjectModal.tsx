import { useState, useEffect, useRef } from 'preact/hooks';

interface ProjectDetail {
  id: string;
  title: string;
  badge: string;
  category: string;
  description: string;
  techStack: string[];
  metrics: string;
  highlights: string[];
  demoUrl?: string | null;
  repoUrl?: string | null;
}

const PROJECT_DETAILS: Record<string, ProjectDetail> = {
  'yolo': {
    id: 'yolo',
    title: 'Object Detection dengan YOLO',
    badge: '>90% EVALUATION',
    category: 'AI / COMPUTER VISION',
    description: 'Arsitektur model deteksi objek deep learning untuk identifikasi penyakit tanaman dan manusia dengan akurasi evaluasi di atas 90%. Dilengkapi arsitektur Convolutional Neural Networks (CNN) dan pipeline image processing komprehensif.',
    techStack: ['YOLO', 'Python', 'CNN', 'Computer Vision', 'PyTorch', 'OpenCV'],
    metrics: '>90% mAP evaluation, multi-class bounding box regression',
    highlights: [
      'Implementasi arsitektur CNN deep learning dengan transfer learning',
      'Dataset preprocessing, labeling, dan augmentation pipeline',
      'Evaluasi model presisi tinggi (>90%) pada skenario pencahayaan bervariasi',
      'Optimasi inference latency untuk processing visual real-time'
    ],
    demoUrl: null,
    repoUrl: null
  },
  'sibarista': {
    id: 'sibarista',
    title: 'SIBARISTA Tourism Info System',
    badge: 'RESTful API & RBAC',
    category: 'BACKEND & CLOUD',
    description: 'Arsitektur backend sistem informasi desa wisata SIBARISTA Kota Semarang menggunakan NestJS, TypeScript, Prisma ORM, dan PostgreSQL (Neon DB).',
    techStack: ['NestJS', 'TypeScript', 'Prisma ORM', 'PostgreSQL', 'JWT', 'Cloudinary'],
    metrics: 'Production live portal deployed on Vercel with Neon Serverless DB',
    highlights: [
      'Role-Based Access Control (RBAC) dengan secure JSON Web Tokens',
      'Database schema migration dan relasional query dengan Prisma ORM',
      'Media asset upload pipeline terintegrasi Cloudinary SDK',
      'Public REST API dengan pagination, filtering, dan DTO validation'
    ],
    demoUrl: 'https://sibarista-disbudpar.vercel.app',
    repoUrl: null
  },
  'kriptografi': {
    id: 'kriptografi',
    title: 'Kriptografi Klasik & Security Tools',
    badge: 'SECURITY & MATH',
    category: 'SECURITY',
    description: 'Kalkulator kriptografi klasik untuk enkripsi dan dekripsi algoritma klasik (Vigenère, Playfair, Hill cipher, Caesar) dengan implementasi matematis presisi tinggi.',
    techStack: ['Python', 'Cryptography', 'Modular Arithmetic', 'Linear Algebra'],
    metrics: 'Matrix determinant modulo 26, key validation, step-by-step cipher breakdown',
    highlights: [
      'Implementasi matematis Hill Cipher matriks 2x2 dan 3x3 dengan invers modular',
      'Visualisasi algoritma Playfair Cipher 5x5 key matrix',
      'Automated key stream generator untuk Vigenère Cipher',
      'Validasi integritas input dan penanganan karakter non-alfabetik'
    ],
    demoUrl: null,
    repoUrl: 'https://github.com/RobertusWilliamSusanto/Tugas-Proyek-Kriptografi-Klasik'
  },
  'portfolio': {
    id: 'portfolio',
    title: 'Digital Portfolio & Web Applications',
    badge: 'Next.js & Tailwind',
    category: 'FRONTEND & WEB SUITE',
    description: 'Personal portfolio dan automated To-Do list dikembangkan dengan arsitektur web modern, component-driven design, dan typed data contract.',
    techStack: ['Astro', 'TypeScript', 'Preact', 'Tailwind CSS', 'Vercel'],
    metrics: 'Lighthouse mobile 99+, zero layout shift (CLS < 0.002), <10KB hydrated JS',
    highlights: [
      'Astro 5 SSG architecture dengan on-demand Preact islands hydration',
      'Strict Zod schema validation untuk data profil dan portofolio',
      'Compositor-only motion system dengan 100% prefers-reduced-motion support',
      'Modern dark/light theme switching tanpa Flash of Unstyled Content (FOUC)'
    ],
    demoUrl: 'https://myportfolio-zeta-peach-42.vercel.app',
    repoUrl: 'https://github.com/RobertusWilliamSusanto/Myportfolio'
  },
  'expense-tracker': {
    id: 'expense-tracker',
    title: 'Expense Tracker & Automation Tools',
    badge: 'TOOLING & AUTOMATION',
    category: 'TOOLING',
    description: 'Aplikasi pelacak pengeluaran otomatis dan perkakas produktivitas berbasis Python untuk pembukuan terstruktur dan penganggaran keuangan pribadi.',
    techStack: ['Python', 'Data Management', 'Automation', 'Vercel'],
    metrics: 'Structured bookkeeping ledger, automated budget calculations',
    highlights: [
      'Automated categorization algoritma untuk pencatatan pengeluaran',
      'Data parsing dan export ke format spreadsheet terstruktur',
      'Visual summary analytics untuk evaluasi anggaran bulanan',
      'Clean responsive user interface untuk input transaksi cepat'
    ],
    demoUrl: 'https://expense-tracker-six-sigma-30.vercel.app',
    repoUrl: null
  }
};

export default function ProjectModal() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const closeModal = () => {
    if (dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close();
    }
    setSelectedId(null);
    document.body.style.overflow = '';
  };

  const handleDialogClose = () => {
    setSelectedId(null);
    document.body.style.overflow = '';
  };

  useEffect(() => {
    if (selectedId && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
      document.body.style.overflow = 'hidden';
    }
  }, [selectedId]);

  useEffect(() => {
    const handleTrigger = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-project-trigger]');
      if (target) {
        const pid = target.getAttribute('data-project-trigger');
        if (pid && PROJECT_DETAILS[pid]) {
          e.preventDefault();
          setSelectedId(pid);
        }
      }
    };

    document.addEventListener('click', handleTrigger);
    return () => document.removeEventListener('click', handleTrigger);
  }, []);

  const project = selectedId ? PROJECT_DETAILS[selectedId] : null;

  return (
    <dialog
      ref={dialogRef}
      class="backdrop:bg-black/80 backdrop:backdrop-blur-md bg-surface-container border border-outline-variant/40 rounded-2xl p-0 max-w-2xl w-[92vw] text-on-surface shadow-2xl m-auto z-[200] focus:outline-none"
      onClose={handleDialogClose}
      onCancel={handleDialogClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) closeModal();
      }}
      aria-modal="true"
      aria-labelledby={project ? "project-dialog-title" : undefined}
    >
      {project && (
        <div class="p-6 md:p-8 flex flex-col gap-6 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div class="flex items-start justify-between gap-4 border-b border-outline-variant/20 pb-4">
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded bg-secondary-container text-secondary-fixed font-mono text-[11px] font-semibold">
                  {project.badge}
                </span>
                <span class="font-mono text-[11px] text-outline uppercase tracking-wider">
                  {project.category}
                </span>
              </div>
              <h2 id="project-dialog-title" class="text-xl md:text-2xl font-bold text-primary">
                {project.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={closeModal}
              class="w-10 h-10 min-w-[40px] rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:bg-surface-bright flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          {/* Description */}
          <p class="text-sm md:text-base text-on-surface-variant leading-relaxed">
            {project.description}
          </p>

          {/* Metrics Pill */}
          <div class="p-3.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-center gap-2.5 font-mono text-xs">
            <span class="text-secondary shrink-0 font-bold">&gt;</span>
            <span class="text-on-surface font-medium">{project.metrics}</span>
          </div>

          {/* Key Architectural Highlights */}
          <div class="flex flex-col gap-2.5">
            <h3 class="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
              Technical Architecture Highlights
            </h3>
            <ul class="flex flex-col gap-2 text-xs md:text-sm text-on-surface-variant list-none p-0 m-0">
              {project.highlights.map((h, i) => (
                <li key={i} class="flex items-start gap-2">
                  <span class="text-secondary shrink-0 mt-0.5">•</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack */}
          <div class="flex flex-col gap-2">
            <h3 class="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
              Technologies &amp; Libraries
            </h3>
            <div class="flex flex-wrap gap-1.5">
              {project.techStack.map((tech, i) => (
                <span key={i} class="px-2.5 py-1 rounded bg-surface-container-high text-on-surface font-mono text-[11px]">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Links & Actions */}
          <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-outline-variant/20">
            <div class="flex items-center gap-3">
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors min-h-[40px]"
                >
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                  </svg>
                  <span>Live App / Portal</span>
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-surface-container-high text-on-surface text-xs font-medium hover:bg-surface-bright transition-colors min-h-[40px] border border-outline-variant/30"
                >
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2A10 10 0 002 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
                  </svg>
                  <span>Repository</span>
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={closeModal}
              class="text-xs text-outline hover:text-on-surface font-mono py-2 cursor-pointer"
            >
              [ESC to close]
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}