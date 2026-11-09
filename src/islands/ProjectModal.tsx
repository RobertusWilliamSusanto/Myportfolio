import { useState, useEffect, useRef } from 'preact/hooks';

interface LocalizedText {
  id: string;
  en: string;
}

interface ProjectDetail {
  id: string;
  title: LocalizedText;
  badge: LocalizedText;
  category: LocalizedText;
  description: LocalizedText;
  techStack: string[];
  metrics: LocalizedText;
  highlights: { id: string[]; en: string[] };
  demoUrl?: string | null;
  repoUrl?: string | null;
}

const PROJECT_DETAILS: Record<string, ProjectDetail> = {
  'yolo': {
    id: 'yolo',
    title: {
      id: 'Object Detection dengan YOLO',
      en: 'Object Detection with YOLO'
    },
    badge: {
      id: '>90% EVALUATION',
      en: '>90% EVALUATION'
    },
    category: {
      id: 'AI / COMPUTER VISION',
      en: 'AI / COMPUTER VISION'
    },
    description: {
      id: 'Mengembangkan model deteksi objek untuk mengidentifikasi penyakit pada tumbuhan dan manusia menggunakan framework YOLO dengan hasil evaluasi di atas 90%. Dilengkapi arsitektur CNN deep learning dan pipeline image processing komprehensif.',
      en: 'Developed an object detection model to identify diseases in plants and humans using the YOLO framework with evaluation results exceeding 90%. Features deep learning CNN architecture and a comprehensive image processing pipeline.'
    },
    techStack: ['YOLO', 'Python', 'CNN', 'Computer Vision', 'PyTorch', 'OpenCV'],
    metrics: {
      id: '>90% evaluasi pada eksperimen, regresi bounding box multi-kelas',
      en: '>90% evaluation in experiments, multi-class bounding box regression'
    },
    highlights: {
      id: [
        'Implementasi arsitektur deep learning CNN dengan transfer learning',
        'Pipeline pra-pemrosesan data, pelabelan, dan augmentasi citra',
        'Evaluasi model dengan presisi tinggi (>90%) pada beragam kondisi',
        'Optimasi latensi inferensi untuk pemrosesan visual real-time'
      ],
      en: [
        'CNN deep learning architecture implementation with transfer learning',
        'Dataset preprocessing, labeling, and image augmentation pipeline',
        'High-accuracy model evaluation (>90%) across diverse test scenarios',
        'Inference latency optimization for real-time visual processing'
      ]
    },
    demoUrl: null,
    repoUrl: null
  },
  'sibarista': {
    id: 'sibarista',
    title: {
      id: 'SIBARISTA Tourism Info System',
      en: 'SIBARISTA Tourism Info System'
    },
    badge: {
      id: 'RESTful API & RBAC',
      en: 'RESTful API & RBAC'
    },
    category: {
      id: 'BACKEND & CLOUD',
      en: 'BACKEND & CLOUD'
    },
    description: {
      id: 'Komponen backend sistem informasi desa wisata SIBARISTA menggunakan NestJS, TypeScript, Prisma ORM, dan PostgreSQL (Neon). Mengimplementasikan autentikasi JWT dan Role-Based Access Control (RBAC), Public API dengan pagination, serta integrasi UploadService dengan Cloudinary.',
      en: 'Backend architecture for the SIBARISTA tourism village information system using NestJS, TypeScript, Prisma ORM, and PostgreSQL (Neon). Implements JWT authentication, Role-Based Access Control (RBAC), paginated Public API, and Cloudinary upload integration.'
    },
    techStack: ['NestJS', 'TypeScript', 'Prisma ORM', 'PostgreSQL', 'JWT', 'Cloudinary'],
    metrics: {
      id: 'Portal produksi aktif di Vercel dengan basis data serverless Neon',
      en: 'Production portal active on Vercel with Neon serverless database'
    },
    highlights: {
      id: [
        'Role-Based Access Control (RBAC) dengan JSON Web Token (JWT)',
        'Migrasi skema basis data dan relasi menggunakan Prisma ORM',
        'UploadService media terintegrasi dengan Cloudinary SDK',
        'Public REST API dengan paginasi dan validasi DTO'
      ],
      en: [
        'Role-Based Access Control (RBAC) with secure JSON Web Tokens',
        'Database schema migration and relational queries with Prisma ORM',
        'Media asset upload pipeline integrated with Cloudinary SDK',
        'Public REST API endpoints with pagination, filtering, and DTO validation'
      ]
    },
    demoUrl: 'https://sibarista-disbudpar.vercel.app',
    repoUrl: null
  },
  'kriptografi': {
    id: 'kriptografi',
    title: {
      id: 'Kriptografi Klasik & Security Tools',
      en: 'Classical Cryptography & Security Tools'
    },
    badge: {
      id: 'REACT + TS',
      en: 'REACT + TS'
    },
    category: {
      id: 'SECURITY',
      en: 'SECURITY'
    },
    description: {
      id: 'Aplikasi web untuk enkripsi dan dekripsi teks dengan lima cipher klasik: Hill 2×2, Vigenère, Playfair, Affine, dan Caesar. Dilengkapi validasi matriks kunci Hill (determinan dan invers modular), riwayat sesi yang bisa dicari, serta ekspor/impor JSON.',
      en: 'Web application for encrypting and decrypting text with five classical ciphers: Hill 2×2, Vigenère, Playfair, Affine, and Caesar. Features Hill key matrix validation (determinant and modular inverse), searchable session history, and JSON export/import.'
    },
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Cryptography', 'Classical Ciphers'],
    metrics: {
      id: 'Validasi determinan dan invers modular K⁻¹ mod 26, riwayat sesi pencarian & JSON I/O',
      en: 'Modular inverse K⁻¹ mod 26 validation, searchable session history & JSON I/O'
    },
    highlights: {
      id: [
        'Enkripsi dan dekripsi 5 cipher: Hill 2×2, Vigenère, Playfair, Affine, Caesar',
        'Validasi otomatis determinan dan perhitungan invers modular matriks kunci Hill',
        'Riwayat sesi interaktif: filter, pencarian, salin, muat ulang, dan hapus',
        'Fitur ekspor riwayat ke file JSON dan impor data lewat drag & drop'
      ],
      en: [
        'Encryption and decryption for 5 ciphers: Hill 2×2, Vigenère, Playfair, Affine, Caesar',
        'Automated determinant check and modular inverse K⁻¹ matrix calculation for Hill 2×2',
        'Interactive session history: search, filter, copy, reload, and delete',
        'Export history to JSON file and import via drag-and-drop'
      ]
    },
    demoUrl: 'https://tugas-proyek-kriptografi-klasik.vercel.app',
    repoUrl: 'https://github.com/RobertusWilliamSusanto/Tugas-Proyek-Kriptografi-Klasik'
  },
  'portfolio': {
    id: 'portfolio',
    title: {
      id: 'Digital Portfolio & Web Applications',
      en: 'Digital Portfolio & Web Applications'
    },
    badge: {
      id: 'Next.js & Tailwind',
      en: 'Next.js & Tailwind'
    },
    category: {
      id: 'FRONTEND & WEB SUITE',
      en: 'FRONTEND & WEB SUITE'
    },
    description: {
      id: 'Digital portfolio dan aplikasi To-Do List otomatis yang dikembangkan dengan Python lalu dikonversi menjadi aplikasi web responsif modern menggunakan framework JavaScript, React/Next.js, dan Tailwind CSS.',
      en: 'Personal digital portfolio and automated To-Do list app, developed in Python and converted into modern responsive web applications using JavaScript, React/Next.js, and Tailwind CSS.'
    },
    techStack: ['JavaScript', 'React/Next.js', 'Python', 'Tailwind CSS', 'Vercel'],
    metrics: {
      id: 'Aplikasi portofolio dan produktivitas responsif dengan state lokal persisten',
      en: 'Responsive portfolio and productivity web apps with persistent state'
    },
    highlights: {
      id: [
        'Desain antarmuka modern responsif dengan Tailwind CSS',
        'Konversi fungsionalitas logika otomatisasi Python ke arsitektur web modern',
        'Manajemen status interaktif untuk daftar tugas dan pencatatan',
        'Struktur kode modular berbasis komponen yang mudah dikembangkan'
      ],
      en: [
        'Modern responsive UI design with Tailwind CSS utility classes',
        'Conversion of Python automation logic into modern web applications',
        'Interactive state management for tasks and user records',
        'Modular component-based architecture for maintainability'
      ]
    },
    demoUrl: 'https://myportfolio-zeta-peach-42.vercel.app',
    repoUrl: 'https://github.com/RobertusWilliamSusanto/Myportfolio'
  },
  'expense-tracker': {
    id: 'expense-tracker',
    title: {
      id: 'Expense Tracker & Automation Tools',
      en: 'Expense Tracker & Automation Tools'
    },
    badge: {
      id: 'TOOLING & AUTOMATION',
      en: 'TOOLING & AUTOMATION'
    },
    category: {
      id: 'TOOLING',
      en: 'TOOLING'
    },
    description: {
      id: 'Aplikasi pelacak pengeluaran otomatis dan perkakas produktivitas berbasis Python untuk pembukuan terstruktur dan penganggaran keuangan pribadi.',
      en: 'Automated expense tracker and Python-based productivity tools for structured bookkeeping and personal financial budgeting.'
    },
    techStack: ['Python', 'Data Management', 'Automation', 'Vercel'],
    metrics: {
      id: 'Pembukuan terstruktur, kalkulasi saldo dan anggaran otomatis',
      en: 'Structured ledger bookkeeping, automated balance and budget calculations'
    },
    highlights: {
      id: [
        'Algoritma kategorisasi otomatis untuk pencatatan pengeluaran',
        'Parsing data dan ekspor ke format tabel data terstruktur',
        'Ringkasan analitik visual untuk evaluasi anggaran berkala',
        'Antarmuka bersih dan responsif untuk input transaksi cepat'
      ],
      en: [
        'Automated categorization algorithm for tracking expenses',
        'Data parsing and export to structured tabular formats',
        'Visual summary analytics for periodic budget tracking',
        'Clean responsive user interface for quick transaction inputs'
      ]
    },
    demoUrl: 'https://expense-tracker-six-sigma-30.vercel.app',
    repoUrl: null
  }
};

interface Props {
  lang?: 'id' | 'en';
}

export default function ProjectModal({ lang = 'id' }: Props) {
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

  const closeAria = lang === 'id' ? 'Tutup dialog modal' : 'Close dialog';
  const highlightsLabel = lang === 'id' ? 'Sorotan Arsitektur Teknis' : 'Technical Architecture Highlights';
  const techLabel = lang === 'id' ? 'Teknologi & Pustaka' : 'Technologies & Libraries';
  const escLabel = lang === 'id' ? '[Tekan ESC untuk menutup]' : '[ESC to close]';
  const liveLabel = lang === 'id' ? 'Buka Live Demo' : 'Live App / Portal';
  const repoLabel = lang === 'id' ? 'Lihat Source Code' : 'Repository';

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
                  {project.badge[lang] || project.badge.id}
                </span>
                <span class="font-mono text-[11px] text-outline uppercase tracking-wider">
                  {project.category[lang] || project.category.id}
                </span>
              </div>
              <h2 id="project-dialog-title" class="text-xl md:text-2xl font-bold text-primary">
                {project.title[lang] || project.title.id}
              </h2>
            </div>
            <button
              type="button"
              onClick={closeModal}
              class="w-10 h-10 min-w-[40px] rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:bg-surface-bright flex items-center justify-center transition-colors cursor-pointer"
              aria-label={closeAria}
            >
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          {/* Description */}
          <p class="text-sm md:text-base text-on-surface-variant leading-relaxed">
            {project.description[lang] || project.description.id}
          </p>

          {/* Metrics Pill */}
          <div class="p-3.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-center gap-2.5 font-mono text-xs">
            <span class="text-secondary shrink-0 font-bold">&gt;</span>
            <span class="text-on-surface font-medium">{project.metrics[lang] || project.metrics.id}</span>
          </div>

          {/* Key Architectural Highlights */}
          <div class="flex flex-col gap-2.5">
            <h3 class="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
              {highlightsLabel}
            </h3>
            <ul class="flex flex-col gap-2 text-xs md:text-sm text-on-surface-variant list-none p-0 m-0">
              {(project.highlights[lang] || project.highlights.id).map((h, i) => (
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
              {techLabel}
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
                  <span>{liveLabel}</span>
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
                  <span>{repoLabel}</span>
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={closeModal}
              class="text-xs text-outline hover:text-on-surface font-mono py-2 cursor-pointer"
            >
              {escLabel}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
