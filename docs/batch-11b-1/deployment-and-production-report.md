# Batch 11B.1 — Deployment and Production Report

Date: 2026-07-18 (Asia/Bangkok)

## Final verdict

**WARNING — Deployment and all production checks passed. The only caveat is that the direct-upload Vercel deployment metadata does not expose a `gitSource` SHA; the deployed tracked input was independently controlled at local HEAD/origin/main `5e6cdc54b2e2bc7fab3c6aee5ef28e1e64a77804`. This does not affect indexing or page behavior.**

Batch 11B is complete. Begin monitoring; do not draw an SEO outcome conclusion before sufficient post-deployment data exists.

## Release identity

- Branch: `main`
- Source commit: `d3f06145bf5d0cf45bcbe098243ea72684413032` — `feat(seo): optimize near-win service area and ipad pages`
- Documentation commit: `5e6cdc54b2e2bc7fab3c6aee5ef28e1e64a77804` — `docs(seo): add batch 11b opportunity recovery reports`
- Local HEAD before deployment: `5e6cdc54b2e2bc7fab3c6aee5ef28e1e64a77804`
- `origin/main` before deployment: `5e6cdc54b2e2bc7fab3c6aee5ef28e1e64a77804`
- Deployment ID: `dpl_4XVur7yD3KsmzMpZYuTbb6e1Lc9H`
- Deployment URL: `https://amphon-co-htepmh74k-amphons-projects-bb1ec3bf.vercel.app`
- Production URL: `https://amphon.co.th`
- Target/state: production / READY
- Created: 2026-07-18 12:46:51 +07:00
- Deployment Git SHA: not exposed in Vercel CLI/API metadata for this direct-upload deployment. The upload was run only after local HEAD equalled `origin/main` at the documentation commit; no tracked source changed during deployment.

## Source files changed

- `src/pages/index.astro`
- `src/content/services/รับซื้อแรม.md`
- `src/content/services/รับซื้อคอมพิวเตอร์.md`
- `src/content/areas/อุดรธานี.md`
- `src/content/areas/ขอนแก่น.md`
- `src/content/areas/นครราชสีมา.md`
- `src/content/areas/กาฬสินธุ์.md`
- `src/content/blog/วิธีเช็กรุ่น-ipad-ว่าเป็น-gen-ไหน.md`
- `src/content/services/รับซื้อ-ipad.md` — approved contextual inbound link only
- `src/content/blog/ขาย-ipad-มือสอง-ต้องเช็กอะไรบ้าง.md` — approved contextual inbound link only

No URL, slug, redirect, `vercel.json`, `astro.config.mjs`, deployment/QA script, canonical system, sitemap generator, or global design-system change was included.

## iPad inbound-link findings

The target article was present in generated blog collections/index but had no literal contextual source link before the release gate. Two crawlable contextual links now point to it:

| Source URL | Anchor text | HTML crawlability |
| --- | --- | --- |
| `/บริการ/รับซื้อ-ipad` | `วิธีเช็กรุ่น iPad จากเลขโมเดล Axxxx` | Crawlable `<a href>` |
| `/blog/ขาย-ipad-มือสอง-ต้องเช็กอะไรบ้าง` | `ตรวจว่า iPad เป็น Gen ไหน` | Crawlable `<a href>` |

## QA results

- `npm run build`: PASS — 1,174 pages.
- `npm run qa:coverage`: PASS.
- `npm run qa:internal-404`: PASS.
- `npm run qa:redirect-chain`: PASS.
- `npm run qa:sitemap`: PASS.
- `npm run qa:duplicate-headings`: PASS — unique titles/H1s across 1,174 pages.
- `npm run qa:claim-risk`: PASS.
- `git diff --check`: PASS.
- Local mobile browser validation at 390 × 844: PASS for all eight pages.

## Production smoke results

Tests used cache-busting query `?release=5e6cdc5`. All canonical values correctly omit the query string.

| URL | HTTP/no redirect | Title/description/H1 | Canonical/robots | LINE/tel | JSON-LD | Mobile overflow/placeholder | Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 200 / none | Match | Self / index,follow | Present | Valid | None | PASS |
| `/บริการ/รับซื้อแรม` | 200 / none | Match | Self / index,follow | Present | Valid | None | PASS |
| `/บริการ/รับซื้อคอมพิวเตอร์` | 200 / none | Match | Self / index,follow | Present | Valid | None | PASS |
| `/พื้นที่ให้บริการ/อุดรธานี` | 200 / none | Match | Self / index,follow | Present | Valid | None | PASS |
| `/พื้นที่ให้บริการ/ขอนแก่น` | 200 / none | Match | Self / index,follow | Present | Valid | None | PASS |
| `/พื้นที่ให้บริการ/นครราชสีมา` | 200 / none | Match | Self / index,follow | Present | Valid | None | PASS |
| `/พื้นที่ให้บริการ/กาฬสินธุ์` | 200 / none | Match | Self / index,follow | Present | Valid | None | PASS |
| `/blog/วิธีเช็กรุ่น-ipad-ว่าเป็น-gen-ไหน` | 200 / none | Match | Self / index,follow | Present | Valid | None | PASS |

The iPad Axxxx table remains contained on mobile, the article includes crawlable links to `/บริการ/รับซื้อ-ipad`, and it has no FAQPage schema because no visible FAQ section exists. The production pages show the new titles/content, providing direct evidence that stale pre-Batch content is not being served.

## Measurement baseline

The baseline is in `docs/batch-11b-1/measurement-baseline.csv`. Values are page-level estimates from the Batch 11B brief, not raw GSC rows.

- First review: 2026-08-01 (14 days)
- Second review: 2026-08-15 (28 days)
- Compare clicks, impressions, CTR, average position, queries, ranking page, LINE clicks, and phone clicks.
- Do not conclude SEO success or failure before enough post-deployment data is available.

## Working tree and report status

After the two prescribed commits and push, the tracked tree was clean and the following pre-existing untracked items remained untouched:

- `scratch/`
- `sitewide-deep-audit.md`
- `verify_production_results.json`

This production report was created after the production checks and recorded in a separate follow-up documentation commit, without amending either previously pushed commit.

## Remaining risks

- Raw GSC query rows were unavailable; query-level cannibalization and uplift require later measurement.
- The iPad model table needs periodic maintenance as Apple releases new model numbers.
- Deployment Git SHA is not surfaced by the direct-upload deployment metadata; content/runtime verification passed and the controlled upload input matched `origin/main`.
