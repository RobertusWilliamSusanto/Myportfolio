import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  build: {
    inlineStylesheets: 'always'
  },
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()]
  }
});
