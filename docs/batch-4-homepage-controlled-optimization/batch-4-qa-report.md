# Batch 4 QA Report

## Verdict

**PASS WITH WARNING**

Homepage-specific checks pass. Repository-wide suites expose pre-existing issues in out-of-scope iPad, service, and location content; these files were not changed because Batch 4 explicitly forbids touching those clusters.

## Command Evidence

| Command / check | Exit | Result |
| --- | ---: | --- |
| `npm run astro -- sync` | 0 | Content synced and types generated successfully |
| `npm run astro -- check` | 0 | 103 files, 0 errors, 0 warnings, 43 existing hints |
| `npm run build` | 0 | Production build complete; sitemap generated |
| `npm run validate:seo` | 1 | Existing iPad article has two H1 elements; homepage itself has exactly one |
| `npm run qa:internal-404` | 1 | 17 existing missing targets originate from out-of-scope service/location pages |
| Homepage-only built-link check | 0 | 39 unique internal destinations, 0 broken |
| `npm run qa:redirect-chain` | 0 | 10 samples; no loops or chains |
| `npm run qa:sitemap` | 0 | 2 sitemap files; only indexable canonical URLs |
| `npm run qa:duplicate-headings` | 0 | 1,186 built pages; no duplicate Title or H1 values |
| `npm run qa:claim-risk` | 1 | One false-positive phrase in out-of-scope `รับซื้อโทรศัพท์เสีย.md` |
| Orphan graph check | 0 | 4 pre-existing alias/orphan routes: `รับซื้อ-gopro`, `รับซื้อ-hdd`, `รับซื้อ-storage-nas`, `รับซื้อเลนส์` |
| `git diff --check` | 0 | No whitespace errors |

## Homepage Technical Checks

- Homepage URL unchanged: PASS
- Canonical unchanged (`https://amphon.co.th`): PASS
- Rendered Title unchanged: PASS
- H1 unchanged and count = 1: PASS
- Meta description updated: PASS
- JSON-LD parses during build and schema types remain aligned: PASS
- Organization/WebSite/WebPage/OfferCatalog/ItemList retained: PASS
- No AggregateRating or Review schema added: PASS
- No redirect or noindex change: PASS
- No dependency or lockfile change: PASS
- Generated pages: 1,186
- Sitemap files: 2
- Sitemap `<loc>` entries: 1,180
- Homepage broken internal links: 0
- Footer link instances before/after: 28 / 28

## Browser QA

### Mobile — 390 × 844

- H1 count: 1
- Service cards: 6
- Province cards: 6
- Process steps: 4
- Horizontal overflow: none
- Cards outside viewport: 0
- Key `.btn`, `.service-card`, and `.province-card` targets below 44 px: 0
- Hero, supporting copy, service block, province block, process, CTA, and footer rendered

### Desktop — 1440 × 900

- H1 count: 1
- Service cards: 6 in a balanced two-column grid
- Province cards: 6 in a balanced two-column grid
- Process steps: 4
- Horizontal overflow: none
- Cards outside viewport: 0
- Key targets below 44 px: 0
- Header, CTA, whitespace, internal links, and footer rendered
- Browser console warnings/errors: 0

## Screenshots

- `screenshots/homepage-mobile-390x844.png`
- `screenshots/homepage-mobile-services.png`
- `screenshots/homepage-mobile-provinces.png`
- `screenshots/homepage-desktop-1440x900.png`
- `screenshots/homepage-desktop-services.png`
- `screenshots/homepage-desktop-provinces.png`

## Scope Isolation

QA was run in a separate diagnostic worktree containing the Batch 4 homepage source. Concurrent user edits to service/blog files and Batch 5 artifacts in the main working tree were not copied into the Batch 4 test state, changed, staged, or committed.
