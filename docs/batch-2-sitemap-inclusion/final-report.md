# Batch 2 Final Report (pre-merge)

## Verdict (branch): `PASS WITH WARNING`

Filter + simulated sitemap + Batch 1 regression ผ่าน  
Warning: local sitemap XML ไม่ถูกสร้างเพราะ F-08 — ต้องยืนยันบน Production หลัง Merge/Deploy

## Identity

| รายการ | ค่า |
|---|---|
| Branch | `fix/batch-2-sitemap-inclusion-conflicts` |
| Base SHA | `00a117edd66c515e713d07599e352b3fe2ca4024` |
| Implementation SHA | `7fc8ecb135e638abf8536ff960af157256a29c8e` |

## Files changed

- `astro.config.mjs` — ใช้ shared filter
- `scripts/lib/sitemap-inclusion.mjs` — exact exclusions + prefix startsWith
- `scripts/check-batch-2-sitemap.mjs` — regression
- `package.json` — `qa:batch-2-sitemap`
- `docs/batch-2-sitemap-inclusion/*`

## Filter before → after

**Before:** substring `includes('/บริการ/รับซื้อสินค้าไอที')` + explicit exclude F-03 URL  
**After:** `SITEMAP_EXACT_EXCLUSIONS` Set + `SITEMAP_BLOCKED_PREFIXES` via `startsWith` — ไม่ตัด sibling `...บริษัท`; ไม่ exclude F-03

## Sitemap count

| สภาพ | Count |
|---|---|
| Production baseline | 1,183 |
| Simulated after fix | **1,185** |
| Expected added | `/บริการ/รับซื้อสินค้าไอทีบริษัท`, `/รับซื้อ/รับซื้อคอมพิวเตอร์-อุบลราชธานี` |
| Unexpected diff | **0** (ตาม unit/simulated tests) |

## Gates

| Check | Result |
|---|---|
| Astro check | 0 errors / 0 warnings |
| Batch 2 QA | PASS |
| Batch 1 QA | PASS |
| Build | HTML OK + F-08 crash |
| Lastmod logic | unchanged |
| Scope | sitemap-only |

## Post-deploy checklist

ดู `post-deploy-validation.csv` — ยืนยัน count 1185 และ F-02/F-03 อยู่ใน Production sitemap
