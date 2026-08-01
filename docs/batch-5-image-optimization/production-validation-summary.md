# Production validation summary — Batch 5

| Item | Value |
| --- | --- |
| Verdict | PASS WITH WARNING |
| F-07 | CLOSED |
| Branch | `fix/batch-5-image-optimization` |
| Base SHA | `bbb30055a018c8d806e7ce1db060ca7d887515b8` |
| Implementation SHA | `4eb45b231ae19781d156249c5b96c5adb4dea6bd` |
| Merge SHA | `d2c7d2b0afe70d8c0c408addf514d9ad0d230754` |
| Production SHA | `NOT VERIFIED` |
| Deployment URL | https://amphon.co.th |
| Audit URLs (approx) | ~20 |
| Confirmed live URLs | 23 |
| PNG inspected (referenced oversized) | 21 |
| Assets changed | 21 |
| Valid exceptions | Unreferenced oversized PNGs retained; draft service source updated only |
| Bytes before / after / saved | 15007296 / 1825972 / 13181324 |
| Average saving | ~87.8% |
| Production broken images | 0 |
| Asset 404 | 0 |
| Visual regression | none observed in dimension/magic checks |
| Route / Sitemap | 1188 HTML local / 1185 prod |
| Batch 1–5 QA | PASS |
| Remaining Findings | F-04 F-06 F-09 F-11 F-12 (+P3/F-13) |
