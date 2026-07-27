# Batch 6.5 Blog Production Release

- Verdict: PASS WITH WARNING
- Source branch: `batch-6-4-blog-listing-readability-hotfix`
- Source SHA: `97a1fde7f1935969c4b8a58999e0e60ceb677c32`
- Main SHA before merge: `5186e856e70f96b11fa613c7a4a7c074ddcc616d`
- Merge SHA: `f6ac636dbe1f22f976571a301845bcfd20ad3bef`
- Production SHA: `f6ac636dbe1f22f976571a301845bcfd20ad3bef`
- Report-only SHA: the commit containing this report
- Deployment ID: `dpl_2H7So9iCbWJVbQZjzkTnmd9hQdxe`
- Production URL: `https://amphon.co.th`
- Blog status: 200
- New posts displayed: 4 / 4
- New posts in first four: 4 / 4
- Published date: 2026-07-27
- Modified date: 2026-07-27
- Hero contrast: PASS — minimum 11.40:1
- Hero height desktop: 345.48–348.06px
- Hero height mobile: 347.84–373.31px
- Risky claim removed: Yes
- Blog cards tested: 50
- Article routes tested: 4
- Article routes passed: 4
- Sitemap: PASS — 1,183 unique URLs, 0 crawl failures
- Production broken links: 0
- GoPro redirect: PASS — 308, one redirect, final 200
- HDD redirect: PASS — 308, one redirect, final 200
- Console errors: 0
- Broken images: 0
- Mobile overflow: 0
- Build: PASS
- Astro check: PASS — 0 errors, 0 warnings
- SEO validation: PASS — 1,187 pages
- Dependency changes: 0
- Lockfile changes: 0
- Temp files committed: 0
- Merge: Yes
- Deploy: Yes

## Blog Production Result

| Position | Article | Production date |
| ---: | --- | --- |
| 1 | ขายโทรศัพท์มือสองใกล้ฉัน เลือกร้านและเตรียมเครื่องอย่างไร | 27 กรกฎาคม 2026 |
| 2 | ขายกล้อง Sony มือสองต้องเช็กอะไรบ้าง ก่อนส่งประเมิน | 27 กรกฎาคม 2026 |
| 3 | Mac mini M4 มือสอง ราคาและจุดที่ต้องเช็กก่อนซื้อหรือขาย | 27 กรกฎาคม 2026 |
| 4 | แรมมือสองขายได้เท่าไหร่ ราคา RAM ขึ้นกับอะไรบ้าง | 27 กรกฎาคม 2026 |
| 5 | จำนำโทรศัพท์กับขายขาดต่างกันอย่างไร แบบไหนเหมาะกว่า? | 21 กรกฎาคม 2026 |
| 6 | การ์ดจอมีผลต่อราคาคอมมือสองแค่ไหน ทำไมคอมเกมมิ่งบางเครื่องถึงได้ราคาดีกว่า | 16 มิถุนายน 2026 |
| 7 | วิธีดูรุ่น iPad ว่าเป็น Gen ไหน เช็กเลขโมเดล Axxxx พร้อมตาราง | 16 มิถุนายน 2026 |
| 8 | วิธีเช็กสเปกคอมก่อนขาย ดู CPU RAM SSD การ์ดจอ ก่อนส่งประเมิน | 16 มิถุนายน 2026 |
| 9 | วิธีเช็ก Battery Health iPhone ก่อนขาย ดูแบตเสื่อมก่อนส่งประเมิน | 16 มิถุนายน 2026 |
| 10 | วิธีล้างเครื่อง MacBook ก่อนขาย ปิด Find My ออกจาก Apple ID ก่อนส่งประเมิน | 16 มิถุนายน 2026 |

Production `/blog` returned 200 with a self-canonical, indexable robots directive, CollectionPage, BreadcrumbList and ItemList schema. All 50 card URLs are unique. Each of the first four cards has two visible tags and a working accessible read-more link.

## Hero Result

| Viewport | Color | Contrast | Padding | Height | Result |
| --- | --- | ---: | ---: | ---: | --- |
| 1920×1080 | `#dbe4f0` | 11.40:1 minimum | 64px | 348.06px | PASS |
| 1440×900 | `#dbe4f0` | 11.40:1 minimum | 64px | 345.48px | PASS |
| 390×844 | `#dbe4f0` | 11.40:1 minimum | 40px | 347.84px | PASS |
| 360×800 | `#dbe4f0` | 11.40:1 minimum | 40px | 373.31px | PASS |

All Hero text is visible, no abnormal empty area was observed, and the claim `ราคาที่สูงที่สุด` is absent.

## Article Results

| URL | Status | Canonical | Schema dates | Sitemap | Result |
| --- | ---: | --- | --- | --- | --- |
| `/blog/ขายโทรศัพท์มือสองใกล้ฉัน` | 200 | Self | 2026-07-27 / 2026-07-27 | Yes | PASS |
| `/blog/ขายกล้อง-sony-มือสอง-ต้องเช็กอะไรบ้าง` | 200 | Self | 2026-07-27 / 2026-07-27 | Yes | PASS |
| `/blog/mac-mini-m4-มือสอง` | 200 | Self | 2026-07-27 / 2026-07-27 | Yes | PASS |
| `/blog/แรมมือสองขายได้เท่าไหร่` | 200 | Self | 2026-07-27 / 2026-07-27 | Yes | PASS |

All pages are indexable BlogPosting pages with BreadcrumbList schema. Hero/OG images return 200, LINE links are present, internal links are healthy, and desktop/mobile Browser QA found no console error, broken image, page overflow or rendered Markdown leakage.

## Redirect Regression

| Route | Source status | Location | Redirect count | Final status |
| --- | ---: | --- | ---: | ---: |
| GoPro | 308 | `/บริการ/รับซื้อ-gopro-action-camera` | 1 | 200 |
| HDD | 308 | `/บริการ/รับซื้อ-ssd` | 1 | 200 |

`node scripts/check-legacy-redirect-runtime.mjs https://amphon.co.th` returned exit code 0.

## QA Evidence

| Command | Exit code |
| --- | ---: |
| `npm run astro -- sync` | 0 |
| `npm run astro -- check` | 0 |
| `npm run build` | 0 |
| `npm run validate:seo` | 0 |
| `npm run qa:sitemap` | 0 |
| `npm run qa:duplicate-headings` | 0 |
| `npm run qa:internal-404` | 0 |
| `npm run qa:redirect-chain` | 0 |
| `node scripts/check-blog-listing.mjs` | 0 |
| Production sitemap crawl, 1,183 URLs | 0 |
| Batch 6.3 production redirect runtime | 0 |

Browser QA covered 12 viewports: `/blog` at 1920×1080, 1440×900, 390×844 and 360×800, plus all four new articles at 1440×900 and 390×844.

## Deployment Evidence

- Deployment ID: `dpl_2H7So9iCbWJVbQZjzkTnmd9hQdxe`
- Deployment URL: `https://amphon-co-np3mijp5y-amphons-projects-bb1ec3bf.vercel.app`
- Production alias: `https://amphon.co.th`
- Vercel target/status: Production / Ready
- Vercel source: branch `main`, commit `f6ac636`
- Production SHA: `f6ac636dbe1f22f976571a301845bcfd20ad3bef`

## Remaining Warning

P2 — add reliable sitemap `<lastmod>` from content updated dates. The production sitemap does not currently include `<lastmod>`. This is existing site-wide technical debt and was deliberately not changed in Batch 6.5.

Google must still crawl the updated pages before search results reflect the release.

## Report Paths

1. `docs/batch-6-5-blog-production-release/batch-6-5-pre-merge-diff.csv`
2. `docs/batch-6-5-blog-production-release/batch-6-5-merge-report.md`
3. `docs/batch-6-5-blog-production-release/batch-6-5-local-qa-report.md`
4. `docs/batch-6-5-blog-production-release/batch-6-5-deployment-report.md`
5. `docs/batch-6-5-blog-production-release/batch-6-5-production-blog-audit.csv`
6. `docs/batch-6-5-blog-production-release/batch-6-5-production-articles.csv`
7. `docs/batch-6-5-blog-production-release/batch-6-5-production-sitemap-audit.csv`
8. `docs/batch-6-5-blog-production-release/batch-6-5-production-regression-audit.csv`
9. `docs/batch-6-5-blog-production-release/batch-6-5-files-changed.csv`
10. `docs/batch-6-5-blog-production-release/batch-6-5-final-report.md`
11. `docs/batch-6-5-blog-production-release/screenshots/` — 12 production screenshots
