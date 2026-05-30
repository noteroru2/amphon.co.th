// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://amphon.co.th',
  trailingSlash: 'never',
  compressHTML: true,
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      i18n: {
        defaultLocale: 'th',
        locales: {
          th: 'th-TH',
        },
      },
    }),
  ],
});
