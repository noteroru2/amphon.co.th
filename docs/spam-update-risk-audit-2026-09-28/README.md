# Amphon.co.th — Spam Update Risk Audit

Captured: 2026-09-28  
Live sitemap surface audited: **1165 URLs**  
GSC evidence window: **2026-07-01 to 2026-09-25**

## Safety boundary

Classification only. **No noindex, redirect, merge, canonical change, sitemap removal, or content deletion has been executed.**

## Classification summary

- KEEP: **615**
- MERGE: **9**
- NOINDEX: **541**

## Route breakdown

- area:KEEP: 32
- blog:KEEP: 50
- home:KEEP: 1
- service-location:KEEP: 374
- service-location:MERGE: 6
- service-location:NOINDEX: 541
- service:KEEP: 151
- service:MERGE: 3
- static:KEEP: 7

## Structural finding

The live index surface contains **921 service×province URLs under /รับซื้อ/** out of 1165 sitemap URLs. This is the main scaled-content/doorway-risk surface. Proven local winners are protected as KEEP. Weak pages are classified MERGE when prior cannibalization evidence points to a stronger hub, otherwise NOINDEX as a reversible candidate.

## Previous owner decisions

The audit normalizes and records Batch 12F owner decisions. **111 owner-confirmed KEEP pages are currently HIGH-RISK KEEP** because their recent GSC evidence is weak. They are **not** moved to NOINDEX automatically; they require unique-value improvement/manual review first.

## Highest-risk service×province families

| Family | Total | KEEP | MERGE | NOINDEX | 90d clicks | 90d impressions |
|---|---:|---:|---:|---:|---:|---:|
| รับซื้อ-surface | 20 | 0 | 0 | 20 | 0 | 3 |
| รับซื้อ-mac-mini | 20 | 0 | 0 | 20 | 0 | 4 |
| รับซื้อ-imac | 20 | 1 | 0 | 19 | 1 | 4 |
| รับซื้อจอเกมมิ่ง | 20 | 1 | 0 | 19 | 1 | 4 |
| รับซื้อคอมบริษัท | 20 | 1 | 0 | 19 | 1 | 12 |
| รับซื้อคอมเกมมิ่ง | 20 | 1 | 0 | 19 | 2 | 20 |
| รับซื้อการ์ดจอ | 20 | 1 | 0 | 19 | 1 | 39 |
| รับซื้อโน๊ตบุ๊คเกมมิ่ง | 20 | 1 | 0 | 19 | 1 | 41 |
| รับซื้อซีพียู | 20 | 2 | 0 | 18 | 2 | 12 |
| รับซื้อ-nintendo-switch | 20 | 2 | 0 | 18 | 4 | 20 |
| รับซื้อกล้อง-fujifilm | 20 | 3 | 0 | 17 | 4 | 11 |
| รับซื้อแรม | 20 | 3 | 0 | 17 | 6 | 28 |
| รับซื้อกล้อง-sony | 20 | 3 | 0 | 17 | 4 | 72 |
| รับซื้อ-ssd | 20 | 4 | 0 | 16 | 5 | 21 |
| รับซื้อ-playstation | 20 | 4 | 0 | 16 | 8 | 33 |
| รับซื้อ-marshall | 20 | 4 | 0 | 16 | 5 | 34 |
| รับซื้อแท็บเล็ต | 20 | 4 | 0 | 16 | 4 | 36 |
| รับซื้อกล้อง-canon | 20 | 4 | 0 | 16 | 3 | 83 |
| รับซื้อ-airpods | 20 | 5 | 0 | 15 | 8 | 38 |
| รับซื้อ-macbook | 20 | 5 | 0 | 15 | 6 | 39 |
| รับซื้อหูฟัง | 20 | 5 | 0 | 15 | 14 | 54 |
| รับซื้อ-jbl | 20 | 5 | 0 | 15 | 9 | 65 |
| รับซื้อ-apple-watch | 20 | 6 | 0 | 14 | 22 | 145 |
| รับซื้อ-apple | 20 | 6 | 0 | 14 | 11 | 152 |
| รับซื้อลำโพงบลูทูธ | 20 | 7 | 0 | 13 | 39 | 222 |
| รับซื้อสินค้าไอที | 20 | 7 | 0 | 13 | 20 | 306 |
| รับซื้อคอมพิวเตอร์ | 20 | 9 | 0 | 11 | 17 | 146 |
| รับซื้อเครื่องเกม | 20 | 10 | 0 | 10 | 25 | 107 |
| รับซื้อ-iphone | 20 | 10 | 0 | 10 | 19 | 182 |
| รับซื้ออุปกรณ์ไอที | 20 | 10 | 0 | 10 | 16 | 194 |

## Rules

1. KEEP proven winners: >=2 clicks or >=50 impressions in the evidence window.
2. Preserve previous OWNER_CONFIRMED_KEEP_AND_IMPROVE decisions as KEEP, but flag weak pages as HIGH-RISK KEEP.
3. MERGE when prior thin/cannibalization evidence or clear service-intent overlap points to a stronger core page.
4. NOINDEX only as a **candidate classification** for weak service×province pages with 0 clicks and <20 impressions, absent a stronger prior KEEP decision.
5. No bulk implementation during active ranking volatility. Review families first, then use a small pilot with rollback and measurement.

## Files

- `url-classification.csv` — all 1165 live sitemap URLs, current GSC evidence, prior Batch 12 context, prior owner decision, spam risk and classification.
