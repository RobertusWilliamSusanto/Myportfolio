import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { createRequire } from 'module';

const req = createRequire(path.join(process.cwd(), 'package.json'));
const puppeteer = req('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// Phase 0 measured baselines (bytes gzip)
const BASE_JS_GZ = 21957; // 18785 (dist/_astro/*.js) + 1807 (public/js/main.js) + 1365 (public/js/motion.js)
const BASE_CSS_GZ = 9645; // inlined <style> in dist/index.html
const MAX_NEW_JS_GZ = 6 * 1024;  // 6144 B hard budget
const MAX_NEW_CSS_GZ = 4 * 1024; // 4096 B hard budget

const MIME = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

const gz = (buf) => zlib.gzipSync(buf).length;

function assertBudgets() {
  const astroDir = path.resolve('dist/_astro');
  const astroFiles = fs.readdirSync(astroDir).filter((f) => f.endsWith('.js'));
  const astroGz = astroFiles.reduce((acc, f) => acc + gz(fs.readFileSync(path.join(astroDir, f))), 0);
  const mainGz = gz(fs.readFileSync('public/js/main.js'));
  const motionGz = gz(fs.readFileSync('public/js/motion.js'));
  const totalJsGz = astroGz + mainGz + motionGz;
  const jsDelta = totalJsGz - BASE_JS_GZ;

  const html = fs.readFileSync('dist/index.html', 'utf8');
  const styles = html.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || [];
  const cssStr = styles.map((s) => s.replace(/<\/?style[^>]*>/g, '')).join('\n');
  const cssGz = gz(Buffer.from(cssStr));
  const cssDelta = cssGz - BASE_CSS_GZ;

  console.log(`Budget check -> JS delta: +${jsDelta} B / ${MAX_NEW_JS_GZ} B | CSS delta: +${cssDelta} B / ${MAX_NEW_CSS_GZ} B`);
  if (jsDelta > MAX_NEW_JS_GZ) {
    throw new Error(`JS budget exceeded: +${jsDelta} B > ${MAX_NEW_JS_GZ} B`);
  }
  if (cssDelta > MAX_NEW_CSS_GZ) {
    throw new Error(`CSS budget exceeded: +${cssDelta} B > ${MAX_NEW_CSS_GZ} B`);
  }
}

function assertCompositorOnlyCss() {
  const motionCss = fs.readFileSync('src/styles/motion.css', 'utf8');
  const globalCss = fs.readFileSync('src/styles/global.css', 'utf8');
  const combined = motionCss + '\n' + globalCss;

  if (/transition\s*:[^;]*\ball\b/i.test(combined)) {
    throw new Error('Forbidden "transition: all" found in src/styles/{motion,global}.css');
  }

  // Strip comments and check @keyframes + transition properties in motion.css
  const stripped = motionCss.replace(/\/\*[\s\S]*?\*\//g, '');
  const keyframeBlocks = stripped.match(/@keyframes\s+[^{]+\{[\s\S]*?\}\s*\}/g) || [];
  const forbiddenProps = /\b(width|height|top|left|right|bottom|margin(?:-(?:top|right|bottom|left))?|padding(?:-(?:top|right|bottom|left))?)\s*:/i;

  for (const block of keyframeBlocks) {
    if (forbiddenProps.test(block)) {
      throw new Error(`Non-compositor property found inside @keyframes:\n${block}`);
    }
  }

  const transitionLines = stripped.match(/transition(?:-property)?\s*:[^;]+;/gi) || [];
  for (const line of transitionLines) {
    if (/\b(width|height|top|left|right|bottom|margin|padding|box-shadow)\b/i.test(line)) {
      throw new Error(`Forbidden transition property in motion.css: ${line}`);
    }
  }
  console.log(`Compositor-only CSS check passed (${keyframeBlocks.length} @keyframes blocks verified).`);
}

async function assertReducedMotionRuntime() {
  const srv = http.createServer((req, res) => {
    let p = decodeURI((req.url || '/').split('?')[0]);
    if (p === '/' || p === '') p = '/index.html';
    const fp = path.join(path.resolve('dist'), p.replace(/^\//, ''));
    if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
      fs.createReadStream(fp).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  await new Promise((r) => srv.listen(4196, r));
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto('http://localhost:4196/', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 200));

    const results = await page.evaluate(() => {
      const hiddenSections = Array.from(document.querySelectorAll('.scroll-reveal')).filter(
        (el) => parseFloat(getComputedStyle(el).opacity) !== 1 || getComputedStyle(el).transform !== 'none'
      ).length;

      const animSelectors = ['.hero-word-inner', '.hero-mono-typing', '.hero-settle'];
      const activeAnimations = animSelectors
        .map((sel) => {
          const el = document.querySelector(sel);
          return el ? { sel, anim: getComputedStyle(el).animationName } : null;
        })
        .filter((x) => x && x.anim !== 'none');

      const pulseAfter = getComputedStyle(document.querySelector('.status-dot-pulse'), '::after');
      const navInd = getComputedStyle(document.getElementById('desktop-nav-indicator'));

      return {
        hasReducedClass: document.documentElement.classList.contains('reduced-motion'),
        hiddenSections,
        activeAnimations,
        pulseDisplay: pulseAfter.display,
        navTransition: navInd.transitionProperty
      };
    });

    if (!results.hasReducedClass) throw new Error('Expected html.reduced-motion class under reduce emulation');
    if (results.hiddenSections > 0) throw new Error(`${results.hiddenSections} .scroll-reveal elements were hidden/transformed under reduced-motion`);
    if (results.activeAnimations.length > 0) throw new Error(`Animations still running under reduced-motion: ${JSON.stringify(results.activeAnimations)}`);
    if (results.pulseDisplay !== 'none') throw new Error(`Status pulse ::after not disabled under reduced-motion: ${results.pulseDisplay}`);
    console.log('Reduced-motion runtime check passed:', JSON.stringify(results));
  } finally {
    await browser.close();
    srv.close();
  }
}

async function run() {
  console.log('=== RUNNING MOTION & BUDGET ASSERTIONS ===');
  assertBudgets();
  assertCompositorOnlyCss();
  await assertReducedMotionRuntime();
  console.log('ALL MOTION & BUDGET ASSERTIONS PASSED!');
}

run().catch((err) => {
  console.error('Motion/budget gate failed:', err);
  process.exit(1);
});
