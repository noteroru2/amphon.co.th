# AMPHON amphon.co.th — Cloudflare cutover / rollback runbook (Issue #54)

**Status:** PREPARED, **NOT EXECUTED**. No changes to Production or DNS are authorized by this document. Make all actual changes only after SEO parity evidence and Owner approval.

## Verified reference points (as of 2026-11-11)

- GitHub repository: `noteroru2/amphon.co.th`
- Migration branch: `infra/cloudflare-workers-preview`, Draft PR #55.
- Vercel team: `amphons-projects-bb1ec3bf`, project `amphon-co-th`, project ID `prj_qq9KKWiGxeKiiAx3uFqe3VO808OT`.
- Last verified **production** Vercel deployment ID: `dpl_DmtdiCXTsy6zBMKNVEehFyMoUBwr`, GitHub commit `1d235196f45e29af4c425fa4505111596db8e4c6` (may change; re-read immediately before cutover).
- Vercel has `amphon.co.th` and `www.amphon.co.th` verified; `www` redirects to apex with 301.
- Production live HTTP baseline: GitHub Actions Run 42969091845. All 12 priority pages 200, 257/260 expected exact redirects match, three film-camera typo URLs returned 404 (existing Production drift). Six trailing slash URLs returned **308**.
- No live Cloudflare preview has yet been deployed or HTTP-tested; cloud credentials and Worker account/zone are not yet verified.

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
