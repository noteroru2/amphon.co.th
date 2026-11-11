import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import vercelConfig from './astro.config.mjs';

// Isolated migration build: the default astro.config.mjs remains Vercel-safe.
// Astro 6 defaults to static output; only routes with prerender=false use Workers.
export default defineConfig({
  ...vercelConfig,
  adapter: cloudflare({ prerenderEnvironment: 'node' }),
});
