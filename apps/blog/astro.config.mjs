import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import solid from '@astrojs/solid-js';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  outDir: '../../dist/apps/blog',
  integrations: [react(), solid(), svelte(), tailwind()],
  site: `https://brianvia.blog`,
});
