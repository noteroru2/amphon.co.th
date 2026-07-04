// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const sitemapBlockedPrefixes = [
  '/รับซื้อ/รับซื้อ-gopro-',
  '/รับซื้อ/รับซื้อเลนส์-',
  '/รับซื้อ/รับซื้อ-hdd-',
  '/รับซื้อ/รับซื้อ-storage-nas-',
];

// https://astro.build/config
export default defineConfig({
  site: 'https://amphon.co.th',
  trailingSlash: 'never',
  compressHTML: true,
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const decoded = decodeURIComponent(page);

        return (
          !decoded.includes('/404') &&
          !decoded.includes('/บริการ/รับซื้อสินค้าไอที') &&
          !sitemapBlockedPrefixes.some((prefix) => decoded.includes(prefix))
        );
      },
      i18n: {
        defaultLocale: 'th',
        locales: {
          th: 'th-TH',
        },
      },
    }),
  ],
});
