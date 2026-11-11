# AMPHON TRADING — Cloudflare Production Cutover & Rollback Plan (Issue #54)

**Status 2026-11-11: PREPARED. NO PRODUCTION DEPLOY. NO APEX/WWW DNS CUTOVER.** This document is a plan, not authorization to merge, attach domains, change DNS, change nameservers, or release SEO content. It supersedes stale DNS and dependency notes in older Issue #54 runbooks.

## 1. Exact release identity / freeze SEO changes

- Vercel production deployment: **dpl_DmtdiCXTsy6zBMKNVEehFyMoUBwr**, **READY**, SHA **1d235196f45e29af4c425fa4505111596db8e4c6**.
- GitHub main: **f3f91b804432c9b56542db38d70547f657cd54de**, exactly one commit after live Vercel production.
- New host-only release source: **infra/cloudflare-cutover-rc**. Created FROM the exact live Vercel SHA and OVERLAID only Cloudflare adapter/routing/locked dependencies, plus reviewed RC build guards. **Do not merge this branch into main**, or the 180 content upgrades may be accidentally reverted.
- Verified CI gate: zero differences from Vercel SHA under **src/content**; the only change under src/pages is Cloudflare-compatible Google Reviews API integration.
- Actual main-versus-Vercel difference: 1 commit, 186 changed files, including **180 service-area Markdown pages** and 6 other files. Page breakdown: Nakhon Ratchasima **43**, Udon Thani **40**, other provinces **97**. No URL deletions are intended; earlier staging parity passed 1,189 sitemap URLs.
- GSC final data for 2026-10-12..2026-11-08 includes **49 reported page rows** matching the 180 affected service-area slugs, contributing **30 reported clicks and 412 impressions**. Google may omit anonymized page data; absence of a row is NOT proof of zero traffic.
- **Recommended release option A: HOST ONLY.** Do not simultaneously publish the 180 content changes. Once Cloudflare is stable and GSC comparison is available, release Issue #50 separately. Option B (host + SEO 180 at once) is expressly discouraged without separate, explicit Owner approval.

## 2. Verified Staging and Host-only RC evidence

**Actual custom-domain Staging succeeded**, without changes to real apex/www:
- https://github.com/noteroru2/amphon.co.th/actions/runs/43010084967 — 1,195/1,195 live URLs 200/canonical/staging noindex, 1,189/1,189 sitemap parity, 260/260 legacy redirects, 308 slash routes, 404, SSL valid on **cf-test.amphon.co.th**, Google Places HTTP 200 / no-store with rating 5.0 and 76 public reviews; zero errors.
- Staging uses independent **amphon-co-th-staging** Worker. Must remain global noindex. This only verifies TLS for cf-test, not that Cloudflare is already serving TLS on apex/www.

**New inert Production RC QA**:
- https://github.com/noteroru2/amphon.co.th/actions/runs/43012505899 — source freeze (180 pages excluded), exact npm ci lock/Node 22.23.4, production Astro build and 1,191 SEO/JSON-LD checks, all routing/production safety unit tests, removes 14 duplicate generated redirect paths while retaining 260 Vercel legacy redirects and 2 unique Astro rules + 308 slash (263 final rules), Wrangler DRY RUN, local HTTP smoke **20/20** (11 indexable main pages), and Vercel fallback build. All completed successfully; **nothing was deployed**.
- Production candidate worker name: **amphon-co-th-prod** (not the Preview Worker **amphon-co-th**, not Staging).
- The production bundle refuses global X-Robots-Tag noindex, disables workers.dev and preview_urls, and contains **no custom domains, routes, or apex/www bindings**.
- Production SESSION KV must be newly provisioned. Production preparation refuses reuse of the Staging KV ID **6563771299d44a43844dcb4e8e9093ec**. Preflight uses an unbound, DRY-RUN-only SESSION; a deployable release requires an independently provisioned production KV ID.
- Cloudflare production Build candidate command (for CI, not a deploy):
  
    npm ci && node scripts/cloudflare-lock-verify.mjs && npx astro build --config astro.config.cloudflare.production.mjs && node scripts/cloudflare-production-prepare.mjs --ci-only

  DRY RUN ONLY:

    npx wrangler deploy --config dist/server/wrangler.production.candidate.json --dry-run

  The --release preparation is separately approval-gated and requires **AMPHON_PROD_SESSION_KV_ID**. It never attaches the domain automatically. NO PRODUCTION DEPLOY today.

## 3. DNS, SSL and Vercel fallback baseline — actual read-only evidence

DNS/TLS evidence: https://github.com/noteroru2/amphon.co.th/actions/runs/43012505899 , job **read-only-live-dns-ssl-traffic-check** (2026-11-11 11:30 UTC).

Current authoritative NS: **deb.ns.cloudflare.com** and **jake.ns.cloudflare.com**. Cloudflare zone is active; **do not change nameservers** in this migration.

| Host | Actual public DNS answers before cutover | Actual current TLS | HTTP |
| --- | --- | --- | --- |
| amphon.co.th | **A 64.29.17.65, 216.198.79.65**, public-resolver TTL about 299s | Let's Encrypt valid through 2026-12-30 | Vercel 200, canonical to apex, no noindex |
| www.amphon.co.th | **CNAME b9c77eda4c080f5f.vercel-dns-017.com**, resolved A 216.198.79.1 / 64.29.17.1, TTL about 300s | Let's Encrypt valid through 2026-12-29 | Vercel **301** to apex preserving path and query |
| cf-test.amphon.co.th | Cloudflare IPs 172.67.210.64 / 104.21.75.24 and IPv6, TTL about 300s | Google Trust Services valid through 2027-02-09 | Staging 200 with noindex, Places API 200 |

Vercel Domain Config also reports apex **configuredBy=A** and www **configuredBy=CNAME**, verified domains, and www redirectStatusCode=301. Source Vercel production still READY at the SHA above.

**DNS conflict warning:** An older Cloudflare dashboard snapshot in Issue #54 showed apex as DNS-only CNAME to Vercel. The latest public DNS and Vercel API now show apex A records, but public DNS does not expose the Cloudflare-zone record ID, the proxied/DNS-only switch, or an apex-flattened CNAME's original type. **Before any cutover, the Owner must export or screenshot current Cloudflare DNS records with exact Type, Name, Content, Proxy Status, TTL and record identifiers. Rollback MUST restore that same verified configuration, not a guessed A/CNAME.** Preserve all MX, SPF, DKIM, DMARC, Vercel verification TXT, other domains, and cf-test. Do not use TTL 300 seconds as a guarantee all resolvers switch within 5 minutes.

**Cloudflare apex/www SSL is still a gate.** The cf-test cert has a Cloudflare issuer, but final apex and www TLS/SNI after binding a new Worker have NOT been exercised. Current apex/www certificates are served by Vercel. Confirm exact Cloudflare Edge Certificate and activation and test real HTTPS after authorized switchover.

## 4. Architecture and production safety isolation

| Environment | Source/Worker | Public endpoint/SEO policy |
| --- | --- | --- |
| LIVE Vercel | deployment dpl_DmtdiCXTsy6zBMKNVEehFyMoUBwr | amphon.co.th / www.amphon.co.th, indexable |
| Cloudflare Preview | infra/cloudflare-workers-preview → amphon-co-th | workers.dev, noindex |
| Cloudflare Staging | infra/cloudflare-production-staging → amphon-co-th-staging | cf-test.amphon.co.th, noindex |
| Host-only RC **NOT DEPLOYED** | infra/cloudflare-cutover-rc → planned amphon-co-th-prod | no routes, no custom domain, workers.dev disabled, production HTML indexable when authorized to go live |

No deployment of this host-only RC is authorized. Existing Worker Builds on preview branches may report failures on other Workers; do not confuse that with staging/production rollout checks. Production must be separately bound to secrets **GOOGLE_PLACES_API_KEY**, **GOOGLE_PLACE_ID** and its own SESSION KV. Do not paste values into GitHub/ChatGPT, and test no secret loss after deploy. Keep **Bot Preference Sync/managed robots** from accidentally rewriting site rules and prevent WAF challenges to verified Googlebot.

## 5. www → apex 301: two-stage cutover recommended

1. **First move apex only** after exact approval and full rollback snapshot. Keep **www CNAME and Vercel 301** active. Vercel's existing www redirects users to whatever service serves apex, preserving original path and query. This keeps www TLS working without changing two hostnames at once.
2. Once Cloudflare apex is confirmed healthy, request separate Owner approval to move www from Vercel to a Cloudflare proxied redirect-only hostname with **Single Redirect**. Match exactly host **www.amphon.co.th**; destination **https://amphon.co.th** plus original URI path; **HTTP 301**, **Preserve query string=true**. Cloudflare describes originless proxied A placeholder **192.0.2.0** for a redirect-only www hostname; do not treat this as an IP of AMPHON.
3. Test www root, arbitrary path, Thai URL, query (utm_source), HTTP-to-HTTPS, 301 Location, no redirect chain/loop, and certificate/SNI on www. The current Vercel 301 test **does not** validate a future Cloudflare www redirect rule. Use the Rules Simulator / inactive rule review before activation, where supported.
4. Cloudflare Custom Domains require exact hostname matches; an apex Worker custom domain alone does NOT serve www. References:
   - https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
   - https://developers.cloudflare.com/rules/url-forwarding/single-redirects/settings/

## 6. Execution checklist (future only, requires a new Owner approval)

**T-24h — prepare, no cutover**
- Record exact RC HEAD SHA after final passing CI, selected SEO option, low-traffic window, Owner/contact who can roll back.
- Reconfirm Vercel deployment ID/commit/aliases and source GitHub main SHA (must not unexpectedly change).
- Export Cloudflare DNS zone; specifically apex and www Type/Value/Proxied/TTL, NS, TXT verification, mail records. Save screenshots and rollback values. Verify no conflicting Worker route.
- Confirm separate inactive Production Worker name, SSL coverage, WAF/Bot policy, Google Search Console verification continuity and baseline queries/pages.
- Maintain Staging noindex; **do not merge PR #55 or #56 for this purpose**.

**After explicit Owner authorization for the exact changes**
- Create independent **amphon-co-th-prod** Worker, disabled workers.dev/preview URLs, no domains/routes. Configure fresh Production SESSION KV; add Google Places Secrets via runtime, not build/CI. Validate Worker actual Build SHA and that none of the existing Preview or Staging bindings were copied.
- Rebuild final exact RC with --release preparation and dedicated KV ID. Confirm no global noindex and no routes, all 260 redirects, assets and line CTAs. No domain activation until Owner approves the apex switch.
- Attach **only amphon.co.th** Custom Domain and perform the exact Cloudflare DNS change approved from the current snapshot, retaining all other records. This is the actual cutover and must NOT happen in this preparation task.
- Verify apex TLS, HTTP 200, canonical/indexability, robots/sitemap/llms.txt, legacy redirects 260/260, 404, static assets, Google Reviews API 200/no-store, Notebook/PC/MacBook/B2B/auction/provinces, LINE CTA. Confirm www Vercel 301 still points to the new apex.
- Keep Vercel deployment READY and its domain association for rollback. Consider moving www only after apex stabilization and separate approval.

## 7. Rollback — immediate for technical P0 regressions

**Immediate rollback triggers:** apex TLS invalid, site 5xx/blank, global or HTML noindex, canonical points to staging, robots blocking Googlebot, core buyer pages or LINE CTA fail, sitemap unexpectedly missing, or legacy redirect regressions. A temporary Google Reviews API outage may be mitigated at Runtime Secrets if independent from other P0 issues; do not wait for delayed GSC data before rolling back major failures.

**Rollback if apex was migrated:**
1. Stop further deployments; record affected SHA / HTTP evidence and inform responsible Owner.
2. Remove only the NEW amphon.co.th Cloudflare Custom Domain or authorized cutover Worker route, ensuring no residual route intercepts the hostname. Do not delete cf-test or unrelated Workers.
3. Restore **apex DNS exact original record type/content/proxy/TTL from the pre-cutover Dashboard snapshot** (DNS-only to Vercel). Current public baseline shows Vercel A 64.29.17.65 / 216.198.79.65; if the dashboard record was actually a flattened CNAME, restore the recorded CNAME target b9c77eda4c080f5f.vercel-dns-017.com instead. **No guessing.**
4. If www is still on Vercel as recommended, do NOT change it. If www was migrated separately, disable the new Cloudflare www rule and restore the original DNS-only Vercel CNAME.
5. Verify Vercel domains still attached and certs active; check apex 200 / canonical / indexability, www 301 path+query, 260 redirects, Google Reviews, line CTA and DNS from more than one resolver. Preserve incident evidence and Cloudflare logs.
6. Do not close Vercel, change NS, delete email DNS or broadly purge cache. DNS responses may be mixed for a while; continue checking.

**This rollback procedure has NOT been executed on apex because doing so would violate the no-cutover instruction.** Human Cloudflare/Vercel Owner with working access is required at the actual move.

## 8. GSC final baseline & monitoring

Actual GSC Final data, hostname-filtered to amphon.co.th (Hub, Google Pacific reporting days, not a sum of sampled keyword rows):

| Final period | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| 28 days, 2026-10-12 to 2026-11-08 | **2,074** | **86,061** | **2.4099%** | **6.5964** |
| 7 days, 2026-11-02 to 2026-11-08 | **600** | **23,503** | **2.5529%** | **5.8377** |

- **T+0 to 60 minutes:** HTTP 200/5xx, SEO headers, canonical, SSL, robots, sitemap, all 260 redirects, B2B+auction+province, Google Reviews and LINE CTA; technical P0 triggers rollback.
- **T+24 hours:** Cloudflare and remaining Vercel logs, Bot/WAF challenge/Googlebot access, 404/5xx, real leads/chats; do not judge Google ranking from a single day's lagging impressions.
- **T+7/14/28 days:** Compare Google Search Console final click/impression/CTR/position, index coverage and crawl by hostname/query/page versus equivalent prior periods; track 180 affected slugs and all primary buy-in keywords. Annotate release time in Bangkok and Pacific. Do not ship SEO Issue #50 simultaneously or mistake reporting lag for a traffic decline.
- Google Search Central hosting guidance: https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes — this is a hosting change with the SAME visible URLs; no Change of Address operation.

## 9. Release GO / NO-GO gates (checklist, NOT an approval)

- [x] Real cf-test SSL, SEO 1195/1195, sitemap 1189/1189, API 200, redirects 260/260.
- [x] Host-only source branch based on Vercel deployed SHA, 180 pages frozen.
- [x] Actual public DNS / Vercel 301 / TLS baseline captured on 2026-11-11.
- [x] Production bundle is indexable, adapter duplicate rules removed, Worker name isolated, workers.dev disabled, no domain routes.
- [x] GitHub Actions dry-run Production build and Vercel fallback build passed; **not deployed**.
- [ ] **Cloudflare DNS Dashboard export and exact record type/Proxy/TTL/ID** reconciled with public A/CNAME baseline.
- [ ] **Owner approves full final RC SHA, SEO Host-only option and release window**; no branch name-only approvals.
- [ ] Independent Production Worker, KV namespace, Secrets configured and pre-domain Build/Runtime checks passed.
- [ ] Real Cloudflare TLS readiness of apex plus future www; www redirect rule simulator evidence.
- [ ] **Owner separately authorizes exact apex Custom Domain / DNS mutation** and has confirmed rollback operator. www requires its own approval or an explicit combined scope.

**NO-GO for Production until all unchecked items are verified and explicitly approved.**
