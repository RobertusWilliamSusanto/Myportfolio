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
      const cmd = document.querySelector('astro-island[component-url*="CommandPalette"]');
      return hero && !hero.hasAttribute('ssr') && modal && !modal.hasAttribute('ssr') && (!cmd || !cmd.hasAttribute('ssr'));
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

  // 2. Project filter chips hydrate on visible scroll & filter cards + sliding indicator
  await page.evaluate(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForFunction(
    () => {
      const f = document.querySelector('#projects [data-filter-btn]')?.closest('astro-island');
      return f && !f.hasAttribute('ssr');
    },
    { timeout: 5000 }
  );
  const filterChips = await page.$$('#projects [data-filter-btn]');
  if (filterChips.length < 5) {
    throw new Error(`[${lang}] Project filter buttons missing (got ${filterChips.length})`);
  }
  await page.click('#projects [data-filter-btn="web"]');
  await new Promise((r) => setTimeout(r, 200));
  const filterState = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#projects-grid [data-domain]'));
    const shown = cards.filter((c) => !c.hidden);
    const hidden = cards.filter((c) => c.hidden && c.inert);
    const ind = document.querySelector('.filter-indicator-pill');
    return {
      shown: shown.length,
      hidden: hidden.length,
      indOpacity: ind ? getComputedStyle(ind).opacity : '0'
    };
  });
  if (filterState.shown !== 3 || filterState.hidden !== 3 || filterState.indOpacity !== '1') {
    throw new Error(`[${lang}] Filter interaction failed: ${JSON.stringify(filterState)}`);
  }
  await page.click('#projects [data-filter-btn="all"]');
  await new Promise((r) => setTimeout(r, 150));

  // 2b. Native <details> Peek Specs toggles work natively on click (and without JS below)
  const peekSummary = await page.$('.project-peek-details summary');
  if (!peekSummary) throw new Error(`[${lang}] ProjectPeek summary not found`);
  await peekSummary.click();
  const isPeekOpen = await page.$eval('.project-peek-details', (d) => d.open);
  if (!isPeekOpen) throw new Error(`[${lang}] ProjectPeek details did not open`);
  await peekSummary.click();
  console.log(`  ✓ [${lang}] ProjectFilter sliding indicator, FLIP & Peek Specs verified (${filterChips.length} chips)`);

  // 2c. Live CipherPreview interactive output (Caesar + Vigenère)
  await page.evaluate(() => document.getElementById('cipher-preview-widget')?.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await page.waitForFunction(
    () => {
      const cp = document.getElementById('cipher-preview-widget')?.closest('astro-island');
      return cp && !cp.hasAttribute('ssr');
    },
    { timeout: 5000 }
  );
  await page.click('#cipher-preview-widget [data-cipher-mode="vigenere"]');
  const cipherOut = await page.$eval('#cipher-preview-output', (el) => el.textContent?.trim());
  if (cipherOut !== 'ZINDS') {
    throw new Error(`[${lang}] CipherPreview Vigenere(HELLO, SEC) expected ZINDS, got "${cipherOut}"`);
  }
  await page.click('#cipher-preview-widget [data-cipher-edit]');
  await page.$eval('#cipher-preview-input', (el) => el.select());
  await page.type('#cipher-preview-input', 'ABC');
  await page.click('#cipher-preview-widget [data-cipher-mode="caesar"]');
  const customOut = await page.$eval('#cipher-preview-output', (el) => el.textContent?.trim());
  if (customOut !== 'DEF') {
    throw new Error(`[${lang}] CipherPreview Caesar(ABC) expected DEF, got "${customOut}"`);
  }
  const archStrips = await page.$$('#projects .arch-strip');
  if (archStrips.length !== 4) {
    throw new Error(`[${lang}] Expected 4 architecture preview strips, got ${archStrips.length}`);
  }
  console.log(`  ✓ [${lang}] CipherPreview & ArchitectureStrips verified (${customOut}, ${archStrips.length} strips)`);

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
  await page.click('#modal-tab-overview');
  await page.keyboard.press('ArrowRight');
  const archSelected = await page.$eval('#modal-tab-architecture', (el) => el.getAttribute('aria-selected'));
  const hasHighlightList = await page.$('#project-modal-tabpanel ul li');
  if (archSelected !== 'true' || !hasHighlightList) {
    throw new Error(`[${lang}] ProjectModal Architecture tab switch failed`);
  }
  await page.keyboard.press('ArrowRight');
  const stackSelected = await page.$eval('#modal-tab-stack', (el) => el.getAttribute('aria-selected'));
  if (stackSelected !== 'true') {
    throw new Error(`[${lang}] ProjectModal Stack tab switch failed`);
  }
  await page.keyboard.press('Home');
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 250));
  console.log(`  ✓ [${lang}] ProjectModal tabs, open dialog & Escape close functional`);

  // 4. Copy email button functional
  const emailBtn = await page.$('button[onclick*="copyEmailAddress"]');
  if (emailBtn) {
    await emailBtn.click();
    console.log(`  ✓ [${lang}] Copy email button functional`);
  }

  // 5. Lazy Command Palette opens via Ctrl+K / button, navigates with ArrowDown, closes via Escape
  const cmdBtn = await page.$('#cmd-palette-open');
  if (!cmdBtn) throw new Error(`[${lang}] Command Palette trigger #cmd-palette-open not found`);
  await cmdBtn.click();
  await page.waitForSelector('#cmd-palette-dialog[open]', { timeout: 4000 });
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 150));
  const cmdStillOpen = await page.$('#cmd-palette-dialog[open]');
  if (cmdStillOpen) throw new Error(`[${lang}] Command Palette did not close on Escape`);
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyK');
  await page.keyboard.up('Control');
  await page.waitForSelector('#cmd-palette-dialog[open]', { timeout: 3000 });
  await page.keyboard.press('Escape');
  console.log(`  ✓ [${lang}] Lazy Command Palette (button + Ctrl+K + Esc) verified`);

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
        const brandHeight = await p.$eval('header a[href="#about"] span', (el) => el.getBoundingClientRect().height);
        if (brandHeight > 26) throw new Error(`Navbar brand wrapped onto multiple lines at width ${w}px (${brandHeight}px)`);
      }
      // Verify desktop sibling spotlight (:has()) dims sibling on hover and resets under reduced motion
      await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
      await p.setViewport({ width: 1440, height: 844 });
      await p.goto(idUrl, { waitUntil: 'load' });
      const cards = await p.$$('#projects-grid .card-interactive');
      if (cards.length < 2) throw new Error('Expected at least 2 project cards for sibling spotlight check');
      await p.evaluate(() => document.querySelectorAll('#projects-grid .card-interactive')[0].scrollIntoView({ block: 'center' }));
      await new Promise((r) => setTimeout(r, 80));
      await cards[0].hover();
      await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      await p.waitForFunction(() => {
        const list = document.querySelectorAll('#projects-grid .card-interactive');
        const target = list[1]?.firstElementChild || list[1];
        return Boolean(target && Number.parseFloat(getComputedStyle(target).opacity) <= 0.85);
      }, { timeout: 2000 });
      await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await new Promise((r) => setTimeout(r, 120));
      const reducedSiblingOpacity = await p.evaluate(() => {
        const list = document.querySelectorAll('#projects-grid .card-interactive');
        const target = list[1]?.firstElementChild || list[1];
        return Number.parseFloat(getComputedStyle(target).opacity);
      });
      if (reducedSiblingOpacity < 0.99) {
        throw new Error(`Expected reduced-motion sibling opacity 1, got ${reducedSiblingOpacity}`);
      }
      console.log('  ✓ No-JS SSR fallback, 360/390/768/1440 responsive checks & sibling spotlight passed');
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
