// Screenshot + console audit at desktop / tablet / mobile.
// Usage: node scripts/shots.mjs [url] [label]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const url = process.argv[2] ?? 'http://localhost:4321/';
const label = process.argv[3] ?? 'section';
const out = 'shots';
mkdirSync(out, { recursive: true });

const viewports = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-820', width: 820, height: 1180, touch: true },
  { name: 'mobile-390', width: 390, height: 844, touch: true, mobile: true },
];

const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-unsafe-webgpu'] });
const report = [];

for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    hasTouch: !!vp.touch,
    isMobile: !!vp.mobile,
  });
  const page = await ctx.newPage();
  const errors = [];
  const warnings = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
    if (m.type() === 'warning') warnings.push(m.text());
  });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));

  await page.goto(url, { waitUntil: 'load' });

  if (vp.name === 'desktop-1440') {
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${out}/${label}-loader-${vp.name}.png` });
  }

  await page.waitForFunction(() => document.documentElement.classList.contains('is-loaded'), null, { timeout: 15000 });

  let scene = 'n/a';
  if (vp.width >= 1024) {
    scene = await page
      .evaluate(
        () =>
          new Promise((res) => {
            if (document.querySelector('[data-hero-stage] canvas')) return res('canvas-present');
            window.addEventListener('plinth:scene-ready', () => res('ready'), { once: true });
            setTimeout(() => res(document.querySelector('[data-hero-stage] canvas') ? 'canvas-present' : 'timeout'), 25000);
          }),
      )
      .catch(() => 'error');
    // pointer to the right, so the mouse-lean is visible
    await page.mouse.move(vp.width * 0.8, vp.height * 0.4);
  }
  await page.waitForTimeout(3200);
  await page.screenshot({ path: `${out}/${label}-${vp.name}.png` });

  // scroll halfway through the hero to check the scroll choreography
  await page.mouse.wheel(0, vp.height * 0.5);
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${out}/${label}-${vp.name}-scrolled.png` });

  const metrics = await page.evaluate(() => ({
    scrollY: Math.round(window.scrollY),
    docW: document.documentElement.scrollWidth,
    winW: window.innerWidth,
  }));
  report.push({ viewport: vp.name, scene, ...metrics, errors, warnings: warnings.slice(0, 5) });
  await ctx.close();
}

// Reduced motion: no loader, no 3D, content visible immediately
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/${label}-reduced-motion.png` });
  const hasCanvas = await page.evaluate(() => !!document.querySelector('canvas'));
  report.push({ viewport: 'reduced-motion-1440', canvasLoaded: hasCanvas, errors });
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
