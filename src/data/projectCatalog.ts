import { projects, getLocalized, type Lang } from './profile';

export interface ProjectCatalogItem {
  id: string;
  triggerId: string;
  domains: string[];
  title: string;
  badge: string;
  category: string;
  description: string;
  techStack: string[];
  metrics: string;
  highlights: string[];
  demoUrl: string | null;
  todoUrl: string | null;
  repoUrl: string | null;
}

const SPECS_MAP: Record<string, { metrics: { id: string; en: string }; highlights: { id: string[]; en: string[] } }> = {
  yolo: {
    metrics: {
      id: '>90% evaluasi pada eksperimen, regresi bounding box multi-kelas',
      en: '>90% evaluation in experiments, multi-class bounding box regression'
    },
    highlights: {
      id: ['Arsitektur deep learning CNN dengan transfer learning', 'Pipeline pra-pemrosesan data, pelabelan, & augmentasi citra'],
      en: ['CNN deep learning architecture with transfer learning', 'Dataset preprocessing, labeling, & image augmentation pipeline']
    }
  },
  sibarista: {
    metrics: {
      id: 'Portal produksi aktif di Vercel dengan basis data serverless Neon',
      en: 'Production portal active on Vercel with Neon serverless database'
    },
    highlights: {
      id: ['Role-Based Access Control (RBAC) dengan JWT', 'Migrasi skema & relasi Prisma ORM + Cloudinary SDK'],
      en: ['Role-Based Access Control (RBAC) with JWT', 'Prisma ORM relational schema + Cloudinary SDK uploads']
    }
  },
  kriptografi: {
    metrics: {
      id: 'Validasi determinan & invers modular K⁻¹ mod 26, riwayat sesi & JSON I/O',
      en: 'Modular inverse K⁻¹ mod 26 validation, searchable history & JSON I/O'
    },
    highlights: {
      id: ['5 cipher: Hill 2×2, Vigenère, Playfair, Affine, Caesar', 'Ekspor/impor JSON riwayat sesi via drag & drop'],
      en: ['5 ciphers: Hill 2×2, Vigenère, Playfair, Affine, Caesar', 'JSON session history export/import via drag-and-drop']
    }
  },
  portfolio: {
    metrics: {
      id: 'Aplikasi portofolio dan produktivitas responsif dengan state lokal persisten',
      en: 'Responsive portfolio and productivity web apps with persistent state'
    },
    highlights: {
      id: ['Antarmuka responsif Tailwind CSS + komponen modular', 'Konversi logika otomatisasi Python ke aplikasi web modern'],
      en: ['Responsive Tailwind CSS UI + modular components', 'Conversion of Python automation logic to modern web apps']
    }
  },
  'expense-tracker': {
    metrics: {
      id: 'Pembukuan terstruktur, kalkulasi saldo dan anggaran otomatis',
      en: 'Structured ledger bookkeeping, automated balance and budget calculations'
    },
    highlights: {
      id: ['Kategorisasi otomatis & ekspor ke format tabel terstruktur', 'Ringkasan analitik visual untuk evaluasi anggaran berkala'],
      en: ['Automated categorization & tabular format export', 'Visual summary analytics for periodic budget tracking']
    }
  },
  partsbin: {
    metrics: {
      id: 'Kalkulasi kesiapan rakit BOM live, deteksi stok menipis, & dukungan Workbox PWA',
      en: 'Live BOM build readiness calculation, low-stock alerts, & Workbox PWA support'
    },
    highlights: {
      id: ['Pencarian nama/laci (Bin), filter 7 kategori, kontrol stok cepat', 'Kalkulator BOM live, daftar defisit belanja & ekspor PDF'],
      en: ['Name/bin drawer search, 7-category filtering, quick stock controls', 'Live BOM calculator, shortage shopping list & PDF export']
    }
  }
};

const TRIGGER_MAP: Record<string, string> = {
  'yolo-object-detection': 'yolo',
  'sibarista-tourism-system': 'sibarista',
  'kriptografi-klasik-security': 'kriptografi',
  'digital-portfolio-web-apps': 'portfolio',
  'expense-tracker-automation': 'expense-tracker',
  'partsbin-inventory-bom': 'partsbin'
};

const DOMAIN_MAP: Record<string, string[]> = {
  yolo: ['ai'],
  sibarista: ['backend'],
  kriptografi: ['security'],
  portfolio: ['web'],
  'expense-tracker': ['web'],
  partsbin: ['web', 'backend']
};

export function getPublicProjectCatalog(lang: Lang): ProjectCatalogItem[] {
  return projects
    .filter((p) => p.title?.public !== false)
    .map((p) => {
      const triggerId = TRIGGER_MAP[p.id] || p.id;
      const links = p.links || {};
      const demoEntry = links.live_demo || links.portfolio_live;
      const todoEntry = links.todo_live;
      const repoEntry = links.github;
      const specs = SPECS_MAP[triggerId];
      return {
        id: p.id,
        triggerId,
        domains: DOMAIN_MAP[triggerId] || ['web'],
        title: getLocalized(p.title, lang),
        badge: p.badge?.public ? getLocalized(p.badge, lang) : '',
        category: p.category?.public ? getLocalized(p.category, lang) : '',
        description: p.description?.public ? getLocalized(p.description, lang) : '',
        techStack: p.tech_stack?.public ? p.tech_stack.value : [],
        metrics: specs ? specs.metrics[lang] : '',
        highlights: specs ? specs.highlights[lang] : [],
        demoUrl: demoEntry?.public && demoEntry.url ? demoEntry.url : null,
        todoUrl: todoEntry?.public && todoEntry.url ? todoEntry.url : null,
        repoUrl: repoEntry?.public && repoEntry.url ? repoEntry.url : null
      };
    });
}
