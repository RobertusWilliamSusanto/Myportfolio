import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

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

function createStaticServer(root) {
  return http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    const filePath = path.join(root, reqPath.replace(/^\//, ''));

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

const VIEWPORTS = [
  { width: 1440, height: 900, name: '1440px' },
  { width: 768, height: 1024, name: '768px' },
  { width: 390, height: 844, name: '390px' }
];

async function capture(page, url, mode, vp, scale) {
  await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: scale });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: mode === 'reduced' ? 'reduce' : 'no-preference' }]);
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');

  // Ensure all lazy images are loaded for full-page comparison
  await page.evaluate(async () => {
    const lazyImgs = Array.from(document.querySelectorAll('img[loading="lazy"]'));
    for (const img of lazyImgs) {
      img.loading = 'eager';
    }
    await Promise.all(Array.from(document.querySelectorAll('img')).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = img.onerror = resolve;
      });
    }));
  });

  await new Promise(r => setTimeout(r, mode === 'reduced' ? 600 : 1600));
}

async function main() {
  const serverOrig = createStaticServer(process.cwd());
  await new Promise(r => serverOrig.listen(4200, r));

  const serverDist = createStaticServer(path.resolve('dist'));
  await new Promise(r => serverDist.listen(4201, r));

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const results = [];

  console.log('Testing each viewport with eager images:');

  for (const mode of ['reduced', 'animated']) {
    for (const vp of VIEWPORTS) {
      const scale = vp.width < 800 ? 2 : 1;

      // Fresh page for orig
      const page1 = await browser.newPage();
      await capture(page1, 'http://localhost:4200/', mode, vp, scale);
      const origPath = path.resolve(`reference/diff/eager-orig-${vp.name}-${mode}.png`);
      await page1.screenshot({ path: origPath, fullPage: true });
      await page1.close();

      // Fresh page for dist
      const page2 = await browser.newPage();
      await capture(page2, 'http://localhost:4201/', mode, vp, scale);
      const distPath = path.resolve(`reference/diff/eager-dist-${vp.name}-${mode}.png`);
      await page2.screenshot({ path: distPath, fullPage: true });
      await page2.close();

      const img1 = PNG.sync.read(fs.readFileSync(origPath));
      const img2 = PNG.sync.read(fs.readFileSync(distPath));
      const diff = new PNG({ width: img1.width, height: img1.height });
      const diffPixels = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, { threshold: 0.1 });
      const pct = (diffPixels / (img1.width * img1.height)) * 100;

      results.push({ test: `${vp.name} ${mode}`, pct, passed: pct <= 0.5 });
      console.log(`  ${vp.name} ${mode}: ${pct.toFixed(4)}% diff -> ${pct <= 0.5 ? 'PASS ✅' : 'FAIL ❌'}`);
    }
  }

  await browser.close();
  serverOrig.close();
  serverDist.close();

  const allPassed = results.every(r => r.passed);
  console.log(`\nAll Parity Tests Passed: ${allPassed ? 'YES ✅' : 'NO ❌'}`);
}

main().catch(console.error);
