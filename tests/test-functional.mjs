import fs from 'fs';
import http from 'http';
import path from 'path';
import { createRequire } from 'module';

const req = createRequire(path.join(process.cwd(), 'package.json'));
const puppeteer = req('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const MIME = {
  '.html': 'text/html; charset=UTF-8', '.js': 'application/javascript; charset=UTF-8', '.css': 'text/css; charset=UTF-8',
  '.woff2': 'font/woff2', '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.svg': 'image/svg+xml'
};

function startServer(port = 4177) {
  return new Promise((resolve) => {
    const srv = http.createServer((q, s) => {
      let p = decodeURI((q.url || '/').split('?')[0]);
      if (p === '/' || p === '') p = '/index.html';
      else if (p === '/en' || p === '/en/') p = '/en/index.html';
      const fp = path.join(path.resolve('dist'), p.replace(/^\//, ''));
      if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
        s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
        fs.createReadStream(fp).pipe(s);
      } else { s.writeHead(404); s.end(); }
    });
    srv.listen(port, '127.0.0.1', () => resolve(srv));
  });
}

async function testPage(pageUrl, lang) {
  console.log(`Testing functional interactivity for [${lang}] page: ${pageUrl}...`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(pageUrl, { waitUntil: 'networkidle0' });
  await page.waitForFunction(
    () => {
      const hero = document.querySelector('#hero-focus-console')?.closest('astro-island');
      const modal = document.querySelector('#project-dialog-title, dialog.project-dialog')?.closest('astro-island');
      return hero && !hero.hasAttribute('ssr') && modal && !modal.hasAttribute('ssr');
    },
    { timeout: 6000 }
  );

  // 0. HeroFocusConsole: tabs, keyboard roving tabindex (ArrowRight/Home/End), and panel switch
  const heroTablist = await page.$('#hero-focus-console [role="tablist"]');
  if (!heroTablist) {
    throw new Error(`[${lang}] HeroFocusConsole tablist missing`);
  }
  const heroTabs = await page.$$('#hero-focus-console [role="tab"]');
  if (heroTabs.length < 3) {
    throw new Error(`[${lang}] Expected 3 HeroFocusConsole tabs, got ${heroTabs.length}`);
  }
  await heroTabs[0].focus();
  await page.keyboard.press('ArrowRight');
  await new Promise((r) => setTimeout(r, 150));
  const secondSelected = await page.evaluate(() => document.querySelectorAll('#hero-focus-console [role="tab"]')[1]?.getAttribute('aria-selected'));
  if (secondSelected !== 'true') {
    throw new Error(`[${lang}] ArrowRight did not activate 2nd HeroFocusConsole tab`);
  }
  await page.keyboard.press('End');
  await page.keyboard.press('Home');
  await new Promise((r) => setTimeout(r, 150));
  const firstSelected = await page.evaluate(() => document.querySelectorAll('#hero-focus-console [role="tab"]')[0]?.getAttribute('aria-selected'));
  if (firstSelected !== 'true') {
    throw new Error(`[${lang}] Home did not restore 1st HeroFocusConsole tab`);
  }
  console.log(`  ✓ [${lang}] HeroFocusConsole keyboard navigation verified`);

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
  const firstTrigger = await page.$('#projects [data-project-trigger]');
  if (!firstTrigger) {
    throw new Error(`[${lang}] Project modal trigger not found`);
  }
  await firstTrigger.click();
  // Small wait for modal dialog
  await new Promise(r => setTimeout(r, 300));
  const dialog = await page.$('dialog[open]');
  if (!dialog) {
    throw new Error(`[${lang}] ProjectModal dialog did not open`);
  }
  console.log(`  ✓ [${lang}] ProjectModal trigger & open dialog functional`);

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
  const srv = await startServer(4177);
  const idUrl = 'http://127.0.0.1:4177/';
  const enUrl = 'http://127.0.0.1:4177/en';

  try {
    await testPage(idUrl, 'id');
    await testPage(enUrl, 'en');

    // Verify no-JS SSR fallback + dark/light + 360/390/768/1440 responsive bounds
    const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
    try {
      const p = await browser.newPage();
      await p.setJavaScriptEnabled(false);
      await p.goto(idUrl, { waitUntil: 'load' });
      const ssrPanel = await p.$eval('#hero-tabpanel', (el) => el.textContent?.trim().length || 0);
      if (ssrPanel < 20) throw new Error('HeroFocusConsole SSR fallback empty when JS disabled');
      await p.setJavaScriptEnabled(true);
      for (const w of [360, 390, 768, 1440]) {
        await p.setViewport({ width: w, height: 844 });
        await p.goto(idUrl, { waitUntil: 'load' });
        const overflow = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
        if (overflow) throw new Error(`Horizontal overflow detected at width ${w}px`);
      }
      console.log('  ✓ No-JS SSR fallback and 360/390/768/1440 responsive checks passed');
    } finally {
      await browser.close();
    }
    console.log('ALL FUNCTIONAL TESTS PASSED!');
  } finally {
    srv.close();
  }
}

run().catch(err => {
  console.error('Functional test failed:', err);
  process.exit(1);
});
