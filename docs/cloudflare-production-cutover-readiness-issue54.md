# Issue #54 — AMPHON Production Cutover & Rollback Readiness (2026-11-11)
**STATUS: PLAN / TESTED RC / CUTOVER NOT AUTHORIZED. Do not merge, promote, attach apex/www custom domains, edit DNS, change nameservers, or deploy to a live production Worker.**

## Executive decision — recommended SEO-safe release
**Recommended option A: infrastructure-only release.** Base the first Cloudflare production release on the exact Vercel Production Git commit \`1d235196f45e29af4c425fa4505111596db8e4c6\`, then add ONLY Cloudflare infrastructure files and minimal Google Reviews runtime compatibility. Do **not** ship the 180 service-area SEO edits with the host switch. Publish those later in their own measured SEO release after traffic stabilizes.

This is implemented for **dry-run only** on branch \`infra/cloudflare-production-rc-baseline\`. It is NOT mergeable to \`main\` without reversing separately approved SEO content; deployment, if later authorized, must be from a reviewed exact RC SHA (not a merge that changes its content).

### Verified source and rollout identity

| Component | Verified value / evidence |
| --- | --- |
| Live Vercel app | READY deployment \`dpl_DmtdiCXTsy6zBMKNVEehFyMoUBwr\`; Git SHA \`1d235196f45e29af4c425fa4505111596db8e4c6\` |
| GitHub \`main\` | \`f3f91b804432c9b56542db38d70547f657cd54de\` (one later SEO commit, NOT live) |
| Cloudflare migration Preview branch | \`infra/cloudflare-workers-preview\`, head \`1f3ddecf9368897c63ca4242c41e3b1c1257cb06\`, PR #55 DRAFT |
| Cloudflare Staging branch | \`infra/cloudflare-production-staging\`, head \`4ac4689a1c9272314030960bffb317d3048e1f23\`, PR #56 DRAFT |
| Production RC audit branch | \`infra/cloudflare-production-rc-baseline\`, exact final head must be frozen **after final QA and document update**. The branch has no DNS/routes/deploy operation. |
| Cloudflare account / zone | account \`2382f4589cd2452e9e3b7b83c25d4fc0\`, zone \`amphon.co.th\`; known authoritative NS \`deb.ns.cloudflare.com\` and \`jake.ns.cloudflare.com\`. |
| Staging website | \`https://cf-test.amphon.co.th/\`; protected by global HTTP \`noindex\`, should never be attached to apex/www. |

**No SEO-content drift in RC:** GitHub Actions explicitly compared \`git diff --name-only 1d235196...HEAD\` against a restricted migration-file allowlist: ZERO source-content changes. Do not casually \`git merge main\` into this branch.

### SEO Issue #50 / 180 page assessment

GitHub Compare \`1d235196...f3f91b8\` proves exactly **1 commit, 186 modified files**:
- **180 modified Markdown pages** in \`src/content/serviceAreas/\`; no page additions/deletions. Examples include Nakhon Ratchasima/Udon Thani paired content, older thin Server/Network/Drone and other service-area pages, and revision of \`updated\` dates to 2026-11-11.
- **6 remaining files**: 4 support scripts, one SEO CI workflow and one Service Area layout.
- Total diff **+3,424 / −488 lines across all 186 files**. Code/source review suggests editorial expansions, but **this does not prove organic traffic improvement** and there is no basis to attribute ranking changes to content when host and site content change together.

**SEO decision:** first cutover = no SEO 180-page batch; separate Issue #50 controlled release later, prioritized by actual GSC click/impression data; recheck service pages' visible text (not just titles/meta), factual claims, locality and price evidence. Keep existing 1,189 indexable sitemap URL inventory and internal canonical paths. Explicit Owner approval required even if the alternative content-inclusive release is chosen.

### Live Staging acceptance already performed (NOT a Production release)

[CI Live Staging #43010084967](https://github.com/noteroru2/amphon.co.th/actions/runs/43010084967) — **SUCCESS**, on actual custom domain:
- Valid HTTPS certificate issued by Google Trust Services, SAN includes \`cf-test.amphon.co.th\`. This is NOT evidence that Cloudflare apex and www are already bound to the Worker.
- **1,195/1,195** live pages: HTTP 200, canonical \`https://amphon.co.th\`, and mandatory Staging \`X-Robots-Tag: noindex\`.
- Sitemap **1,189/1,189** vs Vercel live; **260/260** legacy redirects; slash 308, 404 verified.
- Google Places JSON API **HTTP 200**, rating **5**, \`reviewCount=76\`, 5 reviews returned, \`no-store\` and **API-only noindex**.
- Existing **Vercel** www→apex 301 preserves path and query, not a test of the future Cloudflare redirect rule.

### Production-only build and noindex policy

[Production RC QA #43030169231](https://github.com/noteroru2/amphon.co.th/actions/runs/43030169231) — **SUCCESS**, all tests local/DRY RUN:
- Original live Vercel SEO content source preserved exactly.
- \`astro.config.cloudflare.production.mjs\` creates **indexable** HTML (no global \`X-Robots-Tag: noindex\`). JSON-only \`/api/google-reviews\` retains API \`noindex\` by design.
- \`scripts/cloudflare-release-finalize.mjs\` removes **14** duplicate Astro adapter redirect sources; result **263 unique rules** = 260 original Vercel + 2 unique Astro + 1 wildcard slash. Does not decode/collapse intentionally distinct raw-Thai vs percent-encoded Vercel paths.
- Locked \`npm ci\`, exact \`@astrojs/cloudflare 13.7.0\`, \`wrangler 4.100.0\`, Node \`22.23.4\`. Wrangler \`--dry-run\` and local HTTP 20/20 tests passed, including 11 indexable pages, 308 slash/Thai redirects, 404 and safe API fallback.
- Audit Worker name \`amphon-co-th-rc-audit\` and output \`dist/server/wrangler.rc-audit.json\` have **NO custom domain/route**, and deliberately NO production KV namespace. **THIS CONFIG IS NOT APPROVED FOR PRODUCTION DEPLOYMENT.** Create a dedicated Production Worker only after approval, with new isolated SESSION KV and runtime Secrets.

### DNS, Vercel rollback and TLS snapshots (read-only)

Read-only public DNS from CI (11 Nov 2026 20:34 Thai time):
- Nameservers: \`deb.ns.cloudflare.com\`, \`jake.ns.cloudflare.com\`.
- Apex \`amphon.co.th\`: public A values \`64.29.17.65\` and \`216.198.79.65\`; public CNAME absent (apex flattening or A records indistinguishable from public data).
- \`www.amphon.co.th\`: public CNAME **\`b9c77eda4c080f5f.vercel-dns-017.com\`**, public A resolving to the same Vercel IPs.
- \`cf-test.amphon.co.th\`: resolves to Cloudflare anycast (104.21.75.24, 172.67.210.64) and IPv6 addresses. This does not alter apex/www.
- Mail-safety sentinel: **3 MX, 2 TXT**, 0 CAA reported by public recursive resolver; do NOT alter MX, SPF, DKIM, DMARC, TXT verifications, other subdomains or Email Routing.
- Earlier authenticated Cloudflare zone check identified apex/www as **DNS-only CNAME to Vercel** with TTL **600s**. Vercel API currently reports apex configuredBy **A** and the public recursive DNS returns A. **Resolve this difference by re-reading the actual Cloudflare DNS Records screen/API before cutover.** Do not assume a public A answer proves the original record type or proxy flag.
- Vercel domain associations: both hostnames verified, www→apex configured **301**.
- Vercel fallback certificate inventory: apex cert expires **2026-12-30 14:00:06 UTC**, www cert expires **2026-12-29 04:07:55 UTC**; both auto-renew. The Cloudflare \`cf-test\` certificate SAN does NOT by itself establish active TLS on a migrated apex/www.
- Keep old Vercel deployment, project, domain configuration and certificates intact throughout cutover and rollback window.

## Target Cloudflare architecture — must be reviewed but NOT provisioned yet

1. New independently named **production** Worker, NOT \`amphon-co-th\` Preview, NOT \`amphon-co-th-staging\` (Staging has global noindex). Suggested \`amphon-co-th-production\`; git release from the **Owner-approved exact SHA**, production-only Astro build, redirect finalizer.
2. No public indexable \`workers.dev\` Preview before apex binding. Create the production Worker initially with \`workers_dev:false\`, \`preview_urls:false\` and **no routes**; verify artifact/build and identity before attaching domain. Never attach apex to the staging Worker.
3. Dedicated new \`SESSION\` KV namespace for Production (do not reuse Staging id \`6563771299d44a43844dcb4e8e9093ec\`), plus per-Worker runtime Secrets \`GOOGLE_PLACES_API_KEY\` and \`GOOGLE_PLACE_ID\` securely configured in Cloudflare (no raw values in GitHub or chat). Check quotas/fallback at the time of approval.
4. \`amphon.co.th\` to production Worker via **exact-hostname Custom Domain**, only when authorized. Cloudflare Custom Domain may create/replace an apex DNS record and issue a certificate. Existing Vercel apex CNAME/A record can conflict and must be reconciled, never blindly deleted.
5. \`www.amphon.co.th\` must get **Cloudflare-side 301 to \`https://amphon.co.th\`** with original path and query preserved. Preferred separate Cloudflare Redirect Rule / Bulk Redirect and **proxied** www DNS record (originless \`A 192.0.2.0\` placeholder per Cloudflare docs) so the redirect executes at Cloudflare edge. The existing Vercel www redirect ceases to be sufficient once DNS is moved. Check any existing Pages/Redirect Rules for conflicts.
6. Cloudflare production SSL must cover **both exact hostnames**. \`cf-test\` SAN containing apex is not a substitute for a successful https://amphon.co.th and https://www.amphon.co.th handshake at the approved cutover.
7. Keep \`cf-test\` isolated and noindexed after production cutover; never turn Staging's global noindex into a Worker-level shared setting used by production.

## Go / No-Go requirements

| Gate | Current state / action |
| --- | --- |
| Staging custom-domain TLS, SEO, API, 260 redirects | **PASS** |
| Baseline-content-preserving, indexable RC local Build and dry-run | **PASS** |
| Security vulnerability report | **REVIEW**: \`npm ci\` reports 27 total (1 critical / 22 high / 3 moderate / 1 low) across full installed tree; classify actual runtime dependencies separately before approval. Do NOT assume all are Production-exploitable; do not auto-upgrade with content release. |
| Exact final RC SHA frozen / approved by Owner | **NO-GO**, not yet approved |
| Production Worker with separate KV, runtime Secrets, no public noindex | **NOT CREATED / NOT DEPLOYED** |
| Live Cloudflare HTTPS for apex and www after switch | **NOT YET TESTABLE** without authorized hostname binding |
| Cloudflare edge www→apex 301 with suffix/query | **DESIGNED, NOT DEPLOYED** |
| Current Cloudflare authenticated apex/www DNS snapshot including type/target/proxy/TTL plus full mail DNS export | **PENDING** |
| Verified restoration route to Vercel and rollback operator | **DOCUMENTED, NOT REHEARSED ON DOMAIN** |
| Explicit written approval of exact SHA + hostname/DNS actions | **NOT GIVEN** |

**Cutover remains strictly NO-GO until Owner signs off.**

## Owner-approved execution sequence (ONLY AFTER a separate explicit approval)

**T−24h to T−1h preparation**
1. Freeze the exact approved RC SHA; verify CI and confirm \`git diff\` vs live Vercel contains ZERO SEO page changes, npm runtime dependency risk, all 260 redirects and noindex policy. Freeze concurrent host and SEO releases. Do not merge main into the RC.
2. Record Cloudflare zone **actual** apex and www DNS record types, values, proxy flags, TTL, zone-level Workers Routes, Custom Domains, SSL/TLS/CAA/Redirect Rules/WAF/Bot Pref Sync settings and full DNS export. Record Vercel project ID/deployment SHA/domain associations and fallback IP/CNAME as above. Confirm no unrelated records touched.
3. Create production-only Worker with exact approved content and a **new** production SESSION KV. Configure runtime Places Secrets via Dashboard; protect/disable publicly accessible workers.dev routes before production custom domain activation. Prepare rollback access/account permissions.
4. Ensure planned www redirect 301 preserves exact path+query, and Cloudflare SSL can be issued. Check Cloudflare Bot rules do not block critical Googlebot, Bingbot or legitimate AI Search crawlers; staging noindex stays confined to cf-test.

**Approved T0 change — intended order**
5. Under a dedicated change window, prepare/enable the Cloudflare www redirect and proxied originless DNS for **www** (only after backup). Confirm a request to www→apex 301 works with an encoded Thai path and \`?utm_source=test\` while apex still targets Vercel. If broken, rollback the www change before touching apex.
6. Attach the new production Worker to **only apex \`amphon.co.th\`** using a Custom Domain. Where Cloudflare reports the existing Vercel apex DNS record as conflicting, remove/replace only that exact apex record after explicit acknowledgement. Never touch \`shop\`, Hub, API, MX/TXT or other zones. Verify Cloudflare TLS cert and runtime route immediately.
7. From a separate network, test: apex + www HTTPS, 301 status/Location retaining suffix/query, main/Notebook/PC/MacBook/B2B/auction/province pages HTTP 200 + **NO global noindex**, canonical, robots/sitemap 1,189 URLs, 260 redirects with Thai/encoded paths, 404s, \`/api/google-reviews\` HTTP 200/no-store, images/JS/CSS, mobile LINE contact conversion.
8. Confirm both domains resolve to Cloudflare as intended and not stale Vercel; inspect edge errors and latency. Hold reversible Vercel config and deployment unchanged.

**T+0 / T+24h / T+7/14/28**
9. T+0/T+15m/T+60m: priority pages and SEO bot response, 5xx, 301/308 loops, SSL, API, LINE CTA, analytics events. If any P0 fails, rollback promptly; do not wait for GSC.
10. T+24h: sample entire URL inventory, Cloudflare/WAF access logs, Googlebot status, sitemap and indexing anomaly. Monitor lead counts and Vercel fallbacks.
11. T+7/14/28 days: compare **final** GSC hostname-level Clicks, Impressions, CTR, Average Position, indexed URLs and query-page cohorts to equivalent pre-cutover windows; account for data latency and seasonality. Last pre-cutover 28-day reference (2026-10-10 to 2026-11-06) was **1,991 clicks / 84,314 impressions / 2.3614% CTR / average position 6.7179**; 7-day reference **580 clicks / 23,522 impressions / 2.4658% CTR / position 6.0366**. Refresh data at cutover. Keep SEO Issue #50 separate.

## Immediate rollback (written procedure, NOT executed)

**Trigger immediately** on any unexpected production-wide noindex, apex/www TLS failure, redirect loop/incorrect status, significant 5xx, missing critical page or widespread broken Thai redirect, missing primary LINE contact flow, serious Google Places runtime failure affecting conversion.

1. Stop new Cloudflare release mutations; disable/remove only newly added production apex custom-domain route and related conflicting Cloudflare auto-created apex DNS, **not** the cf-test staging Worker or other apps.
2. Restore **exact saved pre-cutover apex DNS type/value/proxy/TTL** (previous dashboard reference: DNS-only CNAME to \`b9c77eda4c080f5f.vercel-dns-017.com\`, TTL 600s; current on-the-day zone snapshot overrides historical assumptions). Keep Vercel Production \`dpl_DmtdiCXTsy6zBMKNVEehFyMoUBwr\` and apex domain verified.
3. Temporarily keeping www→apex on Cloudflare is acceptable while apex restoration finishes IF it still redirects with 301 to healthy Vercel apex. Then disable only the new www redirect rule and restore the **exact saved** Vercel \`www\` DNS-only CNAME/proxy/TTL. Do not touch other redirect rules.
4. Verify HTTPS on both names, Vercel Production response/canonical/noindex, 260 redirects, LINE conversion, and Google Reviews. Expect DNS cache/edge propagation; use independent probes and record actual user-visible recovery.
5. Log incident cause, timestamps, exact DNS/route diff and rollback verification to Issue #54. Do not promote an old Preview or purge all Cloudflare cache as a replacement for restoring routing.

**Rollback limits:** if Cloudflare proxy/CDN rules or DNS propagation remain active, restoration may be delayed; it is not an instant guarantee. Never delete the Vercel deployment/domain mapping while rollback needs it.

## Required Owner approval (NOT requested/executed yet)

When all missing gates close, seek approval mentioning:
- the **exact frozen production RC SHA**;
- **Content scope: Vercel-live baseline, exclude 180 Issue #50 pages** (or explicit alternative with independent risk acceptance);
- Cloudflare account/zone, intended production Worker and new KV namespace;
- explicit permission to change **only** apex Custom Domain/DNS and www proxied DNS + 301 redirect;
- defined rollback operator, old exact DNS records, monitor window and acceptable downtime;
- **no** changes to mail, Hub, Shop, AI Buyer, other domains or Cloudflare workers.

No such approval exists in this task. **Do not cut over, merge PR #55/#56, or edit production DNS based on this document.**

## Authoritative context
- GitHub Issue #54: https://github.com/noteroru2/amphon.co.th/issues/54
- Cloudflare Worker Custom Domains / DNS / redirect behavior: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- Cloudflare www→apex redirects: https://developers.cloudflare.com/pages/how-to/www-redirect/
- Vercel promotion/rollback: https://vercel.com/docs/deployments/rollback-a-deployment
