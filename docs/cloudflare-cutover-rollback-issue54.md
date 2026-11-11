# AMPHON amphon.co.th — Cloudflare cutover / rollback runbook (Issue #54)

> **SUPERSEDED for current cutover/DNS state:** [Cloudflare Production Cutover Plan](cloudflare-cutover-production-plan-issue54.md), updated 2026-11-11. Historical details below include obsolete apex DNS CNAME and earlier API/pre-lock status. Do not execute rollback from old observations; use a fresh Cloudflare DNS dashboard snapshot and the new plan. No production/DNS changes authorized.

**Status:** PREPARED, **NOT EXECUTED**. No changes to Production or DNS are authorized by this document. Make all actual changes only after SEO parity evidence and Owner approval.

## Verified reference points (as of 2026-11-11)

- GitHub repository: `noteroru2/amphon.co.th`
- Migration branch: `infra/cloudflare-workers-preview`, Draft PR #55.
- Vercel team: `amphons-projects-bb1ec3bf`, project `amphon-co-th`, project ID `prj_qq9KKWiGxeKiiAx3uFqe3VO808OT`.
- Last verified **production** Vercel deployment ID: `dpl_DmtdiCXTsy6zBMKNVEehFyMoUBwr`, GitHub commit `1d235196f45e29af4c425fa4505111596db8e4c6` (may change; re-read immediately before cutover).
- Vercel has `amphon.co.th` and `www.amphon.co.th` verified; `www` redirects to apex with 301.
- Production live HTTP baseline: GitHub Actions Run 42969091845. All 12 priority pages 200, 257/260 expected exact redirects match, three film-camera typo URLs returned 404 (existing Production drift). Six trailing slash URLs returned **308**.
- Cloudflare Preview Worker **is live** at `https://amphon-co-th.noteroru2.workers.dev/`; Cloudflare dashboard project `amphon-co-th` is wired to branch `infra/cloudflare-workers-preview`. It has **NO custom domain**. Cloudflare build/deploy succeeded at commit `0dc5021b1905a5a33ef0fecbb645abbf0af51673` and later committed the three film-camera percent-encoded redirect fixes. Live HTTP QA (GitHub Actions run 42977796857, re-run) passed **260/260 exact redirects**, four trailing slash 308 checks, nine priority routes and preview `noindex`. The Google Reviews API still returns expected 503/no-store because its secrets are not yet migrated. This is **preview-only**; Production DNS stays on Vercel.

## Read-only Cloudflare DNS verification (2026-11-11, no change)

Verified in the user's authenticated Cloudflare dashboard for zone `amphon.co.th`:
- Zone plan: Free.
- `amphon.co.th` (apex): CNAME to `b9c77eda4c080f5f.vercel-dns-017.com`; **DNS only** (gray cloud), TTL **10 minutes**.
- `www.amphon.co.th`: CNAME to the **same** Vercel target; **DNS only**, TTL **10 minutes**.
- There are **no Worker routes configured for this zone** in the zone's Workers Routes view.
- Existing Vercel domain verification TXT records are present; keep them unchanged.
- Existing MX/SPF/DKIM and other mail-related DNS records must stay unchanged; do not migrate mail.
- Caution: Worker custom-domain mapping and zone-level route inventory should be checked again immediately before cutover. Preview Worker must not be mapped to either hostname.
- **Rollback reference:** restore both DNS-only CNAME records to the exact Vercel DNS target above, preserve the Vercel domain associations and www→apex 301. Depending on cutover mechanism, remove only the new Worker route/custom domain first and confirm resulting HTTP from outside the Cloudflare dashboard. Do not indiscriminately purge cache or delete unrelated Workers.
- *This confirms rollback configuration is documented, not a successful rollback rehearsal or production cutover.*

## Post-preview SEO regression (new tests)

- GitHub Actions workflow `Cloudflare Live Preview SEO Regression` runs `scripts/cloudflare-seo-regression.mjs`, checks canonical URL sets in sitemap-index and child sitemaps, all sitemap pages' HTTP/SEO metadata, preview-only X-Robots-Tag noindex, two 404 URLs, ten trailing slash 308 cases, 150 internal links and 100 image/CSS/JS samples from the rendered pages. Artifacts are retained 30 days.
- Any mismatch in indexable URLs, unexpected 404/5xx, broken internal links, or missing media assets is a **NO-GO**. If Vercel Production reflects an older commit, evaluate SEO title/content drift against the *approved* release SHA; no claim of 100% parity solely from common URL counts.
- Preview `noindex,nofollow` comes from `_headers`; before production cutover, replace preview-only noindex with production-safe header policy and add a production guard that actively tests **absence** of noindex.
- Keep `main` and PR #55 unmerged until approval. Do not change the source `vercel.json` three film-camera source strings: the Cloudflare migration generator performs the percent-encoding workaround.

## Validated P0 evidence — 11 November 2026 (read-only, preview-only)

- **Live Cloudflare redirect parity:** 260/260 Vercel exact rules return expected status/target on `https://amphon-co-th.noteroru2.workers.dev`. The three film-camera typo slug sources were percent-encoded only in Cloudflare's generated `_redirects`; `vercel.json` was left unchanged. Source commit `833f40df634aab0ececc95d9823da225682f41ac`. Evidence: [GitHub Actions Live HTTP QA #42977796857](https://github.com/noteroru2/amphon.co.th/actions/runs/42977796857), latest successful re-run.
- **Full live SEO regression:** [GitHub Actions #42980686433](https://github.com/noteroru2/amphon.co.th/actions/runs/42980686433), tested the real workers.dev hostname vs live Vercel Production:
  - `sitemap-index.xml` and `sitemap-0.xml`: each origin lists **1,189 URLs**, missing/extra **0**.
  - **1,193/1,193** sitemap + protected URLs passed HTTP/preview noindex/canonical; **0** title, description, JSON-LD schema differences reported in that comparison.
  - **2/2** non-existent URLs returned 404 on both origins; Preview adds noindex.
  - **10/10** trailing slash routes return 308 on both origins with matching destinations.
  - **150/150** tested internal links resolve; **46/46** sampled image/CSS/JS/other static assets resolve.
- **Source quality/CI:** [GitHub Actions #42980692618](https://github.com/noteroru2/amphon.co.th/actions/runs/42980692618) covers build/SEO/checks for candidate commit `cb52ff7226547032adc2cf81c0c5b0ec2e0bfea9`; read the final result before cutover.
- **Preview Google Reviews API:** `/api/google-reviews` is correctly isolated: 503 `not_configured`, `Cache-Control: no-store`, `X-Robots-Tag: noindex` while secrets are absent. **Success path remains UNTESTED** until runtime secrets are entered securely.
- **Preview noindex is live** (HTTP response header) and is mandatory for preview; it is a **production cutover blocker** unless removed from the production build and verified absent in a separate production-specific test.
- **www to apex** Cloudflare-specific 301 parity is not testable on workers.dev and must be verified at the approved hostname cutover.
- **Production Vercel source drift:** most recent checked Vercel deployment remains `dpl_DmtdiCXTsy6zBMKNVEehFyMoUBwr` on SHA `1d235196f45e29af4c425fa4505111596db8e4c6`; GitHub `main` was `f3f91b804432c9b56542db38d70547f657cd54de` before migration. Though live SEO content comparison passed, explicitly reconcile the intended production release SHA rather than assuming `main` is already live on Vercel.

### Google Search Console pre-cutover reference

Actual Google Search Console **final** data for **amphon.co.th hostname**, not the entire domain property including subdomains, captured on 11 November 2026. Date scope uses GSC Pacific reporting days, excluding preliminary recent data:

| Window | Period | Clicks | Impressions | CTR | Average position |
|---|---|---:|---:|---:|---:|
| 28-day | 2026-10-10 to 2026-11-06 | 1,991 | 84,314 | 2.3614% | 6.7179 |
| 7-day | 2026-10-31 to 2026-11-06 | 580 | 23,522 | 2.4658% | 6.0366 |

GSC source: AMPHON SEO Hub, `seo_gsc_query(site_id='amphon', dimensions=[])`, `dataState=final`, host-filtered; do not sum sampled query rows for property totals. Actual GSC data can lag by several days; record the cutover date in Pacific time as well as Thailand time.

**Post-cutover monitoring plan (not scheduled until cutover has actually occurred):**
- T+0: Live HTTP (home/Notebook/PC/MacBook/B2B/auction/province), canonical/indexability, `www` 301, robots, sitemap, all 260 redirects, 404, CSS/images, Google Reviews API success+fallback, LINE CTA. Roll back immediately on critical failure.
- T+24h: verify production HTTP response statuses, 404/5xx and SEO headers; retain Vercel as rollback and check indexing/crawl errors if reports are available.
- T+7/14/28 **final-data windows**: Google Search Console hostname totals, per-query/page clicks, impressions, CTR, position, pages indexed/not indexed, crawl spikes, branded-vs-buy-intent key queries. Compare to equivalent **previous** 7/14/28-day windows and annotate any simultaneous content changes; do not confuse data lag with traffic loss.
- If major sitemap/indexability errors or sustained SEO lead/traffic anomalies are detected, immediately investigate DNS/crawl/headers and restore Vercel if caused by the migration.

### Remaining P1 before Owner-authorized production cutover

1. **Never deploy the current Preview config to amphon.co.th:** its `X-Robots-Tag: noindex, nofollow` intentionally blocks indexing. Prepare a reviewed production-safe Cloudflare config in a separate approval-gated release and validate no `noindex`, preserving canonical/sitemap/redirects.
2. Set `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID` through Cloudflare Secret UI, never GitHub or chat. Verify Google Reviews API successful click-to-load behavior and quota/fallback. Do not disclose secret values in logs. Keep existing Vercel setup untouched.
3. Freeze an exact GitHub release SHA after reconciling Vercel's Production SHA vs main. Lock Cloudflare adapter/Wrangler dependencies for repeatable deploys; preview currently installs pinned direct versions without a migrated lockfile.
4. Choose Worker custom-domain routing mechanism, ensure apex SSL and `www` 301, preserve mail DNS, snapshot DNS and Vercel rollback candidate. Reconfirm DNS values on the actual cutover day.
5. Obtain explicit Owner approval for the specific SHA and DNS/route modifications **after** production-safe noindex and API gates pass. Only then perform cutover and post-cutover verification.

## P1 Step 1 & 2 — Verified runtime Google Places API and production-candidate noindex guard (2026-11-11)

- **Cloudflare Worker runtime secrets** `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID` were configured by Owner in the existing `amphon-co-th` Worker. The live Workers.dev endpoint `/api/google-reviews` subsequently returned **HTTP 200** with actual place data (business name, rating and review count). The automated [live HTTP QA workflow #42985391665](https://github.com/noteroru2/amphon.co.th/actions/runs/42985391665) passed. The response had `Cache-Control: no-store, max-age=0` and JSON-only `X-Robots-Tag: noindex,nofollow`. **No API keys or Place IDs were copied into GitHub**, logs or this runbook.
- **Production candidate configuration was created but NOT DEPLOYED:** `astro.config.cloudflare.production.mjs` invokes the Cloudflare routing generator in explicit `mode:'production'` and has a fail-closed static-header guard rejecting `X-Robots-Tag: noindex`. Existing `astro.config.cloudflare.mjs` and the Cloudflare Worker GitHub build remain preview-only; Preview intentionally retains `X-Robots-Tag: noindex,nofollow`. The standalone `/api/google-reviews` JSON response remains noindex in both modes by design.
- [Cloudflare Production Candidate Safety QA (NO DEPLOY) workflow #42985634638](https://github.com/noteroru2/amphon.co.th/actions/runs/42985634638) **PASSED**: guard/unit tests 3/3, Astro production-candidate build, 1191 SEO/JSON-LD validations, Wrangler dry-run, local Cloudflare HTTP smoke 20/20 cases, including 11 indexable pages, three encoded Thai redirects, slash redirects, 404, and unconfigured local API fallback. There is still **no live production-candidate hostname**; real HTTP headers on the final domain require a separate Owner-approved cutover check.
- **Important limitation:** This isolated preview branch still installs Cloudflare packages during build with pinned direct versions rather than a committed migration lockfile; Step 3 will address repeatable dependency and release SHA parity. Cloudflare internal environment label `Production` on the Worker refers to its `workers.dev` deployment, **not** the apex `amphon.co.th` domain.

## Mandatory rollback prerequisites / preflight sign-off

1. On Cloudflare Dashboard identify the exact zone/account, nameserver status and worker route/custom-domain attach method. **Record before changing anything**: proxied flag, A/AAAA/CNAME targets for apex/www, Worker routes, redirect rules, WAF, security headers, DNS TTL, TLS status and screenshots or exports. Public DNS alone may show Cloudflare proxy, not the Vercel origin target.
2. Confirm the verified Vercel Production deployment is healthy and accessible, with the desired domain association still valid; record its exact ID/commit, inspector URL and public hostname.
3. Freeze the release SHA from `main` and the reviewed migration PR; ensure previews are noindex, Production is indexable, no accidental `X-Robots-Tag: noindex`.
4. Verify successful Cloudflare live Preview HTTP for all 260 exact Redirects, additional Astro rules, dynamic trailing slash variants with **308** parity, Thai Unicode/percent encoded paths, 404, robots, sitemap, canonical, JSON-LD, Google Reviews API and LINE CTA.
5. Save the Cloudflare Worker deployment/version and account before attaching the custom domain. Keep all Vercel billing, domain configuration and traffic path intact during rollback window.
6. Get explicit written Owner approval specifying target SHA, Cloudflare Worker/account/zone and exact planned changes to DNS/routing. Do not use a Preview hostname for Production.

## Cutover procedure (only after prerequisites)

1. Stop concurrent Vercel and Cloudflare auto-publishing to the domain; freeze app code and DNS changes.
2. Validate Cloudflare ready-to-serve Preview in a second region, including Thailand. Reconfirm SEO metadata parity and API secrets stored as Cloudflare secrets, not code/CI logs.
3. Attach the Worker using the **approved** Cloudflare route or custom domain. If this operation mutates a Cloudflare DNS record, keep exact previous record target, proxy setting and TTL available for restoration.
4. Validate homepage, Notebook, PC, MacBook, contact, about, company/lot/auction pages, `robots.txt`, `sitemap-index.xml`, `llms.txt`, exact/Thai redirects, `www` 301 and Google Reviews; inspect response headers and status.
5. Enable error/5xx and uptime monitoring; compare live response inventory and GSC crawl/indexability data.

## Immediate rollback triggers (not a waiting period)

- Any main service page returns 5xx, unexpected 404, redirect loop, wrong canonical, or accidental `noindex`.
- `robots.txt` or Sitemap cannot be fetched, major static assets/LINE CTA missing, or broken API that affects conversion.
- Significant 5xx spike, TLS failure, broken domain redirect, or widespread redirect status/location mismatch.

## Rollback procedure

1. **Do not delete existing Vercel Production** or its domain association.
2. On Cloudflare, remove/disable **only the newly added Worker route or custom-domain mapping** for `amphon.co.th`, restoring the exact previously recorded DNS target/proxied settings where they were modified. Do not remove unrelated Workers (AI Buyer, other websites) or change account-wide DNS/Nameservers.
3. Confirm Vercel's intended Production deployment serves the domain again, `www` still redirects 301 to apex, TLS is valid.
4. Re-run the read-only baseline script `node scripts/cloudflare-production-baseline.mjs https://amphon.co.th` from an internet-enabled runner; verify 12 priority pages, 260 redirect fixtures, six slash variants, 404/robots/sitemap/canonical/API and LINE CTA.
5. If prior DNS routing still propagates, check the Cloudflare edge configuration/old origin, purge only relevant cache after cause is isolated; do not use a blanket cache purge as a substitute for fixing origin routing.
6. Document cause, incident time and result in Issue #54; keep PR #55 Draft and review again.

## Release go/no-go

**NO-GO** unless live Preview, every critical SEO regression gate and rollback rehearse are complete. Any change to Production/DNS must be separately approved and executed by an authorized owner.

References: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/ and https://vercel.com/docs/deployments/rollback-a-deployment
