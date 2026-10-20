const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:4173/';
const OUT_DIR = path.join(__dirname, '..', 'screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { width: 360, height: 800, name: 'viewport-360-mobile' },
  { width: 390, height: 844, name: 'viewport-390-iphone' },
  { width: 768, height: 1024, name: 'viewport-768-tablet' },
  { width: 1280, height: 900, name: 'viewport-1280-desktop' },
  { width: 1440, height: 900, name: 'viewport-1440-wide' }
];

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  console.log('Testing viewports and visual rendering...');

  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
    await page.goto(URL, { waitUntil: 'networkidle0' });

    // Capture above-the-fold screenshot
    const foldPath = path.join(OUT_DIR, `${vp.name}-fold.png`);
    await page.screenshot({ path: foldPath, fullPage: false });

    // Capture full-page screenshot
    const fullPath = path.join(OUT_DIR, `${vp.name}-full.png`);
    await page.screenshot({ path: fullPath, fullPage: true });

    console.log(`Captured ${vp.name} (${vp.width}x${vp.height})`);
  }

  // Also test light theme toggle
  await page.setViewport({ width: 1280, height: 900 });
  await page.click('.theme-toggle-btn');
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: path.join(OUT_DIR, 'desktop-light-theme.png'), fullPage: false });
  console.log('Captured desktop-light-theme.png');

  await browser.close();

  console.log('=== CONSOLE ERRORS CHECK ===');
  if (consoleErrors.length === 0) {
    console.log('Zero console errors detected! Page is clean.');
  } else {
    console.error('Console errors found:', consoleErrors);
  }
}

run().catch(console.error);
