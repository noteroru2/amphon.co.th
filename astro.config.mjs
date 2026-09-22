// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import {
  buildTrustworthyLastmodMap,
  dateOnlySitemapIntegration,
  serializeTrustworthyLastmod,
} from './scripts/lib/trustworthy-sitemap-lastmod.mjs';
import { shouldIncludeInSitemap } from './scripts/lib/sitemap-inclusion.mjs';
import { rehypeLocalImageDimensions } from './scripts/lib/rehype-local-image-dimensions.mjs';

const { lastmodByPath } = buildTrustworthyLastmodMap();

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  site: 'https://amphon.co.th',
  trailingSlash: 'never',
  compressHTML: true,
  redirects: {
    '/ปริการ/รับซื้อแรม': '/บริการ/รับซื้อแรม',
    '/บริการ/รับีการ/รับซื้อแรม': '/บริการ/รับซื้อแรม',
    '/บริการ/รัปซื้อแรม': '/บริการ/รับซื้อแรม',
    '/บริการ/รัปซื้อกล้อง': '/บริการ/รับซื้อกล้อง',
    '/ปรุกร/รัปซื้อกล้อง': '/บริการ/รับซื้อกล้อง',
    '/บริการ/รัปซื้อกล้องฟิล์ล': '/บริการ/รับซื้อกล้องฟิล์ม',
    '/บริการ/รัปซื้อกล้องฟิลัม': '/บริการ/รับซื้อกล้องฟิล์ม',
    '/บริการ/รัปซื้อกล้องฟิล์ม': '/บริการ/รับซื้อกล้องฟิล์ม',
    '/บราการ/รัปซื้อกล้องฟิล์ม': '/บริการ/รับซื้อกล้องฟิล์ม',
    '/ปริการ/รัปซื้อกล้องฟิล์ม': '/บริการ/รับซื้อกล้องฟิล์ม',
    '/ปริาร/รัปซื้อกล้องฟิมูอง': '/บริการ/รับซื้อกล้องฟิล์ม',
    '/บริการ/รัปซื้อ-airpods': '/บริการ/รับซื้อ-airpods',
    '/blog/วิธีเช็กรุ่น-ipad-ว่ิำเป็น-gen-ไหน': '/blog/วิธีเช็กรุ่น-ipad-ว่าเป็น-gen-ไหน',
    '/บริการ/รัปซื้อคอมบริษัฟ': '/บริการ/รับซื้อคอมบริษัท',
    '/บริการ/รัปีงอกคอมบริษัท': '/บริการ/รับซื้อคอมบริษัท',
    '/บริการ/รับซื้อมือถือ': '/บริการ/รับซื้อโทรศัพท์มือสอง',
  },
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
  markdown: {
    rehypePlugins: [rehypeLocalImageDimensions],
  },
  integrations: [
    sitemap({
      filter: (page) => shouldIncludeInSitemap(page),
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