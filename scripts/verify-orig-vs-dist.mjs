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

async function main() {
  const serverOrig = createStaticServer(process.cwd());
  await new Promise(r => serverOrig.listen(4194, r));

  const serverDist = createStaticServer(path.resolve('dist'));
  await new Promise(r => serverDist.listen(4195, r));

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  const results = [];

  console.log('Comparing Unchanged Original Site vs Astro dist/ output:');

  // 1. Reduced motion tests (with document.fonts.ready and 1200ms settle)
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  for (const vp of VIEWPORTS) {
    const scale = vp.width < 800 ? 2 : 1;
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: scale });

    await page.goto('http://localhost:4194/', { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 1200));
    const origPath = path.resolve(`reference/diff/orig-${vp.name}-reduced.png`);
    await page.screenshot({ path: origPath, fullPage: true });

    await page.goto('http://localhost:4195/', { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 1200));
    const distPath = path.resolve(`reference/diff/dist-${vp.name}-reduced.png`);
    await page.screenshot({ path: distPath, fullPage: true });

    const img1 = PNG.sync.read(fs.readFileSync(origPath));
    const img2 = PNG.sync.read(fs.readFileSync(distPath));
    const diff = new PNG({ width: img1.width, height: img1.height });
    const diffPixels = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, { threshold: 0.1 });
    const pct = (diffPixels / (img1.width * img1.height)) * 100;

    results.push({ test: `${vp.name} reduced`, pct, passed: pct <= 0.5 });
    console.log(`  ${vp.name} reduced: ${pct.toFixed(4)}% diff -> ${pct <= 0.5 ? 'PASS ✅' : 'FAIL ❌'}`);
  }

  // 2. Animated tests (with document.fonts.ready and 1600ms settle)
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  for (const vp of VIEWPORTS) {
    const scale = vp.width < 800 ? 2 : 1;
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: scale });

    await page.goto('http://localhost:4194/', { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 1600));
    const origPath = path.resolve(`reference/diff/orig-${vp.name}-animated.png`);
    await page.screenshot({ path: origPath, fullPage: true });

    await page.goto('http://localhost:4195/', { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 1600));
    const distPath = path.resolve(`reference/diff/dist-${vp.name}-animated.png`);
    await page.screenshot({ path: distPath, fullPage: true });

    const img1 = PNG.sync.read(fs.readFileSync(origPath));
    const img2 = PNG.sync.read(fs.readFileSync(distPath));
    const diff = new PNG({ width: img1.width, height: img1.height });
    const diffPixels = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, { threshold: 0.1 });
    const pct = (diffPixels / (img1.width * img1.height)) * 100;

    results.push({ test: `${vp.name} animated`, pct, passed: pct <= 0.5 });
    console.log(`  ${vp.name} animated: ${pct.toFixed(4)}% diff -> ${pct <= 0.5 ? 'PASS ✅' : 'FAIL ❌'}`);
  }

  await browser.close();
  serverOrig.close();
  serverDist.close();

  const allPassed = results.every(r => r.passed);
  console.log(`\nAll Parity Tests Passed: ${allPassed ? 'YES ✅' : 'NO ❌'}`);
  fs.writeFileSync('reference/orig-vs-dist-results.json', JSON.stringify({ results, allPassed }, null, 2));
}

main().catch(console.error);
