import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

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

async function inspect(url, name) {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 2 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(url, { waitUntil: 'networkidle0' });

  const data = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const p = document.querySelector('section[aria-label="Hero Introduction"] p');
    const rectH1 = h1.getBoundingClientRect();
    const rectP = p.getBoundingClientRect();
    const sH1 = window.getComputedStyle(h1);
    const sP = window.getComputedStyle(p);

    const cards = Array.from(document.querySelectorAll('article')).map(c => {
      const r = c.getBoundingClientRect();
      const s = window.getComputedStyle(c);
      return {
        top: Math.round(r.top),
        height: Math.round(r.height),
        opacity: s.opacity,
        transform: s.transform
      };
    });

    return {
      h1Rect: { top: Math.round(rectH1.top), height: Math.round(rectH1.height) },
      pRect: { top: Math.round(rectP.top), height: Math.round(rectP.height) },
      h1Font: sH1.fontSize,
      pFont: sP.fontSize,
      bodyHeight: document.body.scrollHeight,
      cards
    };
  });

  await browser.close();
  return data;
}

async function main() {
  const serverOrig = createStaticServer(process.cwd());
  await new Promise(r => serverOrig.listen(4180, r));

  const serverDist = createStaticServer(path.resolve('dist'));
  await new Promise(r => serverDist.listen(4181, r));

  const origData = await inspect('http://localhost:4180/', 'orig');
  const distData = await inspect('http://localhost:4181/', 'dist');

  console.log('Original (index.html):', JSON.stringify(origData, null, 2));
  console.log('Dist (Astro):', JSON.stringify(distData, null, 2));

  serverOrig.close();
  serverDist.close();
}

main().catch(console.error);
