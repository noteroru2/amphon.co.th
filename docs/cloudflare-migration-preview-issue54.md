# Cloudflare Workers migration — Preview build (Issue #54)

This branch is a **preview-only technical proof of concept**. Cloudflare's workerd binary shipped with the pinned preview tools supports compatibility_date 2026-11-10 (not 2026-11-11); use the tested date. The adapter uses build-time image compilation to avoid automatic runtime Cloudflare Images usage. Do not merge, attach custom domains, set production secrets, or deploy to production until the SEO parity gates pass.

## Files

- `astro.config.cloudflare.mjs` preserves the standard Vercel `astro.config.mjs` and replaces only the adapter for a separate Cloudflare build.
- `wrangler.jsonc` uses Cloudflare Static Assets in \`dist/client\`, routing Worker only for `/api/*`. The preview name is intentionally not the production domain.
- `scripts/cloudflare-routing.mjs` generates `dist/client/_redirects` and `dist/client/_headers` from `vercel.json`. It **does not port** the one Vercel `/:path+/` trailing slash rule: Cloudflare `html_handling=drop-trailing-slash` must be tested for status parity.
- `src/pages/api/google-reviews.ts` reads `process.env` runtime bindings in Cloudflare (Node compatibility) and falls back to the existing Vercel `import.meta.env` behavior.

## Run on a Node 22 runner

```bash
npm ci
npm install --no-save --package-lock=false @astrojs/cloudflare@13.7.0 wrangler@4.100.0
node --test scripts/cloudflare-routing.test.mjs
npx astro build --config astro.config.cloudflare.mjs
node scripts/cloudflare-routing.mjs
npm run validate:seo
npx wrangler deploy --config dist/server/wrangler.json --dry-run --outdir .cloudflare-preview-dryrun
```

This preview deliberately installs adapter tools without altering the production lockfile. Before using Cloudflare Builds, commit properly locked dependencies and set the build command to the validated Cloudflare preview build. Do not call `wrangler deploy` without `--dry-run` during QA.

## Mandatory gaps prior to DNS cutover

1. Match Vercel vs Cloudflare **all indexable routes** including 921-route audit, title/meta/schema/canonical, Sitemap Index, robots.txt and llms.txt.
2. Verify all 260 static Vercel redirects, encoded/unicode Thai paths, **dynamic trailing slash rule**, no redirect chains/loops, 301/308 parity, and www->apex 301.
3. Verify 8 header rules, cache behavior, static image paths, response codes 404/410 and exact content-type.
4. Verify `/api/google-reviews` only after the Google key and Place ID are entered securely as Cloudflare secrets; preserve no-store and quota, error fallback and click-to-load. Never place key in repository, CI logs or preview artifacts.
5. Measure output file count (< 20,000 on Free) and individual size (< 25 MiB), build duration (< 20 min if Cloudflare Builds used) and TTFB/LCP on Thai mobile.
6. Verify noindex on preview, **remove it in a separate approved production configuration**; maintain same canonical URLs and published content.
7. Save DNS/origin state, review approved commit, get explicit Owner approval before production switch. Keep Vercel as rollback.

Reference: https://developers.cloudflare.com/workers/static-assets/migration-guides/vercel-to-workers/astro/

## Production HTTP baseline

`scripts/cloudflare-production-baseline.mjs` performs read-only HTTP checks from a GitHub Actions runner: all 260 exact Vercel redirects, 12 high-priority pages/files, 6 slash variants, and the `www` 301. It writes `artifacts/cloudflare-migration/production-http-baseline.json` and uploads it to GitHub Actions. Mismatches are evidence, not automatically proof of a Cloudflare regression: Production is currently behind `main`. The script can be rerun against an authenticated, available Cloudflare Preview URL after the Cloudflare profile is connected; compare both JSON reports at identical code versions before cutover.

**Do not use this audit to hit the live Google Places API:** `/api/google-reviews` is intentionally excluded so audits cannot consume the Google quota.

## Rollback preparation and local HTTP smoke

- `docs/cloudflare-cutover-rollback-issue54.md` records the last verified Vercel Production deployment and the cutover/restore checklist; actual DNS and Worker bindings must still be captured from Cloudflare after sign-in.
- `scripts/cloudflare-local-smoke.mjs` starts a temporary local Wrangler Worker and verifies key static URLs, Preview `noindex`, legacy redirects, slash status and the **unconfigured** Google Reviews API fallback contract. It never calls the Google Places upstream API.
