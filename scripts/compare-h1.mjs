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

async function main() {
  const serverOrig = createStaticServer(process.cwd());
  await new Promise(r => serverOrig.listen(4196, r));

  const serverDist = createStaticServer(path.resolve('dist'));
  await new Promise(r => serverDist.listen(4197, r));

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:4196/', { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  const origH1 = await page.evaluate(() => {
    const el = document.querySelector('h1');
    const cs = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const words = Array.from(el.querySelectorAll('.hero-word')).map(w => {
      const r = w.getBoundingClientRect();
      const inner = w.querySelector('.hero-word-inner');
      const innerRect = inner.getBoundingClientRect();
      const innerCs = window.getComputedStyle(inner);
      return {
        text: w.innerText,
        rect: { x: r.x, y: r.y, w: r.width, h: r.height },
        innerRect: { x: innerRect.x, y: innerRect.y, w: innerRect.width, h: innerRect.height },
        innerTransform: innerCs.transform
      };
    });
    return {
      rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      letterSpacing: cs.letterSpacing,
      lineHeight: cs.lineHeight,
      words
    };
  });

  await page.goto('http://localhost:4197/', { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  const distH1 = await page.evaluate(() => {
    const el = document.querySelector('h1');
    const cs = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const words = Array.from(el.querySelectorAll('.hero-word')).map(w => {
      const r = w.getBoundingClientRect();
      const inner = w.querySelector('.hero-word-inner');
      const innerRect = inner.getBoundingClientRect();
      const innerCs = window.getComputedStyle(inner);
      return {
        text: w.innerText,
        rect: { x: r.x, y: r.y, w: r.width, h: r.height },
        innerRect: { x: innerRect.x, y: innerRect.y, w: innerRect.width, h: innerRect.height },
        innerTransform: innerCs.transform
      };
    });
    return {
      rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      letterSpacing: cs.letterSpacing,
      lineHeight: cs.lineHeight,
      words
    };
  });

  console.log('Orig H1:', JSON.stringify(origH1, null, 2));
  console.log('Dist H1:', JSON.stringify(distH1, null, 2));

  await browser.close();
  serverOrig.close();
  serverDist.close();
}

main().catch(console.error);
