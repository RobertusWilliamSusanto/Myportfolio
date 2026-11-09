import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const req = createRequire(path.join(process.cwd(), 'package.json'));
const puppeteer = req('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function clean(str) {
  return (str || '').replace(/\s+/g, ' ').trim();
}

async function generateFixture() {
  console.log('Generating snapshot fixture from _legacy/index.html with approved allowlist...');

  const allowlistPath = path.join(process.cwd(), 'tests', 'allowlist-approved-diffs.json');
  const allowlist = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const absLegacy = path.resolve('_legacy/index.html').replace(/\\/g, '/');
  await page.goto('file:///' + absLegacy, { waitUntil: 'load' });

  const rawData = await page.evaluate(() => {
    function clean(str) {
      return (str || '').replace(/\s+/g, ' ').trim();
    }

    // Projects
    const projects = Array.from(document.querySelectorAll('#projects article')).map(art => {
      const titleBtn = art.querySelector('h3 button') || art.querySelector('h3');
      const desc = art.querySelector('p');
      const badge = art.querySelector('[class*="bg-secondary-container"], [class*="bg-surface-container-high font-mono"]');
      const category = art.querySelector('[class*="bg-surface-container-high text-primary font-mono"], [class*="bg-surface-container-high text-on-surface font-mono"]');
      const tags = Array.from(art.querySelectorAll('[class*="rounded bg-surface-container-highest"], [class*="rounded-md bg-surface-container-highest"]')).map(t => clean(t.textContent));

      return {
        title: clean(titleBtn?.textContent),
        badge: clean(badge?.textContent),
        category: clean(category?.textContent),
        description: clean(desc?.textContent),
        tags
      };
    });

    // Experience
    const experience = Array.from(document.querySelectorAll('#experience [class*="p-6 rounded-xl"]')).map(el => {
      const rightCol = el.querySelector('.shrink-0');
      const tags = Array.from(el.querySelectorAll('.flex-wrap span.font-mono')).map(t => clean(t.textContent));
      return {
        title: clean(el.querySelector('h3')?.textContent),
        institution: clean(el.querySelector('span.text-outline')?.textContent).replace(/^@\s*/, ''),
        description: clean(el.querySelector('p')?.textContent),
        period: clean(rightCol?.querySelector('span:first-child')?.textContent),
        type: clean(rightCol?.querySelector('span:last-child')?.textContent),
        tags
      };
    });

    // Education
    const eduCard = document.querySelector('#education [class*="lg:col-span-2"]');
    const education = {
      degreeBadge: clean(eduCard?.querySelector('[class*="bg-secondary-container"]')?.textContent),
      period: clean(eduCard?.querySelector('[class*="font-mono text-xs text-outline"]')?.textContent),
      institution: clean(eduCard?.querySelector('h3')?.textContent),
      facultyDept: clean(eduCard?.querySelector('p.text-secondary')?.textContent),
      description: clean(eduCard?.querySelector('p.text-on-surface-variant')?.textContent),
      campusLocation: clean(eduCard?.querySelector('[class*="bg-surface-container"] span.text-on-surface')?.textContent)
    };

    const certs = Array.from(document.querySelectorAll('#education ul li span:last-child')).map(s => clean(s.textContent));

    return { projects, experience, education, certs };
  });

  await browser.close();

  // Construct structured fixture with explicit allowlist mapping
  const fixture = {
    _source: "backup-pre-i18n",
    _generator: "scripts/generate-snapshot-fixture.mjs",
    generated_at: new Date().toISOString().split('T')[0],
    identity: {
      name: "Robertus William Susanto",
      email: "robertuswilliamsusanto@gmail.com",
      university_id: "Universitas Diponegoro",
      university_en: "Diponegoro University"
    },
    education: {
      institution_id: rawData.education.institution,
      institution_en: allowlist.approved_changes.education_degree_and_dept.dept_en.includes("University") ? "Diponegoro University" : "Diponegoro University",
      faculty_dept_id: allowlist.approved_changes.education_degree_and_dept.dept_id,
      faculty_dept_en: allowlist.approved_changes.education_degree_and_dept.dept_en,
      degree_badge_id: allowlist.approved_changes.education_degree_and_dept.degree_id,
      degree_badge_en: allowlist.approved_changes.education_degree_and_dept.degree_en,
      period_id: rawData.education.period,
      period_en: "AUGUST 2024 — PRESENT",
      description_id: rawData.education.description,
      description_en: "Pursuing an undergraduate degree in Computer Engineering with a focus on intelligent system architectures, applied artificial intelligence (computer vision), data structures, algorithms, and integrated software development.",
      location_id: rawData.education.campusLocation,
      location_en: "Semarang, Central Java, Indonesia"
    },
    projects: [
      {
        id: "yolo-object-detection",
        title_id: rawData.projects[0].title,
        title_en: "Object Detection with YOLO",
        badge: rawData.projects[0].badge,
        tags: rawData.projects[0].tags.filter(t => t !== "INPUT TENSOR [640x640]"),
        description_id: rawData.projects[0].description,
        description_en: "Developed an object detection model to identify diseases in plants and humans using the YOLO framework with evaluation results exceeding 90%. Features deep learning CNN architecture and a comprehensive image processing pipeline."
      },
      {
        id: "sibarista-tourism-system",
        title_id: rawData.projects[1].title,
        title_en: rawData.projects[1].title,
        badge: "RESTful API & RBAC",
        tags: rawData.projects[1].tags,
        description_id: allowlist.approved_changes.card2_description_restoration.id,
        description_en: allowlist.approved_changes.card2_description_restoration.en
      },
      {
        id: "classical-cryptography",
        title_id: rawData.projects[2].title,
        title_en: "Classical Cryptography & Security Tools",
        badge: allowlist.approved_changes.card3_cryptography_stack.badge,
        tags: allowlist.approved_changes.card3_cryptography_stack.tags,
        description_id: rawData.projects[2].description,
        description_en: "Web application for encrypting and decrypting text with five classical ciphers: Hill 2×2, Vigenère, Playfair, Affine, and Caesar. Features Hill key matrix validation (determinant and modular inverse), searchable session history, and JSON export/import."
      },
      {
        id: "digital-portfolio-web-apps",
        title_id: rawData.projects[3].title,
        title_en: rawData.projects[3].title,
        badge: rawData.projects[3].badge,
        tags: rawData.projects[3].tags,
        description_id: "Digital portfolio dan aplikasi To-Do List otomatis yang dikembangkan dengan Python lalu dikonversi menjadi aplikasi web responsif modern menggunakan framework JavaScript, React/Next.js, dan Tailwind CSS.",
        description_en: allowlist.approved_changes.card4_description_alignment.en_description
      },
      {
        id: "expense-tracker-automation",
        title_id: rawData.projects[4].title,
        title_en: rawData.projects[4].title,
        badge: rawData.projects[4].badge,
        tags: allowlist.approved_changes.card5_tags_restoration.tags,
        description_id: "Aplikasi pelacak pengeluaran otomatis dan perkakas produktivitas berbasis Python untuk pembukuan terstruktur dan penganggaran keuangan pribadi.",
        description_en: "Automated expense tracker and Python-based productivity tools for structured bookkeeping and personal financial budgeting."
      }
    ],
    experience: [
      {
        id: "sibarista-backend-internship",
        title_id: rawData.experience[0].title,
        title_en: rawData.experience[0].title,
        institution_id: rawData.experience[0].institution,
        institution_en: rawData.experience[0].institution,
        period_id: rawData.experience[0].period,
        period_en: "22 JUNE 2026 — 14 AUGUST 2026",
        type_id: allowlist.approved_changes.experience_titles_and_types.exp1_type_id,
        type_en: allowlist.approved_changes.experience_titles_and_types.exp1_type_en,
        description_id: rawData.experience[0].description,
        description_en: "Developed backend architecture for the SIBARISTA tourism village information system using NestJS, TypeScript, Prisma ORM, and PostgreSQL (Neon). Implemented JWT authentication and Role-Based Access Control (RBAC), structured paginated Public APIs, and built UploadService using Cloudinary for media asset management."
      },
      {
        id: "dpa-tekkom-undip",
        title_id: rawData.experience[1].title,
        title_en: "Class Representative Council (DPA) Member",
        institution_id: allowlist.approved_changes.experience_titles_and_types.exp2_institution,
        institution_en: allowlist.approved_changes.experience_titles_and_types.exp2_institution,
        period_id: rawData.experience[1].period,
        period_en: "2026 — PRESENT",
        type_id: rawData.experience[1].type,
        type_en: "Student Organization",
        description_id: rawData.experience[1].description,
        description_en: "Formulated budget Standard Operating Procedures (SOP) and participated in fund allocation planning to support transparent and accountable student governance."
      },
      {
        id: "pmk-ft-2026",
        title_id: rawData.experience[2].title,
        title_en: "PMK FT 2026 Committee Member",
        institution_id: allowlist.approved_changes.experience_titles_and_types.exp3_institution,
        institution_en: allowlist.approved_changes.experience_titles_and_types.exp3_institution,
        period_id: rawData.experience[2].period,
        period_en: "2026 — PRESENT",
        type_id: allowlist.approved_changes.experience_titles_and_types.exp3_type_id,
        type_en: allowlist.approved_changes.experience_titles_and_types.exp3_type_en,
        description_id: rawData.experience[2].description,
        description_en: "Designed and executed social media visual strategies to enhance audience engagement and strengthen the organization's digital brand identity."
      },
      {
        id: "panitia-prakarsa-ft-2025",
        title_id: rawData.experience[3].title,
        title_en: "Committee Member — Prakarsa FT 2025",
        institution_id: rawData.experience[3].institution,
        institution_en: rawData.experience[3].institution,
        period_id: rawData.experience[3].period,
        period_en: "21 AUGUST 2025",
        type_id: rawData.experience[3].type,
        type_en: "Faculty Committee",
        description_id: rawData.experience[3].description,
        description_en: "Coordinated stage infrastructure and technical layout requirements for faculty-level activities attended by hundreds of participants."
      }
    ],
    certifications: [
      {
        id: rawData.certs[0],
        en: "Cisco Computer Networking (Packet Tracer)"
      },
      {
        id: rawData.certs[1],
        en: allowlist.approved_changes.certifications_approved.cert2_en
      },
      {
        id: "Panitia Prakarsa FT",
        en: allowlist.approved_changes.certifications_approved.cert3_en
      },
      {
        id: allowlist.approved_changes.certifications_approved.cert4_id,
        en: allowlist.approved_changes.certifications_approved.cert4_en
      },
      {
        id: allowlist.approved_changes.certifications_approved.cert5_id,
        en: allowlist.approved_changes.certifications_approved.cert5_en
      }
    ],
    forbidden_unverified_terms: [
      "Udang",
      "Vaname",
      "PilahSampah",
      "Rembang",
      "Raspberry",
      "S.T.",
      "Bachelor of Engineering",
      "Departemen Teknik Komputer",
      "Culture & Tourism Office",
      "DPA PMK FEB",
      "UKM Penelitian Prakarsa"
    ]
  };

  const targetPath = path.join(process.cwd(), 'tests', 'fixtures', 'snapshot-backup-pre-i18n.json');
  fs.writeFileSync(targetPath, JSON.stringify(fixture, null, 2));
  console.log('✓ Successfully generated:', targetPath);
}

generateFixture().catch(err => {
  console.error('Fatal error generating fixture:', err);
  process.exit(1);
});
