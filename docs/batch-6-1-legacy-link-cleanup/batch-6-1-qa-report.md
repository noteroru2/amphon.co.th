# Batch 6.1 QA Report

## Result

Verdict: **PASS**

All 11 legacy broken internal links were corrected to generated, indexable final routes. The reversed computer Ubon redirect was removed because its source was the real sitemap URL and its destination did not exist.

## Commands and exit codes

| Command | Exit | Result |
| --- | ---: | --- |
| `npm run astro -- sync` | 0 | Content sync and type generation passed |
| `npm run astro -- check` | 0 | 104 files; 0 errors, 0 warnings, 43 pre-existing hints |
| `npm run build` | 0 | Vercel adapter production build completed |
| `npm run validate:seo` | 0 | All 1,189 validated pages passed SEO and JSON-LD checks |
| `npm run qa:sitemap` | 0 | Two sitemap files contain indexable canonical URLs only |
| `npm run qa:duplicate-headings` | 0 | 1,190 built pages; no duplicate titles or H1s |
| `npm run qa:internal-404` | 0 | No missing targets and no internal links hitting redirect sources |
| `npm run qa:redirect-chain` | 0 | Nine remaining redirect samples; no loops or chains |

An additional legacy `check-vercel-redirect-match` utility still flags pre-existing percent-encoded Thai fallback rules in `vercel.json`. Those rules are unrelated to the 11 links and were not altered in this batch.

## Technical results

- Built route count before: 1,190 including 404.
- Built route count after: 1,190 including 404.
- Route reduction: 0.
- Broken internal links before: 11.
- Broken internal links after: 0.
- Internal-404 final exit: 0.
- Canonical failures: 0.
- JSON-LD failures: 0.
- Duplicate titles/H1: 0.
- Sitemap failures: 0.
- Redirects created: 0.
- Reversed redirects removed: 1.
- Pages created/deleted: 0/0.
- Dependency/lockfile changes: 0/0.

## Orphan-page verification

The four reported orphan URLs are intentional legacy redirect sources:

- `/บริการ/รับซื้อ-gopro` → `/บริการ/รับซื้อ-gopro-action-camera`
- `/บริการ/รับซื้อ-hdd` → `/บริการ/รับซื้อ-ssd`
- `/บริการ/รับซื้อ-storage-nas` → `/บริการ/รับซื้อ-nas`
- `/บริการ/รับซื้อเลนส์` → `/บริการ/รับซื้อเลนส์กล้อง`

All four are absent from the sitemap and have canonical replacement URLs. Three are explicitly `noindex,follow`; GoPro is permanently redirected and canonicalized. GSC has no exact Page signal for any legacy URL, so adding internal links back to redirect sources would be incorrect.

## Isolation

- Homepage: untouched.
- Footer: untouched.
- iPad/iPhone content and metadata: untouched.
- Dependencies and lockfiles: untouched.
- No new page, redirect, noindex or canonical was created.
- The Ubon area page changed only at its two broken computer-link occurrences.
- Pre-existing untracked user files were not modified or staged.
- No Temp/AppData utility file is tracked in Git.
- Merge: No.
- Deploy: No.
