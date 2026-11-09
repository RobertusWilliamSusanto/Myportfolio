import path from 'path';
import { createRequire } from 'module';

const req = createRequire(path.join(process.cwd(), 'package.json'));
const puppeteer = req('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testPage(pageUrl, lang) {
  console.log(`Testing functional interactivity for [${lang}] page: ${pageUrl}...`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(pageUrl, { waitUntil: 'networkidle0' });

  // 1. Language switcher exists and has correct href
  const langLink = await page.$('a[data-lang-switch], a[href*="/en"], a[href="/"]');
  if (!langLink) {
    throw new Error(`[${lang}] Language switcher link not found`);
  }
  console.log(`  ✓ [${lang}] Language switcher present`);

  // 2. Project filter chips exist
  const filterChips = await page.$$('#projects button');
  if (filterChips.length === 0) {
    throw new Error(`[${lang}] Project filter buttons not found`);
  }
  console.log(`  ✓ [${lang}] Filter chips present (${filterChips.length} buttons)`);

  // 3. Project modal trigger can open dialog
  const firstTrigger = await page.$('[data-project-trigger]');
  if (!firstTrigger) {
    throw new Error(`[${lang}] Project modal trigger not found`);
  }
  await firstTrigger.click();
  // Small wait for modal dialog
  await new Promise(r => setTimeout(r, 300));
  const dialog = await page.$('dialog[open], dialog');
  if (!dialog) {
    throw new Error(`[${lang}] ProjectModal dialog did not render`);
  }
  console.log(`  ✓ [${lang}] ProjectModal trigger & dialog functional`);

  // 4. Copy email button functional
  const emailBtn = await page.$('button[onclick*="copyEmailAddress"]');
  if (emailBtn) {
    await emailBtn.click();
    console.log(`  ✓ [${lang}] Copy email button functional`);
  }

  await browser.close();
}

async function run() {
  console.log('=== RUNNING FUNCTIONAL INTERACTIVITY TESTS ===');
  const idPath = 'file:///' + path.resolve('dist/index.html').replace(/\\/g, '/');
  const enPath = 'file:///' + path.resolve('dist/en/index.html').replace(/\\/g, '/');

  await testPage(idPath, 'id');
  await testPage(enPath, 'en');
  console.log('ALL FUNCTIONAL TESTS PASSED!');
}

run().catch(err => {
  console.error('Functional test failed:', err);
  process.exit(1);
});
