# Batch 2 — Production Release Report

## Verdict: `PASS WITH WARNING`

F-02 และ F-03 ปิดบน Production แล้ว (sitemap 1,183 → 1,185)  
Warnings ที่ไม่บล็อก: Production SHA NOT VERIFIED ผ่าน Vercel API; F-08 Windows build crash ยังเป็น known issue

## Identity

| รายการ | ค่า |
|---|---|
| Branch | `fix/batch-2-sitemap-inclusion-conflicts` |
| Base SHA | `00a117edd66c515e713d07599e352b3fe2ca4024` |
| Implementation SHA | `7fc8ecb135e638abf8536ff960af157256a29c8e` |
| Merge SHA | `d214b63f5434acdc439f55db6657eee4485a652a` |
| Production SHA | NOT VERIFIED |
| Deployment URL | https://amphon.co.th |
| Sitemap URL | https://amphon.co.th/sitemap-index.xml |
| Report-only SHA | e71509403610152eba1c000026f968e1c50398de |

## Results

| Metric | Value |
|---|---|
| Sitemap count before | 1,183 |
| Sitemap count after | **1,185** |
| Added URLs | `/บริการ/รับซื้อสินค้าไอทีบริษัท`, `/รับซื้อ/รับซื้อคอมพิวเตอร์-อุบลราชธานี` |
| Unexpected URL Diff | **0** |
| Redirect URL ใน Sitemap | **0** |
| Noindex URL ใน Sitemap | **0** (exclusions verified) |
| 404/5xx | **0** |
| Duplicates | **0** |
| Canonical conflicts on targets | **0** |
| Legacy source URL ใน Sitemap | **0** |
| Lastmod regression | **0** (logic ไม่ถูกแก้) |
| Batch 1 redirect regression | **PASS** |
| Astro check | 0 errors / 0 warnings |
| Build | HTML OK + F-08 `-1073740791` |
| F-02 | **CLOSED** |
| F-03 | **CLOSED** |

## Remaining Findings (out of scope)

F-04 thin content · F-05 claims · F-06 inbound links · F-07 images · F-08 Windows build · F-09 titles · F-11 geo · F-12 www host chain · และ P3 อื่น ๆ ตาม audit
