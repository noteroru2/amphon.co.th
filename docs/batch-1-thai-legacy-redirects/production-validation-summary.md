# Production Validation Summary — Batch 1.1

- **Timestamp:** 2026-07-31T17:44:36.533Z (Asia/Bangkok)
- **Merge SHA:** `1d59ee848ef6946f9822880dfeeea29d64b36957`
- **Production SHA:** NOT VERIFIED via Vercel API (no auth) — HTTP behavior matches deployed redirects from this merge
- **Deployment URL:** https://amphon.co.th
- **Permanent redirect status observed:** **308** (Vercel `permanent: true`; เหมือนกฎเดิมที่ทำงานก่อน Batch 1 เช่น `/บริการ/รับซื้อ-hdd`)

## Counts

| รายการ | ผล |
|---|---|
| Total production cases | **179** |
| PASS (308 permanent) | **179** |
| FAIL | **0** |
| Unicode sources | **86 / 86 PASS** |
| Percent-encoded sources | **86 / 86 PASS** |
| Logical URLs (redirect-map) | **86 / 86 PASS** (ทั้ง unicode + encoded) |
| Query string tests | **7 / 7 PASS** |
| Path redirect chains (https non-www) | **0** |
| Redirect loops | **0** |
| Incorrect destinations | **0** |
| Production 404 (legacy) | **0** |
| Production 5xx | **0** |
| Negative 404 tests | **3 / 3 PASS** |
| Current URL regression | **11 / 11 PASS** |
| Sitemap regression | **PASS** — index 200, sitemap-0 200, **1183** URLs, ไม่มี legacy redirect sources |

## Query String Preservation

ตัวอย่างที่ยืนยันแล้ว:

- `/รับซื้อ?source=batch-1-test` → `Location: /รับซื้อสินค้าไอที?source=batch-1-test`
- encoded hub + `utm_*` / province + `ref=legacy` — query คงอยู่ครบ

## Host variants (out of scope hops)

| Request | Hops | Final |
|---|---|---|
| `http://amphon.co.th/รับซื้อ` | 2 (https normalize + path) | `/รับซื้อสินค้าไอที` 200 |
| `https://www.amphon.co.th/รับซื้อ` | 2 (www→apex + path) | `/รับซื้อสินค้าไอที` 200 |
| `http://www.amphon.co.th/รับซื้อ` | 3 (existing F-12 + path) | `/รับซื้อสินค้าไอที` 200 |

Path redirect บน `https://amphon.co.th` ยังเป็น **1 ทอด** ทุกเคส

## Notes

- ไม่มี Vercel CLI/token → ไม่ยืนยัน deployment ID / commit SHA จาก dashboard
- สถานะ HTTP 308 แทน 301 เป็นพฤติกรรมแพลตฟอร์ม Vercel ไม่ใช่ regression ของ Batch 1
