import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 4175;
const DIST_DIR = path.resolve('dist');

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
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });
}

async function checkConsoleAndA11y() {
  console.log('1. Checking Console Errors & Interaction State...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });

  // Test interactive filter clicks
  const filterBtns = await page.$$('button[aria-pressed]');
  console.log(`Found ${filterBtns.length} filter buttons.`);
  for (const btn of filterBtns) {
    await btn.click();
    await new Promise(r => setTimeout(r, 100));
  }

  // Click first button (All) to reset
  if (filterBtns[0]) await filterBtns[0].click();

  await browser.close();
  return { consoleErrors };
}

async function runLighthouse5Runs(chromePort) {
  console.log('2. Running Lighthouse Mobile (5 runs)...');
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
    process.stdout.write(`  Run ${i}/5... `);
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
  return { runs, median: runs[2] };
}

async function main() {
  const server = createDistServer();
  await new Promise(r => server.listen(PORT, r));

  try {
    const { consoleErrors } = await checkConsoleAndA11y();

    const chrome = await chromeLauncher.launch({
      chromePath: CHROME_PATH,
      chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu']
    });

    const { median } = await runLighthouse5Runs(chrome.port);
    await chrome.kill();

    console.log('\n========================================');
    console.log('QUALITY GATES REPORT');
    console.log('========================================');
    console.log(`Console Errors:  ${consoleErrors.length} (Gate: 0)`);
    console.log(`Performance:     ${median.perf} (Gate: >= 95, baseline was 99)`);
    console.log(`Accessibility:   ${median.a11y} (Gate: 100)`);
    console.log(`Best Practices:  ${median.bp} (Gate: 100)`);
    console.log(`SEO:             ${median.seo} (Gate: 100)`);
    console.log(`LCP:             ${median.lcp} ms (baseline: 2029 ms)`);
    console.log(`CLS:             ${median.cls} (Gate: < 0.05, baseline: 0.0016)`);
    console.log(`TBT:             ${median.tbt} ms (Gate: < 150 ms)`);
    console.log(`LCP Element:     ${median.lcpElement}`);

    const passG1 = median.perf >= 95 && median.cls < 0.05 && median.tbt < 150;
    const passG2 = median.a11y === 100;
    const passG3 = median.bp === 100;
    const passG4 = median.seo === 100;
    const passG5 = consoleErrors.length === 0;

    const allPassed = passG1 && passG2 && passG3 && passG4 && passG5;
    console.log(`\nALL GATES PASSED: ${allPassed ? 'YES ✅' : 'NO ❌'}`);

    if (!allPassed) process.exit(1);
  } finally {
    server.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
