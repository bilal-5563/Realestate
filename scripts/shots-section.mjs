// Scroll through one section like a reader and capture viewport frames at set points.
// Usage: node scripts/shots-section.mjs <url> <label> <selector> [fractions]
//   fractions: comma-separated positions through the section (0 = section top at viewport top,
//              1 = section bottom at viewport bottom). Default: 0,0.35,0.7,1
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const [url = 'http://127.0.0.1:4321/', label = 'section', selector = 'section', fr = '0,0.35,0.7,1'] =
  process.argv.slice(2);
const fractions = fr.split(',').map(Number);
mkdirSync('shots', { recursive: true });

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
    hasTouch: !!vp.touch,
    isMobile: !!vp.mobile,
  });
  const page = await ctx.newPage();
  const errors = [];
  const warnings = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
    if (m.type() === 'warning' && !m.text().includes('powerPreference')) warnings.push(m.text());
  });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));

  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => document.documentElement.classList.contains('is-loaded'), null, { timeout: 15000 });
  await page.waitForTimeout(1500);

  const box = await page.evaluate((sel) => {
    const r = document.querySelector(sel).getBoundingClientRect();
    return { top: r.top + scrollY, height: r.height };
  }, selector);

  const scrollTo = async (target) => {
    for (let i = 0; i < 4; i++) {
      const y = await page.evaluate(() => scrollY);
      const delta = target - y;
      if (Math.abs(delta) < 6) break;
      // Wheel in steps so Lenis + ScrollTrigger see a real scroll
      const steps = Math.ceil(Math.abs(delta) / 400);
      for (let s = 0; s < steps; s++) {
        await page.mouse.move(vp.width / 2, vp.height / 2);
        await page.mouse.wheel(0, delta / steps);
        await page.waitForTimeout(60);
      }
      await page.waitForTimeout(700);
    }
  };

  for (const f of fractions) {
    const target = Math.max(0, box.top + f * Math.max(0, box.height - vp.height));
    await scrollTo(target);
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `shots/${label}-${vp.name}-${Math.round(f * 100)}.png` });
  }

  const metrics = await page.evaluate(() => ({ docW: document.documentElement.scrollWidth, winW: innerWidth }));
  report.push({
    viewport: vp.name,
    sectionHeight: Math.round(box.height),
    overflow: metrics.docW > metrics.winW,
    errors,
    warnings: warnings.slice(0, 5),
  });
  await ctx.close();
}

// Reduced motion: everything must be readable with no animation.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  await page.locator(selector).screenshot({ path: `shots/${label}-reduced-motion-full.png` });
  report.push({ viewport: 'reduced-motion-1440', errors });
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
