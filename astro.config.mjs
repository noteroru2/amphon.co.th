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
