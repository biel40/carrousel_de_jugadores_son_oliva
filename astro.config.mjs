// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: vercel({
    // Permite rutas dinámicas (API endpoints)
    isr: false,
  }),
});
