# Final report — Batch 5

## Verdict

**PASS WITH WARNING**

Warning: Production SHA `NOT VERIFIED`. All target asset/page checks passed.

## Finding

| Finding | Status |
| --- | --- |
| F-07 oversized content images | **CLOSED** |

## Identity

| Item | Value |
| --- | --- |
| Branch | `fix/batch-5-image-optimization` |
| Base SHA | `bbb30055a018c8d806e7ce1db060ca7d887515b8` |
| Implementation SHA | `4eb45b231ae19781d156249c5b96c5adb4dea6bd` |
| Merge SHA | `d2c7d2b0afe70d8c0c408addf514d9ad0d230754` |
| Production SHA | `NOT VERIFIED` |
| Report-only SHA | 80718b7301a15fa243275276e066fc4bd11b78b7 |
| Deployment URL | https://amphon.co.th |

## Change summary

| Metric | Count |
| --- | --- |
| Audit URLs (approx) | ~20 |
| Confirmed live URLs | 23 |
| PNG inspected | 21 referenced oversized |
| Assets changed | 21 |
| Valid exceptions | Unreferenced oversized PNGs retained; draft page source-only |
| Bytes before | 15007296 |
| Bytes after | 1825972 |
| Bytes saved | 13181324 (~87.8%) |
| Hero images changed | yes (frontmatter heroImage on most targets) |
| Content images changed | yes (markdown body) |
| Broken images | 0 |
| Asset 404 | 0 |

## QA / build

Astro check 0/0 · Batch 1–5 PASS · Build exit 0 · HTML 1188 · Sitemap 1185
