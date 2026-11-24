// Captures the hero as the Open Graph image (1200×630), using the static render (reduced-motion mode).
// Usage: node scripts/capture-og.mjs [url]
import { chromium } from 'playwright';
import sharp from 'sharp';
const url = process.argv[2] ?? 'http://127.0.0.1:4322/';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1600, height: 840 }, reducedMotion: 'reduce' });
await page.goto(url, { waitUntil: 'load' });
await page.addStyleTag({ content: '.cursor{display:none!important}' });
await page.waitForTimeout(1500);
const png = await page.screenshot({ type: 'png' });
await browser.close();
await sharp(png).resize(1200, 630).jpeg({ quality: 82, mozjpeg: true }).toFile('public/og.jpg');
console.log('og.jpg written');
