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

async function main() {
  const serverOrig = createStaticServer(process.cwd());
  await new Promise(r => serverOrig.listen(4190, r));

  const serverDist = createStaticServer(path.resolve('dist'));
  await new Promise(r => serverDist.listen(4191, r));

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 2 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

  await page.goto('http://localhost:4190/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'reference/diff/orig-now-768-reduced.png', fullPage: true });

  await page.goto('http://localhost:4191/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'reference/diff/dist-now-768-reduced.png', fullPage: true });

  await browser.close();
  serverOrig.close();
  serverDist.close();

  // Now compare:
  // 1. orig-now vs dist-now
  const origNow = PNG.sync.read(fs.readFileSync('reference/diff/orig-now-768-reduced.png'));
  const distNow = PNG.sync.read(fs.readFileSync('reference/diff/dist-now-768-reduced.png'));
  const diff1 = new PNG({ width: origNow.width, height: origNow.height });
  const p1 = pixelmatch(origNow.data, distNow.data, diff1.data, origNow.width, origNow.height, { threshold: 0.1 });
  console.log('Diff between orig-now and dist-now:', (p1 / (origNow.width * origNow.height) * 100).toFixed(4) + '%');

  // 2. orig-now vs ref-768px-reduced.png
  const ref = PNG.sync.read(fs.readFileSync('reference/ref-768px-reduced.png'));
  const diff2 = new PNG({ width: origNow.width, height: origNow.height });
  const p2 = pixelmatch(origNow.data, ref.data, diff2.data, origNow.width, origNow.height, { threshold: 0.1 });
  console.log('Diff between orig-now and ref-768px-reduced.png:', (p2 / (origNow.width * origNow.height) * 100).toFixed(4) + '%');

  // Also check 1440px
  // ...
}

main().catch(console.error);
