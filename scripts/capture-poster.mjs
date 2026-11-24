// Renders the live Spline hero and saves it as the static fallback poster (AVIF + WebP, 1600 & 900 wide).
// Usage: node scripts/capture-poster.mjs [url]
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const url = process.argv[2] ?? 'http://localhost:4321/';
mkdirSync('public/images', { recursive: true });

// Stage is 62% × 100% of the viewport on desktop → choose a viewport that yields a 1600×1000 stage.
const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-unsafe-webgpu'] });
const ctx = await browser.newContext({ viewport: { width: 2581, height: 1000 }, deviceScaleFactor: 1.25 });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => document.documentElement.classList.contains('is-loaded'), null, { timeout: 20000 });
await page.evaluate(
  () =>
    new Promise((res) => {
      window.addEventListener('scaleit:scene-ready', res, { once: true });
      setTimeout(res, 30000);
    }),
);
await page.mouse.move(1290, 500); // neutral pose
await page.addStyleTag({
  content: '.hero__vignette,.hero__meta,.hero__content,.hero__cue,header,.gridlines,.cursor{display:none!important}',
});
await page.waitForTimeout(4000);
const stage = await page.$('[data-hero-stage]');
const png = await stage.screenshot({ type: 'png' });
await browser.close();

// Keep only the rendered scene: drop the bottom band where the runtime's UI overlay sits.
const meta = await sharp(png).metadata();
const sceneOnly = await sharp(png)
  .extract({ left: 0, top: 0, width: meta.width, height: Math.round(meta.height * 0.86) })
  .toBuffer();

for (const w of [1600, 900]) {
  const img = sharp(sceneOnly).resize({ width: w }); // keeps the 1600×860 framing
  await img.clone().avif({ quality: 52, effort: 6 }).toFile(`public/images/hero-villa-${w}.avif`);
  await img.clone().webp({ quality: 78 }).toFile(`public/images/hero-villa-${w}.webp`);
}
console.log('poster written');
