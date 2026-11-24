// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { SITE } from './src/site.config.ts';

export default defineConfig({
  site: SITE.url,
  integrations: [react(), sitemap({ filter: (page) => !page.includes('/styleguide') })],
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'always' }, // ~13 KB gzipped CSS: inlining saves a render-blocking round trip
  prefetch: false,
});
