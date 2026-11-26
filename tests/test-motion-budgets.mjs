import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { createRequire } from 'module';

const req = createRequire(path.join(process.cwd(), 'package.json'));
const puppeteer = req('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// Phase 0 baselines measured on feat/signature-interactions start (aa90c9b + DECISION_REPORT)
const BASE_CRITICAL_JS_GZ = 4464;    // public/js/main.js + public/js/motion.js
const BASE_DEFERRED_EAGER_GZ = 15159;
const BASE_DEFERRED_ONDEMAND_GZ = 4626;
const BASE_DEFERRED_TOTAL_GZ = BASE_DEFERRED_EAGER_GZ + BASE_DEFERRED_ONDEMAND_GZ; // 19785 B
const BASE_CSS_AA90C9B_GZ = 10766;
const BASE_CSS_ACF6C6B_GZ = 9645;

const MAX_NEW_CRITICAL_JS_GZ = 3 * 1024;  // 3072 B
const MAX_NEW_DEFERRED_JS_GZ = 30 * 1024; // 30720 B
const MAX_NEW_CSS_GZ = 4 * 1024;          // 4096 B
const MAX_4X_CPU_TBT_MS = 250;            // hard cap (< 200ms tripwire warning)

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

function measureStaticSizes() {
  const astroDir = path.resolve('dist/_astro');
  const astroFiles = fs.readdirSync(astroDir).filter((f) => f.endsWith('.js'));
  const astroFileMap = {};
  let totalDeferredGz = 0;
  for (const f of astroFiles) {
    const g = gz(fs.readFileSync(path.join(astroDir, f)));
    astroFileMap[f] = g;
    totalDeferredGz += g;
  }

  const mainGz = gz(fs.readFileSync('public/js/main.js'));
  const motionGz = gz(fs.readFileSync('public/js/motion.js'));
  const criticalJsGz = mainGz + motionGz;
  const criticalDelta = criticalJsGz - BASE_CRITICAL_JS_GZ;
  const deferredNewDelta = totalDeferredGz - BASE_DEFERRED_TOTAL_GZ;

  const html = fs.readFileSync('dist/index.html', 'utf8');
  const styles = html.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || [];
  const cssStr = styles.map((s) => s.replace(/<\/?style[^>]*>/g, '')).join('\n');
  const cssGz = gz(Buffer.from(cssStr));
  const cssDelta = cssGz - BASE_CSS_AA90C9B_GZ;
  const cssDeltaFromOrig = cssGz - BASE_CSS_ACF6C6B_GZ;

  console.log(
    `Tiered Size Check -> Critical JS: ${criticalJsGz} B (delta ${criticalDelta >= 0 ? '+' : ''}${criticalDelta} / +${MAX_NEW_CRITICAL_JS_GZ} B) | ` +
    `Deferred JS (new vs aa90c9b): +${deferredNewDelta} / +${MAX_NEW_DEFERRED_JS_GZ} B | ` +
    `Deferred JS (page-total): ${totalDeferredGz} B | ` +
    `Inline CSS: ${cssGz} B (+${cssDelta} vs aa90c9b, +${cssDeltaFromOrig} vs acf6c6b)`
  );

  if (criticalDelta > MAX_NEW_CRITICAL_JS_GZ) {
    throw new Error(`Critical-path JS budget exceeded: +${criticalDelta} B > +${MAX_NEW_CRITICAL_JS_GZ} B`);
  }
  if (deferredNewDelta > MAX_NEW_DEFERRED_JS_GZ) {
    throw new Error(`Deferred JS budget exceeded: +${deferredNewDelta} B > +${MAX_NEW_DEFERRED_JS_GZ} B`);
  }
  if (cssDelta > MAX_NEW_CSS_GZ) {
    throw new Error(`Inline CSS budget exceeded: +${cssDelta} B > +${MAX_NEW_CSS_GZ} B`);
  }

  return { astroFileMap, criticalJsGz, criticalDelta, totalDeferredGz, deferredNewDelta, cssGz, cssDelta };
}

function assertCompositorOnlyCss() {
  const motionCss = fs.readFileSync('src/styles/motion.css', 'utf8');
  const globalCss = fs.readFileSync('src/styles/global.css', 'utf8');
  const combined = motionCss + '\n' + globalCss;

  if (/transition\s*:[^;]*\ball\b/i.test(combined)) {
    throw new Error('Forbidden "transition: all" found in src/styles/{motion,global}.css');
  }

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

function createDistServer() {
  return http.createServer((req, res) => {
    let p = decodeURI((req.url || '/').split('?')[0]);
    if (p === '/' || p === '') p = '/index.html';
    else if (p === '/en' || p === '/en/') p = '/en/index.html';
    const fp = path.join(path.resolve('dist'), p.replace(/^\//, ''));
    if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
      fs.createReadStream(fp).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });
}

async function assertNetworkOrderReducedMotionAnd4xCpu(sizes) {
  const srv = createDistServer();
  await new Promise((r) => srv.listen(4196, '127.0.0.1', r));
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // 1. Reduced motion runtime check (no motion overrides active)
    const pReduced = await browser.newPage();
    await pReduced.setViewport({ width: 1440, height: 900 });
    await pReduced.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await pReduced.goto('http://127.0.0.1:4196/', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 200));

    const reducedRes = await pReduced.evaluate(() => {
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
    if (!reducedRes.hasReducedClass) throw new Error('Expected html.reduced-motion class under reduce emulation');
    if (reducedRes.hiddenSections > 0) throw new Error(`${reducedRes.hiddenSections} .scroll-reveal elements were hidden/transformed under reduced-motion`);
    if (reducedRes.activeAnimations.length > 0) throw new Error(`Animations still running under reduced-motion: ${JSON.stringify(reducedRes.activeAnimations)}`);
    if (reducedRes.pulseDisplay !== 'none') throw new Error(`Status pulse ::after not disabled under reduced-motion: ${reducedRes.pulseDisplay}`);
    await pReduced.close();
    console.log('Reduced-motion runtime check passed:', JSON.stringify(reducedRes));

    // 2. Network order (afterLcp) + 4x CPU throttle TBT check
    const pPerf = await browser.newPage();
    const cdp = await pPerf.createCDPSession();
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await pPerf.setViewport({ width: 390, height: 844 });
    await pPerf.evaluateOnNewDocument(() => {
      window.__lt = [];
      window.__lcp = 0;
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) window.__lt.push({ s: Math.round(e.startTime), d: Math.round(e.duration) });
      }).observe({ type: 'longtask', buffered: true });
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) window.__lcp = e.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });

    await pPerf.goto('http://127.0.0.1:4196/', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 900));

    const eagerLoadScripts = await pPerf.evaluate(() =>
      performance.getEntriesByType('resource')
        .filter((r) => r.name.includes('/_astro/') && r.name.endsWith('.js'))
        .map((r) => ({ name: r.name.split('/').pop(), start: Math.round(r.startTime), lcp: Math.round(window.__lcp), afterLcp: r.startTime >= window.__lcp }))
    );

    const earlyIslands = eagerLoadScripts.filter((s) => !s.afterLcp);
    if (earlyIslands.length > 0) {
      throw new Error(`Island chunk(s) loaded BEFORE LCP: ${JSON.stringify(earlyIslands)}`);
    }

    // Exercise interactive transitions under 4x CPU
    await pPerf.evaluate(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 500));
    const filterBtns = await pPerf.$$('#projects button[aria-pressed]');
    if (filterBtns[1]) await filterBtns[1].click();
    await new Promise((r) => setTimeout(r, 300));
    const modalTrigger = await pPerf.$('[data-project-trigger]');
    if (modalTrigger) await modalTrigger.click();
    await new Promise((r) => setTimeout(r, 300));

    const perfSummary = await pPerf.evaluate(() => {
      const tbt4x = Math.round(window.__lt.reduce((a, t) => a + Math.max(0, t.d - 50), 0));
      const allAstro = performance.getEntriesByType('resource')
        .filter((r) => r.name.includes('/_astro/') && r.name.endsWith('.js'))
        .map((r) => r.name.split('/').pop());
      return { lcp4x: Math.round(window.__lcp), tbt4x, longTasks: window.__lt, allAstro };
    });
    await pPerf.close();

    const eagerNames = new Set(eagerLoadScripts.map((s) => s.name));
    const eagerGz = [...eagerNames].reduce((a, n) => a + (sizes.astroFileMap[n] || 0), 0);
    const onDemandGz = sizes.totalDeferredGz - eagerGz;
    console.log(
      `Network Order & 4x-CPU Check -> afterLcp: PASS (${eagerLoadScripts.length} eager chunks >= LCP ${perfSummary.lcp4x}ms) | ` +
      `Deferred-Eager: ${eagerGz} B (delta ${eagerGz - BASE_DEFERRED_EAGER_GZ >= 0 ? '+' : ''}${eagerGz - BASE_DEFERRED_EAGER_GZ}) | ` +
      `Deferred-OnDemand: ${onDemandGz} B (delta ${onDemandGz - BASE_DEFERRED_ONDEMAND_GZ >= 0 ? '+' : ''}${onDemandGz - BASE_DEFERRED_ONDEMAND_GZ}) | ` +
      `4x-CPU TBT: ${perfSummary.tbt4x} ms (cap < ${MAX_4X_CPU_TBT_MS} ms)`
    );
    if (perfSummary.tbt4x >= MAX_4X_CPU_TBT_MS) {
      throw new Error(`4x-CPU TBT exceeded cap: ${perfSummary.tbt4x} ms >= ${MAX_4X_CPU_TBT_MS} ms; tasks=${JSON.stringify(perfSummary.longTasks)}`);
    }
    if (perfSummary.tbt4x > 200) {
      console.warn(`[TRIPWIRE WARNING C5] 4x-CPU TBT ${perfSummary.tbt4x} ms > 200 ms`);
    }
  } finally {
    await browser.close();
    srv.close();
  }
}

async function run() {
  console.log('=== RUNNING MOTION & TIERED BUDGET ASSERTIONS ===');
  const sizes = measureStaticSizes();
  assertCompositorOnlyCss();
  await assertNetworkOrderReducedMotionAnd4xCpu(sizes);
  console.log('ALL MOTION & TIERED BUDGET ASSERTIONS PASSED!');
}

run().catch((err) => {
  console.error('Motion/budget gate failed:', err);
  process.exit(1);
});
