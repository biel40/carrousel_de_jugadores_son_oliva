// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // En Astro 5.x, static soporta endpoints dinámicos con prerender = false
  output: 'static',
  adapter: vercel(),
});
