# Batch 2.1.1 QA Report

Verdict: **PASS WITH WARNING**

## Results

| Check | Command | Exit code | Errors | Warnings | Verdict |
| --- | --- | ---: | ---: | ---: | --- |
| Astro sync | `npx astro sync` | 0 | 0 | 0 | PASS |
| Astro check | `npx astro check` | 0 | 0 | 46 hints | PASS |
| Production build | `npm run build` in ASCII worktree | 0 | 0 | 0 | PASS |
| Sitemap files | enumerate `dist/client` | 0 | 0 | 0 | PASS |
| Sitemap parse | PowerShell XML parser | 0 | 0 | 0 | PASS |
| MacBook routes | `node scripts/validate-batch-2-1-1.mjs` | 0 | 0 | 0 | PASS |
| Redirect samples | `npm run qa:redirect-chain` | 0 | 0 | 0 | PASS |
| Duplicate headings | `npm run qa:duplicate-headings` | 0 | 0 | 0 | PASS |
| Full-site broken links | `npm run qa:internal-404` | 1 | 17 existing | 0 | WARNING |
| Full-site metadata/schema | `npm run validate:seo` | 1 | 1 existing iPad H1 | 0 | WARNING |
| Claim risk | `npm run qa:claim-risk` | 1 | 1 existing | 0 | WARNING |

## Build output

- Build root: `dist`
- Public output: `dist/client`
- Vercel static output: `.vercel/output/static`
- Public files: 1,385
- HTML files: 1,186
- Asset/non-HTML/non-XML files: 197
- Sitemap files: 2
- Sitemap URLs: 1,179
- XML parse: 2/2 pass

## Batch 2.1 regression

- Routes checked: 14
- Routes missing: 0
- Sitemap misses: 0
- Noindex: 0
- Broken internal links: 0
- Canonical errors: 0
- H1 errors: 0
- JSON-LD errors: 0
- MacBook Hub and seller guide remain rendered with the Batch 2.1 metadata/content/link mapping

## Existing full-site issues outside scope

The general internal-link script reports 17 missing target links from non-MacBook pages. The general SEO validator reports two H1 elements on the forbidden iPad article. Claim-risk reports one existing line in `รับซื้อโทรศัพท์เสีย.md`. None were introduced by Batch 2.1 or Batch 2.1.1, and the recovery prompt prohibits changing those content areas.

## Scope confirmation

- Source files outside recovery scope changed: 0
- Dependency changes: 0
- Lockfile changes: 0
- iPad files touched: No
- iPhone files touched: No
- Service-area content files touched: 0
- Redirects/noindex/slugs created: 0
- Merge: No
- Deploy: No

Readiness: **READY — Batch 2.2 may proceed**, with the listed pre-existing full-site issues carried as warnings rather than silently hidden.
