// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import {
  buildTrustworthyLastmodMap,
  dateOnlySitemapIntegration,
  serializeTrustworthyLastmod,
} from './scripts/lib/trustworthy-sitemap-lastmod.mjs';

const { lastmodByPath } = buildTrustworthyLastmodMap();

const sitemapBlockedPrefixes = [
  '/รับซื้อ/รับซื้อ-gopro-',
  '/รับซื้อ/รับซื้อเลนส์-',
  '/รับซื้อ/รับซื้อ-hdd-',
  '/รับซื้อ/รับซื้อ-storage-nas-',
];

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
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
        let pathname = decoded.replace(/^https?:\/\/[^\/]+/, '');
        pathname = pathname.replace(/\/$/, '');

        return (
          !pathname.includes('/404') &&
          !pathname.includes('/บริการ/รับซื้อสินค้าไอที') &&
          pathname !== '/รับซื้อ/รับซื้อคอมพิวเตอร์-อุบลราชธานี' &&
          pathname !== '/บริการ/รับซื้อ-gopro' &&
          pathname !== '/บริการ/รับซื้อ-hdd' &&
          pathname !== '/บริการ/รับซื้อเลนส์' &&
          pathname !== '/บริการ/รับซื้อ-storage-nas' &&
          !sitemapBlockedPrefixes.some((prefix) => pathname.includes(prefix))
        );
      },
      i18n: {
        defaultLocale: 'th',
        locales: {
          th: 'th-TH',
        },
      },
      serialize: (item) => serializeTrustworthyLastmod(item, lastmodByPath),
    }),
    dateOnlySitemapIntegration(),
  ],
});
