# Targeted Winner-Safe Optimization — Production Release

Date: 2026-09-05

Final verdict: **PASS_WITH_WARNING**

The release is production-ready. The only warning is the unchanged repository baseline of three claim-risk matches outside this batch. These matches existed on the base SHA and were not modified.

## Release identity

| Field | Value |
|---|---|
| Source branch | `seo/targeted-winner-safe-4-pages` |
| Base SHA | `f7d373a887f88244cab2558c872e6fa92cfa12ff` |
| Content commit | `440aa0db46de6119215a17c0817fb86c5a637c06` |
| Feature report commit | `71859db71e3c51b73c5f464297b4d96c51061836` |
| Feature tip | `71859db71e3c51b73c5f464297b4d96c51061836` |
| Main before merge | `f7d373a887f88244cab2558c872e6fa92cfa12ff` |
| Merge SHA | `7975da9db36392502ef50529b47136fe95e821a6` |
| Content / deploy SHA | `7975da9db36392502ef50529b47136fe95e821a6` |
| Final main SHA | The docs-only commit containing this report; recorded in the final release response and Git history |
| Vercel deployment ID | `135npu5v1KQKGEA42tRQNHopdyj9` |
| Deployment status | Ready / GitHub status success: “Deployment has completed” |
| Production alias | `https://amphon.co.th/` |

## Exact released files

Production content:

- `src/content/services/รับซื้อ-apple.md`
- `src/content/blog/วิธีเช็กรุ่น-ipad-ว่าเป็น-gen-ไหน.md`
- `src/content/services/รับซื้อ-ipad-pro.md`
- `src/content/services/รับซื้อ-macbook.md`

Documentation:

- `docs/targeted-winner-safe-4-pages-2026-09-05.md`
- `docs/targeted-winner-safe-4-pages-production-release-2026-09-05.md` (post-release report only)

No redirect, noindex, canonical, schema, layout, analytics, navigation, or sitemap-logic file changed.

## Production target-page QA

| Page | HTTP | Title/description | H1 | Canonical | Robots | LINE/phone CTA | Content/routing |
|---|---:|---|---:|---|---|---|---|
| Apple Hub | 200 | Expected | 1 | Self, unchanged | `index, follow` | Present | Mixed-product/multi-device role; iPhone, iPad, MacBook, iMac, and Mac mini routes present; no visible SEO notes |
| iPad model-check blog | 200 | Expected optimized metadata | 1 | Self, unchanged | `index, follow` | Present | Source body hash and rendered article hash unchanged |
| iPad Pro | 200 | Expected | 1 | Self, unchanged | `index, follow` | Present | Explicitly Pro-only; standard/Air/mini routed to `/บริการ/รับซื้อ-ipad`; no prohibited superlatives |
| MacBook | 200 | Expected | 1 | Self, unchanged | `index, follow` | Present | Dedicated MacBook role; desktop-Mac coverage limited to one iMac/Mac mini handoff; no Mac Studio content |

iPad source article-body SHA-256:

`abefbb82c326aee6ceed4cd66313e7091416a74b1f602c677033b1152c070570`

iPad rendered `<article class="prose">` SHA-256:

`12c6788e74f14a19f0ccfb7ba42e83f69ddbb0e8a30a4f09056dbcf1ae6b7af5`

## Winner protection

The merge changed no protected winner page. Live regression checks returned HTTP 200, one H1, self-referencing canonical, and `index, follow` for:

- Homepage
- `/บริการ/รับซื้อแรม`
- `/บริการ/รับซื้อแท็บเล็ต`
- `/บริการ/รับซื้อคอมพิวเตอร์`
- `/บริการ/รับซื้อกล้องฟิล์ม`
- `/บริการ/รับซื้อกล้อง-fujifilm`
- `/พื้นที่ให้บริการ/ขอนแก่น`

The release diff also confirms zero changes to other protected winners, unrelated R8 pilots, Header, Footer, StickyCTA, ServiceLayout, AreaLayout, internal-link-map, robots, sitemap logic, schema, and redirect configuration.

## Trust, canonical, and indexability

- Only physical storefront: 740/8 ถนนชยางกูร ตำบลในเมือง อำเภอเมืองอุบลราชธานี จังหวัดอุบลราชธานี.
- No fake branch, local office, false address, guaranteed highest/best price, unconditional nationwide pickup, unconditional instant payment, or pawn/deposit targeting was introduced.
- All four live canonicals remain self-referencing and unchanged.
- All four live pages return `index, follow` and HTTP 200.
- The three repository-wide claim-risk matches are pre-existing, identical on the base, outside the release files, and intentionally not modified.

## QA results

The full matrix passed both before and after merge.

| Check | Result |
|---|---|
| Google Reviews | PASS — 21/21 |
| Astro check | PASS — 0 errors, 0 warnings, 66 existing hints |
| Production build | PASS |
| Internal links | PASS — no missing targets and no redirect-source links |
| Duplicate titles/H1 | PASS — 1,169 built pages |
| Sitemap | PASS — 1,166 canonical URLs, 1,158 trustworthy lastmod values, 8 intentional omissions |
| SEO/JSON-LD | PASS — 1,168 pages |
| Release diff check | PASS — four production content files plus approved feature report |
| Live target pages | PASS — 4/4 HTTP 200 |
| Live winner spot checks | PASS — 7/7 HTTP 200 |

Each of the four target URLs appears exactly once in the live sitemap. No unexpected money-page disappearance was detected by the repository sitemap and internal-link checks.

## GA4 and consent status

- Owner decision remains `R9_GA4_ROLLOUT = PAUSED_BY_OWNER`.
- Production HTML does not load `googletagmanager.com/gtag`, `google-analytics.com`, or an `amphon-ga4-gtag` element.
- `Analytics.astro` remains a no-op.
- Consent popup markup is absent.
- Footer consent-revisit/cookie-setting control is absent.
- Result: **GA4 disabled; consent UI absent.**

## GSC observation plan

Freeze the four target pages for at least 14 complete GSC days. Do not change title, description, H1, body, internal links, canonical, or schema content unless a P0 technical error is found.

After 14 complete days, compare Query × Page ownership for:

- `รับซื้อ iphone`
- `รับซื้อ ipad`
- `รับซื้อ macbook`
- `รับซื้อ imac`

Success means stronger exact-product ownership by the iPhone, iPad, MacBook, and iMac pages, with less selection of the Apple Hub or a wrong sibling and without cluster-level traffic loss.

For the iPad model-check article, monitor clicks, impressions, CTR, and average position for `วิธีดูรุ่น ipad`, `วิธีดูรุ่นไอแพด`, `วิธีเช็ครุ่น ipad`, serial/model-number variants, and Axxxx queries. Do not judge CTR from the first 1–3 days.

At 28 complete GSC days, classify each optimization as `WINNER`, `IMPROVED`, `NEUTRAL`, `WORSE`, or `INSUFFICIENT_DATA`.
