# AMPHON Cloudflare cutover — independent DNS / Vercel rollback evidence
Observed 2026-11-11 (Thailand); READ-ONLY. This is **not** permission to change production.

## Public DNS snapshot (Google public resolver)
| Query | Observed answer | Caveat |
| --- | --- | --- |
| amphon.co.th A | 64.29.17.65, 216.198.79.65 | Public resolver does not disclose Cloudflare origin record type / proxy setting |
| amphon.co.th CNAME | no public answer | Not proof that no flattened apex CNAME exists |
| www.amphon.co.th CNAME | b9c77eda4c080f5f.vercel-dns-017.com. (TTL 600s) | Keep a verified Zone record screenshot/export for rollback |
| cf-test.amphon.co.th A | 104.21.75.24, 172.67.210.64 | Existing isolated staging hostname; never attach it to Production |
| amphon.co.th MX | 34 route1.mx.cloudflare.net, 93 route2.mx.cloudflare.net, 94 route3.mx.cloudflare.net | Do not alter mail routing |
| amphon.co.th NS | deb.ns.cloudflare.com, jake.ns.cloudflare.com | Do not change nameservers |
| amphon.co.th TXT | SPF + Google verification publicly visible | Save complete private DNS zone export; DO NOT alter TXT or other mail records |

Authenticated **Vercel** verified:
- Project `prj_qq9KKWiGxeKiiAx3uFqe3VO808OT`, project `amphon-co-th`.
- Stable Production rollback deployment `dpl_DmtdiCXTsy6zBMKNVEehFyMoUBwr` READY on source commit `1d235196f45e29af4c425fa4505111596db8e4c6`.
- Both `amphon.co.th` and `www.amphon.co.th` are verified project domains; Vercel currently redirects www to apex with 301.
- Keep Vercel domain bindings and Production deployment **untouched**, even after initial Cloudflare cutover.

## Cloudflare account preflight — authentication required
Account `2382f4589cd2452e9e3b7b83c25d4fc0`, zone `amphon.co.th`:
1. Read DNS Records in Cloudflare Dashboard/API. Record exact **type/value/proxied/TTL** for apex and www. Public DNS response is insufficient for rollback. Export entire zone **privately**. Check CAA, DNSSEC, SSL/TLS settings, existing Workers routes and custom domains, Single/Bulk Redirects, WAF/Bot rules, zone settings and other subdomains.
2. Confirm no conflicting rule that redirects or blocks critical crawlers. Verify `cf-test` stays independently noindexed.
3. Confirm Cloudflare Universal/Advanced SSL covers **both** hostnames when the switch happens (Staging TLS is not evidence).
4. Prepare separately named new Production Worker `amphon-co-th-production`, production-only indexable build from **frozen reviewed SHA**, with `workers_dev:false`, `preview_urls:false`, **no routes/domains during preflight**.
5. Provision a **new** Production SESSION KV (do not reuse staging namespace `6563771299d44a43844dcb4e8e9093ec`); configure per-worker `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID` as Cloudflare runtime Secrets through secure UI. Do not print secrets in logs, chat, git or artifacts.

## Only after explicit Owner approval: cutover plan
### www first
- Create Cloudflare Single Redirect **matching exactly** `(http.host eq "www.amphon.co.th")`.
- Type Dynamic, target expression `concat("https://amphon.co.th", http.request.uri.path)`, HTTP **301**, `Preserve query string = ON`.
- Cloudflare Workers Custom Domains docs recommend a proxied DNS `A www -> 192.0.2.0` originless placeholder. This is a **future** cutover change, not a current DNS fact. Backup and replace only the existing www record when authorized.
- Before touching apex, confirm www 301 to existing live Vercel apex; Thai/encoded path and query preserved, no redirect chains.

### apex after www verified
- Attach **only** `amphon.co.th` as Custom Domain to approved Production Worker; Cloudflare may create/replace a conflicting apex DNS record and issue a certificate. Never blindly delete existing record.
- Confirm Production HTML is **indexable**; no Staging global `X-Robots-Tag: noindex`.
- Test 1,189 sitemap URLs, redirects 260, 404 and trailing slash 308, API Google Reviews 200/no-store, assets, mobile LINE CTA, GA4, canonical, robots, HTTPS for apex AND www.
- Stop on any P0 failure; retain Vercel fallback unmodified.

## Immediate rollback (no live rehearsal performed)
1. Record exact pre-change Cloudflare apex/www DNS details (from private export; not these public guesses) and newly created rules/Worker custom-domain IDs.
2. Remove only the new Production apex Worker Custom Domain/route and any conflicting Cloudflare-generated apex DNS; restore exact saved pre-cutover apex record/proxy/TTL pointing to Vercel.
3. Leave www → apex 301 temporarily if the apex is healthy on Vercel. Then remove only newly created Cloudflare www redirect; restore www **exact saved** Vercel DNS-only CNAME/proxy/TTL.
4. Probe HTTPS + 301 + canonical/noindex + 260 redirects + 404 + Google Reviews + LINE; verify from external networks and retain error/downtime timeline.
5. Do not delete Vercel, change other DNS, touch Mail/Shop/Hub/AI Buyer or rely on a global cache purge as rollback.
6. Rollback is not instant; DNS caching/SSL readiness may delay recovery. Named operator and tested account permissions are required before GO.

## No-GO gates remaining
- Security patch release completed and exact SHA green on CI (SEO parity, all 260 legacy redirects, 1,189 sitemap routes, Google Reviews, no global noindex, no High/Critical production dependency audit).
- Authenticated Cloudflare DNS export and exact rollback record details.
- Validated Cloudflare www 301 rule and Production SSL design, with safe production worker isolated from staging.
- Production secrets/KV and cutover access prepared, no public route before approval.
- Owner explicit cutover authorization identifying SHA + exact DNS/custom-domain operations.

Sources: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/ and https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-www-to-root/
