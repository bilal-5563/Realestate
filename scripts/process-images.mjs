// Crops, grades and exports every photograph used on the site.
// Sources live in /assets/source (never published); outputs go to /public/images.
// Usage: node scripts/process-images.mjs [name-filter]
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

mkdirSync('public/images', { recursive: true });
const only = process.argv[2];

/** Grades. Our own sections use warm monochrome (ref-04); concept sites get their brand's grade. */
const grades = {
  warmMono: (img) => img.grayscale().linear(1.06, -6).tint({ r: 178, g: 152, b: 116 }),
  steel: (img) => img.modulate({ saturation: 0.82, brightness: 0.98 }).linear(1.08, -10),
  cinema: (img) => img.modulate({ saturation: 0.6, brightness: 0.95, hue: 4 }).linear(1.05, -6),
  gallery: (img) => img.modulate({ saturation: 0.55, brightness: 1.03 }),
};

const jobs = [
  // 02 Introduction
  { src: 'pexels-9057783-evstafev.jpg', name: 'intro-crane', crop: { left: 1056, top: 0, width: 1340, height: 1675 }, widths: [1340, 900, 560], grade: 'warmMono' },
  { src: 'pexels-6032905-brunxs.jpg', name: 'intro-frame', crop: { left: 0, top: 120, width: 2400, height: 1440 }, widths: [1200, 720], grade: 'warmMono' },
  // 03 Concept A — Halden Structural
  { src: 'pexels-13986101.jpg', name: 'a-tower', crop: { left: 0, top: 0, width: 2400, height: 2180 }, widths: [1200, 800, 540], grade: 'steel' },
  { src: 'pexels-14539147.jpg', name: 'a-weld', crop: { left: 0, top: 0, width: 2400, height: 1598 }, widths: [900, 600], grade: 'steel' },
  // 03 Concept B — Maison Aurel
  { src: 'pexels-26859026.jpg', name: 'b-pool', crop: { left: 0, top: 0, width: 2400, height: 1600 }, widths: [1600, 1000, 640], grade: 'cinema' },
  { src: 'pexels-31817156.jpg', name: 'b-villa', crop: { left: 0, top: 0, width: 2400, height: 1600 }, widths: [1600, 1000, 640], grade: 'cinema' },
  { src: 'pexels-31817163.jpg', name: 'b-living', crop: { left: 0, top: 0, width: 2400, height: 1600 }, widths: [1600, 1000, 640], grade: 'cinema' },
  // 03 Concept C — Atelier Nord
  { src: 'pexels-14086482.jpg', name: 'c-concrete', crop: { left: 0, top: 300, width: 2400, height: 3000 }, widths: [900, 600], grade: 'gallery' },
  { src: 'pexels-6127360.jpg', name: 'c-white', crop: { left: 0, top: 0, width: 2353, height: 2942 }, widths: [700, 480], grade: 'gallery' },
  { src: 'pexels-8983882.jpg', name: 'c-rail', crop: { left: 0, top: 0, width: 2400, height: 1600 }, widths: [900, 600], grade: 'gallery' },
  // 06 Why us
  { src: 'pexels-15686968.jpg', name: 'why-steps', crop: { left: 0, top: 0, width: 2400, height: 1600 }, widths: [1800, 1200, 720], grade: 'warmMono' },
  { src: 'pexels-14303621.jpg', name: 'why-stair', crop: { left: 0, top: 300, width: 2400, height: 3000 }, widths: [900, 600], grade: 'warmMono' },
];

for (const job of jobs) {
  if (only && !job.name.startsWith(only)) continue;
  const graded = await grades[job.grade](sharp(`assets/source/${job.src}`).extract(job.crop)).toBuffer();
  for (const w of job.widths) {
    const img = sharp(graded).resize({ width: w });
    await img.clone().avif({ quality: 50, effort: 6 }).toFile(`public/images/${job.name}-${w}.avif`);
    await img.clone().webp({ quality: 76 }).toFile(`public/images/${job.name}-${w}.webp`);
  }
  const h = Math.round((job.crop.height / job.crop.width) * 1000) / 1000;
  console.log(`${job.name.padEnd(12)} ${job.crop.width}x${job.crop.height} (h/w ${h}) → ${job.widths.join(', ')}`);
}
