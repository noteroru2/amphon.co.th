# AMPHON amphon.co.th — Release Candidate & dependency lock audit (Issue #54 / PR #55)
**Recorded 2026-11-11. STATUS: PREPARED / NOT AUTHORIZED FOR DOMAIN CUTOVER.**
Do not merge PR #55 or change DNS/custom domains on the strength of this document.

## Three-source commit audit (verified against live integrations)
| Location | Exact SHA | Interpretation |
| --- | --- | --- |
| Vercel Production READY `dpl_DmtdiCXTsy6zBMKNVEehFyMoUBwr` | `1d235196f45e29af4c425fa4505111596db8e4c6` | Actually serving `https://amphon.co.th`, rollback reference |
| GitHub `main` | `f3f91b804432c9b56542db38d70547f657cd54de` | 1 commit newer than Vercel Production, NOT identical to deployed content |
| Cloudflare migration candidate, verified source snapshot | `e63044ce36a5300e58d74e40fa4743990596bd37` | Isolated `infra/cloudflare-workers-preview` branch based on `main`; includes migration code, tests and shared lock |

**Source drift:** Comparing Vercel SHA → `main` shows **1 commit and 186 modified files**, composed of **180 service-area content files**, **4 scripts**, **1 workflow** and **1 other** (SEO Issue #50 / PR #53). These content changes have not been proven to be served by the current Vercel Production. Live sitemap and canonical parity are *not a full-body content diff*. Infra cutover and SEO content release are separate change variables: request explicit Owner approval for including this batch in the Cloudflare release before attaching the custom domain.

`main` → Cloudflare candidate (SHA above): GitHub Compare reports isolated migration commits and files for Cloudflare build, SEO QA, API compatibility, dependency lock and rollback; no GitHub `main` changes have been made by Issue #54.

## Fully pinned Cloudflare Dependencies
- `package.json` dev dependencies: `@astrojs/cloudflare: 13.7.0`, `wrangler: 4.100.0` (exact pin without `^`).
- `package-lock.json`: `lockfileVersion: 3`, cloudflare+wrangler resolved versions and `sha512` integrity, full dependency tree. Git blob SHA `6f9d60731c49561bb1a721f33e0b67906efc741f`.
- Compared to the original `main` lockfile: 481 original packages, 479 version-unchanged, 2 version changes (`@emnapi/runtime` 1.10.0→1.11.3; `semver` 7.8.1→7.8.6), 126 added, **0 removed**; all 126 added packages with resolved tarballs contain integrity data.
- GitHub Actions CI is pinned to Node **22.23.4** and uses `npm ci` only. No transient `npm install --no-save --package-lock=false` in either Cloudflare Preview QA or Production Candidate QA. The temporary content-write Lockfile bootstrap workflow has been removed.
- **Preview CI passes:** [#42986702916](https://github.com/noteroru2/amphon.co.th/actions/runs/42986702916), and [#42986748167](https://github.com/noteroru2/amphon.co.th/actions/runs/42986748167) after bootstrap removal. Includes Astro Cloudflare Build, SEO, Wrangler dry-run and local HTTP.
- **Production Candidate CI passes, NEVER DEPLOYED:** [#42986693606](https://github.com/noteroru2/amphon.co.th/actions/runs/42986693606); Production HTML/static headers are indexable and Preview HTML/static headers remain noindex, with guarded environment isolation and local Worker tests.
- **Vercel fallback build also passes WITHOUT DEPLOYMENT:** [#42987676685](https://github.com/noteroru2/amphon.co.th/actions/runs/42987676685), using shared locked dependencies and existing Vercel adapter.

## Blocker: Cloudflare Workers Builds dashboard setting has not been updated
Read-only inspection found GitHub connected repo `noteroru2/amphon.co.th`, selected branch `infra/cloudflare-workers-preview`, no custom domains/routes, but dashboard **Build Command** still starts with `npm install --no-save --package-lock=false`. Automated browser could not safely save/verify the full replacement. Therefore **the actual automatic Cloudflare Deploy is NOT yet guaranteed to use the locked dependency tree**, even though Github CI does.

**The Owner needs to update in Cloudflare dashboard → Workers & Pages → Worker `amphon-co-th` → Settings → Builds → edit Build command**, not in `wrangler.jsonc`:
```bash
npm ci && node scripts/cloudflare-lock-verify.mjs && npx astro build --config astro.config.cloudflare.mjs && node scripts/cloudflare-routing.mjs
```
Keep deploy command:
```bash
npx wrangler deploy --config dist/server/wrangler.json
```
Leave Git branch `infra/cloudflare-workers-preview`, root `/`, Preview noindex, runtime secrets and domains as-is. **Do not switch to `astro.config.cloudflare.production.mjs` on this Worker**. Save, reload and verify exact command; run/retry a Preview-only build from a verified release commit and check the public `workers.dev` header `X-Robots-Tag: noindex`. Source: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/ (Workers Builds does not honor Wrangler Custom Builds config).

## Gate list before any Production / DNS action
- [x] Source SHA comparison documented (not resolved to an Owner-approved release SHA).
- [x] Exact dependency and transitive lock generated, reviewed, and committed to isolated branch.
- [x] Pinned-lock Cloudflare Preview + Production Candidate dry-run test and Vercel fallback all passed.
- [x] Cloudflare live Preview returned valid Google Reviews API 200 after secure Worker runtime secrets.
- [x] Prior live Preview 260/260 exact redirects, 1,189/1,189 sitemap URLs, 1,193/1,193 SEO responses, 404s, slash redirects, 150 internal links and 46 asset checks.
- [ ] **Owner manually updates Dashboard Build Command and confirms current preview deployment actually uses the lock.**
- [ ] **Owner explicitly approves final release SHA and whether 180 updated SEO service-area pages are included.**
- [ ] Production-safe Cloudflare environment and deployment tested without static `noindex`, while live workers.dev Preview remains noindex.
- [ ] `www.amphon.co.th` → `amphon.co.th` 301 + HTTPS SSL verified with cutover configuration and domain-specific rollout plan.
- [ ] Cloudflare zone DNS and Vercel fallback snapshot reverified immediately before cutover; get Owner approval of specific DNS/route actions.

**No domain change or `main` merge has been made.** Follow `docs/cloudflare-cutover-rollback-issue54.md` for the verified old Vercel DNS targets and rollback procedure.
