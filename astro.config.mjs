import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://tomaszknura.dev',
  build: {
    inlineStylesheets: 'never',
  },
});
