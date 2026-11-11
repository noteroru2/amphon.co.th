import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import vercelConfig from './astro.config.mjs';
import { generateCloudflareRouting } from './scripts/cloudflare-routing.mjs';

// This isolated branch builds Cloudflare while main keeps Vercel's adapter.
// Build-time hook guarantees preview redirects and noindex even if the dashboard
// build command only calls "astro build". Do not use this config for production
// until the noindex policy is explicitly removed after owner-approved SEO QA.
const previewRoutingGuard = {
  name: 'amphon-cloudflare-preview-routing-guard',
  hooks: {
    'astro:build:done': () => {
      const report = generateCloudflareRouting();
      if (!report.previewNoindex || report.staticRedirectCount !== 260 || report.dynamicRedirectCount !== 1) {
        throw new Error('Cloudflare Preview routing/noindex guard failed');
      }
    },
  },
};

export default defineConfig({
  ...vercelConfig,
  integrations: [...(vercelConfig.integrations ?? []), previewRoutingGuard],
  adapter: cloudflare({ prerenderEnvironment: 'node', imageService: 'compile' }),
});
