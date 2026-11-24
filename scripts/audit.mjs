// Full-page QA at 1440 / 820 / 390: section screenshots, console errors, layout shift and text overflow.
// Usage: node scripts/audit.mjs [url] [label]
//   1) motion run: scrolls the whole page like a reader (all animations fire), records CLS + errors
//   2) reduced-motion run: every section screenshotted in its final state, plus an overflow scan
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const url = process.argv[2] ?? 'http://127.0.0.1:4322/';
const label = process.argv[3] ?? 'audit';
mkdirSync('shots', { recursive: true });

const viewports = [
  { name: '1440', width: 1440, height: 900 },
  { name: '820', width: 820, height: 1180, touch: true },
  { name: '390', width: 390, height: 844, touch: true, mobile: true },
];
const sections = ['#top', '#intro', '#work', '#capabilities', '#process', '#why', '#contact', 'footer'];

const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-unsafe-webgpu'] });
const report = [];

for (const vp of viewports) {
  // ── 1. Motion run
  {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: !!vp.touch, isMobile: !!vp.mobile });
    await ctx.addInitScript(() => {
      window.__cls = 0;
      window.__shifts = [];
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) {
          if (e.hadRecentInput) continue;
          window.__cls += e.value;
          window.__shifts.push({ v: +e.value.toFixed(4), t: Math.round(e.startTime), src: (e.sources || []).map((s) => s.node?.className || s.node?.nodeName).join('|') });
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForFunction(() => document.documentElement.classList.contains('is-loaded'), null, { timeout: 15000 });
    await page.waitForTimeout(1500);
    const clsAtLoad = await page.evaluate(() => window.__cls);
    // Scroll the full page in steps
    let y = 0;
    for (let i = 0; i < 400; i++) {
      await page.mouse.move(vp.width / 2, vp.height / 2);
      await page.mouse.wheel(0, 450);
      await page.waitForTimeout(90);
      const ny = await page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2);
      if (ny) break;
    }
    await page.waitForTimeout(1200);
    const res = await page.evaluate(() => ({ cls: window.__cls, shifts: window.__shifts.slice(0, 8), docW: document.documentElement.scrollWidth, winW: innerWidth }));
    report.push({ viewport: vp.name, run: 'motion', clsAtLoad: +clsAtLoad.toFixed(4), clsTotal: +res.cls.toFixed(4), shifts: res.shifts, horizontalOverflow: res.docW > res.winW, errors });
    await ctx.close();
  }

  // ── 2. Reduced-motion run: final-state screenshots + overflow scan
  {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: !!vp.touch, isMobile: !!vp.mobile, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    await page.goto(url, { waitUntil: 'load' });
    await page.addStyleTag({ content: '.cursor{display:none!important}' });
    // Load every lazy image before capturing
    await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager')));
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    for (const sel of sections) {
      const el = page.locator(sel).first();
      await el.screenshot({ path: `shots/${label}-${vp.name}-${sel.replace(/[#]/g, '')}.png` });
    }
    // Text overflow: any text-bearing element whose content is wider than its box, or that pokes past the viewport.
    const overflow = await page.evaluate(() => {
      const out = [];
      const W = document.documentElement.clientWidth;
      for (const el of document.querySelectorAll('body *')) {
        if (el.closest('[aria-hidden="true"] svg, .sr-only, script, style, .cursor, #loader, .mobile-menu')) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!hasText) continue;
        const r = el.getBoundingClientRect();
        if (!r.width) continue;
        const clipped = el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== 'visible';
        const offscreen = r.right > W + 1 || r.left < -1;
        // ignore the horizontally-scrolled concepts track (desktop only, transformed) and the scrolling footer word
        if ((clipped || offscreen) && !el.closest('[data-concepts-track]')) out.push({ tag: el.tagName, cls: String(el.className).slice(0, 50), text: el.textContent.trim().slice(0, 50), right: Math.round(r.right), W, clipped });
      }
      return out.slice(0, 20);
    });
    report.push({ viewport: vp.name, run: 'reduced-motion', overflow, errors });
    await ctx.close();
  }
}
await browser.close();
console.log(JSON.stringify(report, null, 1));
