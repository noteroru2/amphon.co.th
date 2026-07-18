# Batch 11A.4 Final Remediation Report

**Date:** 2026-07-18  
**Branch:** `main`  
**Verdict:** **WARNING — Redirects pass; trailing-slash variants retain a non-indexing-impacting two-hop observation.**

## Identity and deployment

- Fix commit: `1b1a1b4` — `fix(vercel): activate nas and gopro production redirects`
- Deployment ID: `dpl_Ekk6EXehJE6wEHPML4XkzMYSCygY`
- Unique URL: `https://amphon-co-r9khh09ca-amphons-projects-bb1ec3bf.vercel.app`
- Project: `amphon-co-th`
- State: Ready
- Created: 2026-07-18 10:43:47 +07:00
- Git source: `noteroru2/amphon.co.th`, `main`, commit `1b1a1b4`
- Production aliases: `amphon.co.th`, `www.amphon.co.th`
- Domain inspection after deployment resolves `amphon.co.th` to this exact deployment.

The unique deployment host uses Vercel Deployment Protection. Anonymous requests redirect to SSO. Authenticated `vercel curl` generated a protection bypass, while `vercel inspect` provided the authoritative effective route table. Custom-domain runtime results below are from direct HTTP requests to the same verified deployment.

## Root cause and fix

1. NAS encoded source used `%E0%B8%9B` (`ป`) instead of `%E0%B8%9A` (`บ`), producing `/ปริการ/...` rather than `/บริการ/...`.
2. GoPro had a literal Unicode rule but no encoded service-path rule. The unmatched encoded request reached the existing static GoPro artifact and returned 200.

Only `vercel.json` changed: the NAS byte was corrected and an exact encoded GoPro rule was added. No Astro page, destination, content, sitemap generator, QA script, canonical, or robots setting changed.

## Effective route verification

The new production deployment's route table explicitly contains 308 routes for encoded NAS and GoPro sources to their required destinations. Both are ordered before filesystem handling. The production build completed with 1,174 pages and the deployment reached Ready state.

## Local QA

- JSON parse/exact decoded rule check: PASS.
- `npm run build`: PASS — 1,174 pages.
- `npm run qa:coverage`: PASS.
- `npm run qa:internal-404`: PASS.
- `npm run qa:redirect-chain`: PASS.
- `npm run qa:sitemap`: PASS.
- `npm run qa:duplicate-headings`: PASS.
- `npm run qa:claim-risk`: PASS.

## Production smoke test

| Source | GET/HEAD first status | Location | Hops | Final status | Result |
|---|---:|---|---:|---:|---|
| `/บริการ/รับซื้อเลนส์` | 308 | `/บริการ/รับซื้อเลนส์กล้อง` | 1 | 200 | PASS |
| `/บริการ/รับซื้อ-storage-nas` | 308 | `/บริการ/รับซื้อ-nas` | 1 | 200 | PASS |
| `/บริการ/รับซื้อ-gopro` | 308 | `/บริการ/รับซื้อ-gopro-action-camera` | 1 | 200 | PASS |

Responses used `Cache-Control: public, max-age=0, must-revalidate`, `Content-Type: text/plain` on the redirect, and `text/html; charset=utf-8` on final pages. Vercel supplied `Refresh: 0;url=...` as an HTTP response header for each 308; the HTML destinations contain no meta refresh or JavaScript redirect.

Query-string tests for NAS and GoPro preserved `?utm_test=11a4`, used one redirect, and finished at 200. HEAD matched GET redirect status and Location. Curl's Unicode input is transmitted as the corresponding encoded URL, and the effective manifest contains both literal and encoded patterns.

Trailing-slash NAS and GoPro variants finish at the correct 200 destinations but use two redirects: the existing global slash-normalization rule followed by the legacy redirect. These slash variants are not canonical or internally linked; this observation does not affect indexing of the required source paths, so no broader catch-all change was made in this batch.

## Destination and sitemap validation

All three destinations return 200, declare `index, follow`, and use exact self-canonicals. No destination contains meta refresh or detected JavaScript location redirect.

Production sitemap exact-path parsing confirms:

- All three redirect sources are absent.
- All three destinations are present.
- Local QA confirms no internal link targets a redirect source.

## History and remaining state

- Prior commits `6424190` and `1dce696` were not amended or rewritten.
- Fix commit was pushed normally to `main`.
- No fallback page was created or restored during Batch 11A.4.
- Pre-existing user untracked files were not staged or deleted.

The remaining low-risk observation is the two-hop behavior for noncanonical trailing-slash variants. If desired, a future narrowly scoped route-normalization batch can add direct slash-form redirects, but this is not required to remediate the three canonical sources.

