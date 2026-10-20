import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 4173;
const REF_DIR = path.resolve('reference');

if (!fs.existsSync(REF_DIR)) {
  fs.mkdirSync(REF_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml'
};

function createStaticServer() {
  return http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    const filePath = path.join(process.cwd(), reqPath.replace(/^\//, ''));

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });
}

const VIEWPORTS = [
  { width: 1440, height: 900, name: '1440px' },
  { width: 768, height: 1024, name: '768px' },
  { width: 390, height: 844, name: '390px' }
];

async function captureReferenceScreenshots() {
  console.log('--- Capturing Phase 0 Reference Screenshots ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Reduced Motion Reference Screenshots
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: vp.width < 800 ? 2 : 1 });
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(REF_DIR, `ref-${vp.name}-reduced.png`), fullPage: true });
    console.log(`Saved: ref-${vp.name}-reduced.png`);
  }

  // 2. Animated Reference Screenshots (After animations finish: wait 1500ms)
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: vp.width < 800 ? 2 : 1 });
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1600)); // wait for H1 word slide + mono typing + initial transitions
    await page.screenshot({ path: path.join(REF_DIR, `ref-${vp.name}-animated.png`), fullPage: true });
    console.log(`Saved: ref-${vp.name}-animated.png`);
  }

  await browser.close();
}

async function run5LighthouseRuns(port) {
  console.log('\n--- Running 5-Run Lighthouse Mobile Baseline ---');
  const options = {
    logLevel: 'error',
    output: 'json',
    port: port,
    formFactor: 'mobile',
    screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2 },
    throttlingMethod: 'simulate',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
  };

  const runs = [];
  for (let i = 1; i <= 5; i++) {
    process.stdout.write(`Run ${i}/5... `);
    const result = await lighthouse(`http://localhost:${PORT}/`, options);
    const data = result.lhr;
    const item = {
      perf: Math.round(data.categories.performance.score * 100),
      a11y: Math.round(data.categories.accessibility.score * 100),
      bp: Math.round(data.categories['best-practices'].score * 100),
      seo: Math.round(data.categories.seo.score * 100),
      fcp: data.audits['first-contentful-paint'].numericValue,
      lcp: data.audits['largest-contentful-paint'].numericValue,
      cls: data.audits['cumulative-layout-shift'].numericValue,
      tbt: data.audits['total-blocking-time'].numericValue
    };
    runs.push(item);
    console.log(`Perf: ${item.perf}, LCP: ${Math.round(item.lcp)}ms, CLS: ${item.cls.toFixed(4)}, TBT: ${Math.round(item.tbt)}ms`);
  }

  runs.sort((a, b) => a.perf - b.perf);
  const median = runs[2];
  return { runs, median };
}

async function main() {
  const server = createStaticServer();
  await new Promise(r => server.listen(PORT, r));
  console.log(`Server listening on port ${PORT}`);

  try {
    await captureReferenceScreenshots();

    const chrome = await chromeLauncher.launch({
      chromePath: CHROME_PATH,
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
    });

    let results;
    try {
      results = await run5LighthouseRuns(chrome.port);
    } finally {
      await chrome.kill();
    }

    console.log('\n=== PHASE 0 BASELINE RESULTS ===');
    console.log(`Performance:    ${results.median.perf} / 100`);
    console.log(`Accessibility:  ${results.median.a11y} / 100`);
    console.log(`Best Practices: ${results.median.bp} / 100`);
    console.log(`SEO:            ${results.median.seo} / 100`);
    console.log(`FCP:            ${Math.round(results.median.fcp)} ms`);
    console.log(`LCP:            ${Math.round(results.median.lcp)} ms`);
    console.log(`CLS:            ${results.median.cls.toFixed(4)}`);
    console.log(`TBT:            ${Math.round(results.median.tbt)} ms`);

    fs.writeFileSync('phase0-baseline.json', JSON.stringify(results, null, 2));
    console.log('Saved baseline to phase0-baseline.json');
  } finally {
    server.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
