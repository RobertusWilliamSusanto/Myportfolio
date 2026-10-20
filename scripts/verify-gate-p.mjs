import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 4174;
const REF_DIR = path.resolve('reference');
const DIST_DIR = path.resolve('dist');
const DIFF_DIR = path.resolve('reference/diff');

if (!fs.existsSync(DIFF_DIR)) {
  fs.mkdirSync(DIFF_DIR, { recursive: true });
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

function createDistServer() {
  return http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    const filePath = path.join(DIST_DIR, reqPath.replace(/^\//, ''));

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

function comparePngImages(refPath, testPath, diffPath) {
  const img1 = PNG.sync.read(fs.readFileSync(refPath));
  const img2 = PNG.sync.read(fs.readFileSync(testPath));

  const width = Math.min(img1.width, img2.width);
  const height = Math.min(img1.height, img2.height);

  // Resize / match buffer bounds if heights differ slightly due to font rendering
  const totalPixels = width * height;
  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );

  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  const diffPercent = (numDiffPixels / totalPixels) * 100;
  return { numDiffPixels, totalPixels, diffPercent };
}

async function runVisualDiff() {
  console.log('\n========================================');
  console.log('1. RUNNING VISUAL DIFF AGAINST PHASE 0');
  console.log('========================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  const results = [];

  // A. Reduced motion comparison
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: vp.width < 800 ? 2 : 1 });
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });
    const testPath = path.join(DIFF_DIR, `dist-${vp.name}-reduced.png`);
    await page.screenshot({ path: testPath, fullPage: true });

    const refPath = path.join(REF_DIR, `ref-${vp.name}-reduced.png`);
    const diffPath = path.join(DIFF_DIR, `diff-${vp.name}-reduced.png`);
    const comparison = comparePngImages(refPath, testPath, diffPath);

    results.push({
      test: `${vp.name} reduced`,
      diffPercent: comparison.diffPercent,
      passed: comparison.diffPercent <= 0.5
    });
    console.log(`[Diff] ${vp.name} reduced: ${comparison.diffPercent.toFixed(3)}% diff (Threshold: <=0.5%) -> ${comparison.diffPercent <= 0.5 ? 'PASS' : 'FAIL'}`);
  }

  // B. Animated comparison (wait 1600ms)
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: vp.width < 800 ? 2 : 1 });
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1600));
    const testPath = path.join(DIFF_DIR, `dist-${vp.name}-animated.png`);
    await page.screenshot({ path: testPath, fullPage: true });

    const refPath = path.join(REF_DIR, `ref-${vp.name}-animated.png`);
    const diffPath = path.join(DIFF_DIR, `diff-${vp.name}-animated.png`);
    const comparison = comparePngImages(refPath, testPath, diffPath);

    results.push({
      test: `${vp.name} animated`,
      diffPercent: comparison.diffPercent,
      passed: comparison.diffPercent <= 0.5
    });
    console.log(`[Diff] ${vp.name} animated: ${comparison.diffPercent.toFixed(3)}% diff (Threshold: <=0.5%) -> ${comparison.diffPercent <= 0.5 ? 'PASS' : 'FAIL'}`);
  }

  await browser.close();

  console.log(`Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Console errors logged:', consoleErrors);
  }

  return { results, consoleErrors };
}

async function runLighthouse5Runs(chromePort) {
  console.log('\n========================================');
  console.log('2. RUNNING LIGHTHOUSE MOBILE (5 RUNS)');
  console.log('========================================');

  const options = {
    logLevel: 'error',
    output: 'json',
    port: chromePort,
    formFactor: 'mobile',
    screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2 },
    throttlingMethod: 'simulate',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
  };

  const runs = [];
  for (let i = 1; i <= 5; i++) {
    process.stdout.write(`Run ${i}/5... `);
    const runnerResult = await lighthouse(`http://localhost:${PORT}/`, options);
    const cr = runnerResult.lhr;

    const scores = {
      perf: Math.round(cr.categories.performance.score * 100),
      a11y: Math.round(cr.categories.accessibility.score * 100),
      bp: Math.round(cr.categories['best-practices'].score * 100),
      seo: Math.round(cr.categories.seo.score * 100),
      fcp: Math.round(cr.audits['first-contentful-paint'].numericValue),
      lcp: Math.round(cr.audits['largest-contentful-paint'].numericValue),
      cls: parseFloat(cr.audits['cumulative-layout-shift'].numericValue.toFixed(4)),
      tbt: Math.round(cr.audits['total-blocking-time'].numericValue),
      lcpElement: cr.audits['largest-contentful-paint-element']?.details?.items?.[0]?.node?.snippet || 'unknown'
    };
    runs.push(scores);
    console.log(`Perf: ${scores.perf} | A11y: ${scores.a11y} | BP: ${scores.bp} | SEO: ${scores.seo} | LCP: ${scores.lcp}ms | CLS: ${scores.cls}`);
  }

  runs.sort((a, b) => a.perf - b.perf);
  const median = runs[2];
  return { runs, median };
}

async function main() {
  const server = createDistServer();
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`Serving dist/ at http://localhost:${PORT}`);

  try {
    const diffResult = await runVisualDiff();

    const chrome = await chromeLauncher.launch({
      chromePath: CHROME_PATH,
      chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu']
    });

    const lhResult = await runLighthouse5Runs(chrome.port);
    await chrome.kill();

    console.log('\n========================================');
    console.log('GATE P SUMMARY REPORT');
    console.log('========================================');
    console.log('Visual Diff Results:');
    let allDiffPassed = true;
    for (const r of diffResult.results) {
      console.log(`  - ${r.test}: ${r.diffPercent.toFixed(3)}% (Pass: ${r.passed})`);
      if (!r.passed) allDiffPassed = false;
    }

    console.log(`\nConsole Errors: ${diffResult.consoleErrors.length} (Pass: ${diffResult.consoleErrors.length === 0})`);

    console.log('\nLighthouse Mobile Median (5 runs):');
    console.log(`  Performance:    ${lhResult.median.perf} (Baseline was 99)`);
    console.log(`  Accessibility:  ${lhResult.median.a11y} (Baseline: 100)`);
    console.log(`  Best Practices: ${lhResult.median.bp} (Baseline: 100)`);
    console.log(`  SEO:            ${lhResult.median.seo} (Baseline: 100)`);
    console.log(`  LCP:            ${lhResult.median.lcp} ms`);
    console.log(`  CLS:            ${lhResult.median.cls}`);
    console.log(`  TBT:            ${lhResult.median.tbt} ms`);
    console.log(`  LCP Element:    ${lhResult.median.lcpElement}`);

    const gatePassed = allDiffPassed && diffResult.consoleErrors.length === 0 && lhResult.median.perf >= 95;
    console.log(`\nOVERALL GATE P: ${gatePassed ? 'PASSED ✅' : 'FAILED ❌'}`);

    fs.writeFileSync(
      path.resolve('reference/gate-p-report.json'),
      JSON.stringify({ diffResult, lighthouse: lhResult, gatePassed }, null, 2)
    );
  } finally {
    server.close();
  }
}

main().catch(err => {
  console.error('Gate P verification error:', err);
  process.exit(1);
});
