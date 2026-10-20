import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 4173;

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

async function runVisualAndLayoutChecks(gateName) {
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
  page.on('pageerror', err => consoleErrors.push(err.toString()));

  // 1440px desktop
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });

  const h1Desktop = await page.evaluate(() => {
    const el = document.querySelector('h1');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return {
      rect: { top: r.top, left: r.left, width: r.width, height: r.height },
      text: el.innerText.trim(),
      fontSize: style.fontSize,
      lineHeight: style.lineHeight
    };
  });
  await page.screenshot({ path: `screenshots/${gateName}-1440px.png` });

  // 390px mobile
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });

  // Measure CLS
  const clsValue = await page.evaluate(() => {
    return new Promise(resolve => {
      let cls = 0;
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
      setTimeout(() => {
        observer.disconnect();
        resolve(cls);
      }, 500);
    });
  });

  const h1Mobile = await page.evaluate(() => {
    const el = document.querySelector('h1');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return {
      rect: { top: r.top, left: r.left, width: r.width, height: r.height },
      text: el.innerText.trim(),
      fontSize: style.fontSize,
      lineHeight: style.lineHeight
    };
  });
  await page.screenshot({ path: `screenshots/${gateName}-390px.png` });

  // 4x CPU throttle for long tasks
  const perfPage = await browser.newPage();
  const client = await perfPage.target().createCDPSession();
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await perfPage.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });

  const longTasks = await perfPage.evaluate(() => {
    return new Promise(resolve => {
      const tasks = [];
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.duration > 50) {
            tasks.push({ duration: Math.round(entry.duration), startTime: Math.round(entry.startTime) });
          }
        }
      });
      observer.observe({ type: 'longtask', buffered: true });
      setTimeout(() => {
        observer.disconnect();
        resolve(tasks);
      }, 500);
    });
  });

  await browser.close();

  return {
    consoleErrors,
    h1Desktop,
    h1Mobile,
    clsValue,
    longTasks
  };
}

async function runLighthouseAudit(port) {
  const options = {
    logLevel: 'error',
    output: 'json',
    port: port,
    formFactor: 'mobile',
    screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2 },
    throttlingMethod: 'simulate',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
  };

  const runnerResult = await lighthouse(`http://localhost:${PORT}/`, options);
  const data = runnerResult.lhr;

  return {
    perf: Math.round(data.categories.performance.score * 100),
    a11y: Math.round(data.categories.accessibility.score * 100),
    bp: Math.round(data.categories['best-practices'].score * 100),
    seo: Math.round(data.categories.seo.score * 100),
    fcp: data.audits['first-contentful-paint'].numericValue,
    lcp: data.audits['largest-contentful-paint'].numericValue,
    cls: data.audits['cumulative-layout-shift'].numericValue,
    tbt: data.audits['total-blocking-time'].numericValue
  };
}

async function main() {
  const gateName = process.argv[2] || 'test-gate';
  console.log(`=== STARTING QUALITY GATES CHECK: ${gateName} ===`);

  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots', { recursive: true });
  }

  const server = createStaticServer();
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`Server listening on port ${PORT}`);

  try {
    console.log('--- Running G1 (Visual), G2 (Layout/CLS), G4 (4x CPU Long Tasks) ---');
    const visual = await runVisualAndLayoutChecks(gateName);
    console.log('Console Errors:', visual.consoleErrors.length === 0 ? 'None (PASS)' : visual.consoleErrors);
    console.log('H1 Desktop Rect:', JSON.stringify(visual.h1Desktop?.rect));
    console.log('H1 Mobile Rect:', JSON.stringify(visual.h1Mobile?.rect));
    console.log('Measured Page CLS:', visual.clsValue);
    console.log('Long Tasks (>50ms at 4x throttle):', visual.longTasks.length);

    console.log('\n--- Running G3 (Lighthouse Mobile, 3 runs) ---');
    const chrome = await chromeLauncher.launch({
      chromePath: CHROME_PATH,
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
    });

    const runs = [];
    try {
      for (let i = 1; i <= 3; i++) {
        process.stdout.write(`Run ${i}/3... `);
        const res = await runLighthouseAudit(chrome.port);
        runs.push(res);
        console.log(`Perf: ${res.perf}, LCP: ${Math.round(res.lcp)}ms, CLS: ${res.cls}, TBT: ${Math.round(res.tbt)}ms`);
      }
    } finally {
      await chrome.kill();
    }

    runs.sort((a, b) => a.perf - b.perf);
    const median = runs[1];
    console.log('\n=== MEDIAN LIGHTHOUSE RESULT ===');
    console.log(`Performance:    ${median.perf} (Target >= 95)`);
    console.log(`Accessibility:  ${median.a11y} (Target 100)`);
    console.log(`Best Practices: ${median.bp} (Target 100)`);
    console.log(`SEO:            ${median.seo} (Target 100)`);
    console.log(`LCP:            ${Math.round(median.lcp)} ms`);
    console.log(`CLS:            ${median.cls}`);
    console.log(`TBT:            ${Math.round(median.tbt)} ms`);

    const passed = median.perf >= 95 && median.a11y >= 100 && median.bp >= 100 && median.seo >= 100 && median.cls < 0.05 && median.tbt < 150 && visual.longTasks.length === 0 && visual.consoleErrors.length === 0;
    console.log(`\nQUALITY GATE STATUS: ${passed ? 'PASSED (ALL CRITERIA MET)' : 'NEEDS ATTENTION'}`);
  } finally {
    server.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
