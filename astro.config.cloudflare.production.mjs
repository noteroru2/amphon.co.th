import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import fs from 'node:fs';
import vercelConfig from './astro.config.mjs';
import { generateCloudflareRouting } from './scripts/cloudflare-routing.mjs';

// CANDIDATE CONFIG ONLY. NOT USED BY THE LIVE PREVIEW'S GITHUB BUILD.
// No deploy to amphon.co.th is permitted until release SHA, API and DNS gates
// have been explicitly approved in Issue #54.
const productionRoutingGuard = {
  name: 'amphon-cloudflare-production-routing-guard',
  hooks: {
    'astro:build:done': () => {
      const result = generateCloudflareRouting(undefined, { mode: 'production' });
      if (result.mode !== 'production' || result.previewNoindex
        || result.staticRedirectCount !== 260 || result.dynamicRedirectCount !== 1) {
        throw new Error('Cloudflare Production routing safety validation failed');
      }
      const headers = fs.readFileSync('dist/client/_headers', 'utf8');
      if (/^\s*X-Robots-Tag:\s*[^\n]*\bnoindex\b/im.test(headers)) {
        throw new Error('Cloudflare Production output must not contain an X-Robots-Tag noindex header');
      }
    },
  },
};

export default defineConfig({
  ...vercelConfig,
  integrations: [...(vercelConfig.integrations ?? []), productionRoutingGuard],
  adapter: cloudflare({ prerenderEnvironment: 'node', imageService: 'compile' }),
});
