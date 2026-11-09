import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const req = createRequire(path.join(process.cwd(), 'package.json'));
const puppeteer = req('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const fixturePath = path.join(process.cwd(), 'tests', 'fixtures', 'snapshot-backup-pre-i18n.json');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

async function extractPageData(filePath) {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const absPath = path.resolve(filePath).replace(/\\/g, '/');
  await page.goto('file:///' + absPath, { waitUntil: 'load' });

  const rawHtml = await page.content();
  const data = await page.evaluate(() => {
    function clean(str) {
      return (str || '').replace(/\s+/g, ' ').trim();
    }

    const projects = Array.from(document.querySelectorAll('#projects article')).map(art => ({
      title: clean(art.querySelector('h3')?.textContent),
      badge: clean(art.querySelector('[class*="font-mono text-xs"], [class*="font-mono text-[11px]"]')?.textContent),
      tags: Array.from(art.querySelectorAll('span.font-mono')).map(s => clean(s.textContent))
    }));

    const experiences = Array.from(document.querySelectorAll('#experience [class*="p-6 rounded-xl"]')).map(el => {
      const rightCol = el.querySelector('.shrink-0');
      return {
        title: clean(el.querySelector('h3')?.textContent),
        institution: clean(el.querySelector('span.text-outline')?.textContent).replace(/^@\s*/, ''),
        period: clean(rightCol?.querySelector('span:first-child')?.textContent),
        type: clean(rightCol?.querySelector('span:last-child')?.textContent)
      };
    });

    const education = {
      institution: clean(document.querySelector('#education h3')?.textContent),
      facultyDept: clean(document.querySelector('#education p.text-secondary')?.textContent),
      period: clean(document.querySelector('#education [class*="text-outline"]')?.textContent)
    };

    const certifications = Array.from(document.querySelectorAll('#education ul li span:last-child')).map(s => clean(s.textContent));

    return { projects, experiences, education, certifications };
  });

  await browser.close();
  return { data, rawHtml };
}

async function runParityAudit() {
  console.log('=== STARTING CONTENT PARITY AUDIT ===');
  const errors = [];

  const idRes = await extractPageData('dist/index.html');
  const enRes = await extractPageData('dist/en/index.html');

  // Check 1: Forbidden unverified terms
  console.log('1. Checking forbidden unverified terms...');
  for (let term of fixture.forbidden_unverified_terms) {
    if (idRes.rawHtml.includes(term)) {
      errors.push(`[FORBIDDEN TERM] Term "${term}" found in dist/index.html`);
    }
    if (enRes.rawHtml.includes(term)) {
      errors.push(`[FORBIDDEN TERM] Term "${term}" found in dist/en/index.html`);
    }
  }

  // Check 2: Projects count and exact parity
  console.log('2. Checking projects parity...');
  if (idRes.data.projects.length !== 5) {
    errors.push(`Expected 5 projects on ID page, got ${idRes.data.projects.length}`);
  }
  if (enRes.data.projects.length !== 5) {
    errors.push(`Expected 5 projects on EN page, got ${enRes.data.projects.length}`);
  }

  fixture.projects.forEach((fp, idx) => {
    const idProj = idRes.data.projects[idx];
    const enProj = enRes.data.projects[idx];

    if (idProj && idProj.title !== fp.title_id) {
      errors.push(`Project ${idx + 1} ID title mismatch: expected "${fp.title_id}", got "${idProj.title}"`);
    }
    if (enProj && enProj.title !== fp.title_en) {
      errors.push(`Project ${idx + 1} EN title mismatch: expected "${fp.title_en}", got "${enProj.title}"`);
    }

    if (idProj && !idProj.badge.includes(fp.badge)) {
      errors.push(`Project ${idx + 1} ID badge mismatch: expected to include "${fp.badge}", got "${idProj.badge}"`);
    }

    for (let tag of fp.tags) {
      if (idProj && !idProj.tags.includes(tag)) {
        errors.push(`Project ${idx + 1} ID tag missing: "${tag}"`);
      }
      if (enProj && !enProj.tags.includes(tag)) {
        errors.push(`Project ${idx + 1} EN tag missing: "${tag}"`);
      }
    }
  });

  // Check 3: Experience count and exact parity
  console.log('3. Checking experience parity...');
  if (idRes.data.experiences.length !== 4) {
    errors.push(`Expected 4 experiences on ID page, got ${idRes.data.experiences.length}`);
  }
  if (enRes.data.experiences.length !== 4) {
    errors.push(`Expected 4 experiences on EN page, got ${enRes.data.experiences.length}`);
  }

  fixture.experience.forEach((fe, idx) => {
    const idExp = idRes.data.experiences[idx];
    const enExp = enRes.data.experiences[idx];

    if (idExp && idExp.title !== fe.title_id) {
      errors.push(`Experience ${idx + 1} ID title mismatch: expected "${fe.title_id}", got "${idExp.title}"`);
    }
    if (enExp && enExp.title !== fe.title_en) {
      errors.push(`Experience ${idx + 1} EN title mismatch: expected "${fe.title_en}", got "${enExp.title}"`);
    }
    if (idExp && idExp.institution !== fe.institution_id) {
      errors.push(`Experience ${idx + 1} ID institution mismatch: expected "${fe.institution_id}", got "${idExp.institution}"`);
    }
    if (enExp && enExp.institution !== fe.institution_en) {
      errors.push(`Experience ${idx + 1} EN institution mismatch: expected "${fe.institution_en}", got "${enExp.institution}"`);
    }
    if (idExp && idExp.period !== fe.period_id) {
      errors.push(`Experience ${idx + 1} ID period mismatch: expected "${fe.period_id}", got "${idExp.period}"`);
    }
    if (enExp && enExp.period !== fe.period_en) {
      errors.push(`Experience ${idx + 1} EN period mismatch: expected "${fe.period_en}", got "${enExp.period}"`);
    }
    if (idExp && idExp.type !== fe.type_id) {
      errors.push(`Experience ${idx + 1} ID type mismatch: expected "${fe.type_id}", got "${idExp.type}"`);
    }
    if (enExp && enExp.type !== fe.type_en) {
      errors.push(`Experience ${idx + 1} EN type mismatch: expected "${fe.type_en}", got "${enExp.type}"`);
    }
  });

  // Check 4: Education
  console.log('4. Checking education parity...');
  if (idRes.data.education.institution !== fixture.education.institution_id) {
    errors.push(`Education ID institution mismatch: expected "${fixture.education.institution_id}", got "${idRes.data.education.institution}"`);
  }
  if (enRes.data.education.institution !== fixture.education.institution_en) {
    errors.push(`Education EN institution mismatch: expected "${fixture.education.institution_en}", got "${enRes.data.education.institution}"`);
  }
  if (idRes.data.education.facultyDept !== fixture.education.faculty_dept_id) {
    errors.push(`Education ID facultyDept mismatch: expected "${fixture.education.faculty_dept_id}", got "${idRes.data.education.facultyDept}"`);
  }
  if (enRes.data.education.facultyDept !== fixture.education.faculty_dept_en) {
    errors.push(`Education EN facultyDept mismatch: expected "${fixture.education.faculty_dept_en}", got "${enRes.data.education.facultyDept}"`);
  }

  // Check 5: Certifications
  console.log('5. Checking certifications parity...');
  const lkkmpdId = idRes.data.certifications.find(c => c.includes('LKKMPD'));
  const lkkmpdEn = enRes.data.certifications.find(c => c.includes('LKKMPD'));
  if (!lkkmpdId || !lkkmpdId.includes('Pra-Dasar')) {
    errors.push(`LKKMPD on ID page missing "Pra-Dasar": got "${lkkmpdId}"`);
  }
  if (!lkkmpdEn || !lkkmpdEn.includes('Pre-Basic')) {
    errors.push(`LKKMPD on EN page missing "Pre-Basic": got "${lkkmpdEn}"`);
  }

  const prakarsaCertId = idRes.data.certifications.find(c => c.includes('Panitia Prakarsa FT'));
  if (prakarsaCertId && prakarsaCertId.includes('(Fakultas Teknik)')) {
    errors.push(`Panitia Prakarsa FT on ID page should NOT have "(Fakultas Teknik)": got "${prakarsaCertId}"`);
  }

  console.log('=== AUDIT RESULT ===');
  if (errors.length > 0) {
    console.error(`FAILED with ${errors.length} content disparity error(s):`);
    errors.forEach((err, i) => console.error(`  ${i + 1}. ${err}`));
    process.exit(1);
  } else {
    console.log('ALL CONTENT PARITY CHECKS PASSED: 100% faithful to backup-pre-i18n snapshot!');
  }
}

runParityAudit().catch(err => {
  console.error('Fatal error running parity audit:', err);
  process.exit(1);
});
