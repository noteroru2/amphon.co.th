# Amphon.co.th — Spam Update Risk Audit

Captured: 2026-09-28  
Live sitemap surface audited: **1165 URLs**  
GSC evidence window: **2026-07-01 to 2026-09-25** (latest finalized data available)

## Safety boundary

This audit is **classification only**. It does **not** execute noindex, redirect, merge, canonical changes, sitemap removal, or content deletion.

## Classification summary

- KEEP: **514**
- MERGE: **3**
- NOINDEX: **648**

## Surface by route

- area:KEEP: 32
- blog:KEEP: 50
- home:KEEP: 1
- service-location:KEEP: 273
- service-location:NOINDEX: 648
- service:KEEP: 151
- service:MERGE: 3
- static:KEEP: 7

## Spam-risk distribution

- LOW: 191
- MEDIUM: 53
- HIGH: 921

## Key finding

The largest structural exposure is the `/รับซื้อ/*` service×province surface. The live sitemap contains **921** such URLs. Pages with real GSC demand are protected as KEEP. Thin/low-evidence pages are split between MERGE (where a stronger canonical service intent already exists) and NOINDEX (reversible candidate where local intent may still be useful but current index evidence is too weak).

Core money pages, province hubs, and editorial pages are not mass-retired by this audit.

## Highest-risk service×province families

| Family | Total | KEEP | MERGE | NOINDEX | 90d clicks | 90d impressions |
|---|---:|---:|---:|---:|---:|---:|
| รับซื้อ-surface | 20 | 0 | 0 | 20 | 0 | 3 |
| รับซื้อ-mac-mini | 20 | 0 | 0 | 20 | 0 | 4 |
| รับซื้อ-imac | 20 | 1 | 0 | 19 | 1 | 4 |
| รับซื้อจอเกมมิ่ง | 20 | 1 | 0 | 19 | 1 | 4 |
| รับซื้อคอมบริษัท | 20 | 1 | 0 | 19 | 1 | 12 |
| รับซื้อคอมเกมมิ่ง | 20 | 1 | 0 | 19 | 2 | 20 |
| รับซื้อ-server | 20 | 1 | 0 | 19 | 1 | 22 |
| รับซื้ออุปกรณ์-network | 20 | 1 | 0 | 19 | 1 | 25 |
| รับซื้อการ์ดจอ | 20 | 1 | 0 | 19 | 1 | 39 |
| รับซื้อโน๊ตบุ๊คเกมมิ่ง | 20 | 1 | 0 | 19 | 1 | 41 |
| รับซื้อซีพียู | 20 | 2 | 0 | 18 | 2 | 12 |
| รับซื้อ-nintendo-switch | 20 | 2 | 0 | 18 | 4 | 20 |
| รับเหมาประมูลอุปกรณ์ไอที | 20 | 2 | 0 | 18 | 2 | 29 |
| รับซื้อกล้อง-fujifilm | 20 | 3 | 0 | 17 | 4 | 11 |
| รับซื้อแรม | 20 | 3 | 0 | 17 | 6 | 28 |
| รับซื้อกล้อง-sony | 20 | 3 | 0 | 17 | 4 | 72 |
| รับซื้อ-ssd | 20 | 4 | 0 | 16 | 5 | 21 |
| รับซื้อ-playstation | 20 | 4 | 0 | 16 | 8 | 33 |
| รับซื้อ-marshall | 20 | 4 | 0 | 16 | 5 | 34 |
| รับซื้อแท็บเล็ต | 20 | 4 | 0 | 16 | 4 | 36 |
| รับซื้อโดรน | 20 | 4 | 0 | 16 | 6 | 51 |
| รับซื้อกล้อง-canon | 20 | 4 | 0 | 16 | 3 | 83 |
| รับซื้อ-airpods | 20 | 5 | 0 | 15 | 8 | 38 |
| รับซื้อ-macbook | 20 | 5 | 0 | 15 | 6 | 39 |
| รับซื้อหูฟัง | 20 | 5 | 0 | 15 | 14 | 54 |
| รับซื้อ-jbl | 20 | 5 | 0 | 15 | 9 | 65 |
| รับซื้อ-ups | 20 | 6 | 0 | 14 | 15 | 91 |
| รับซื้อ-apple-watch | 20 | 6 | 0 | 14 | 22 | 145 |
| รับซื้อ-apple | 20 | 6 | 0 | 14 | 11 | 152 |
| รับซื้อลำโพงบลูทูธ | 20 | 7 | 0 | 13 | 39 | 222 |

## Decision rules used

1. **KEEP** when a page has meaningful GSC demand, is a core service/area/editorial page, or removing it would risk a proven winner.
2. **MERGE** when intent overlaps a stronger hub/core page and prior thin-content evidence plus weak GSC supports consolidation.
3. **NOINDEX** for weak service×province pages with no clicks and <20 impressions in ~90 days where reversible index reduction is safer than an immediate redirect/merge.
4. Previous owner decisions are recorded but do not silently override current spam-risk evidence; conflicts are visible in the CSV.
5. No implementation should happen until the Google rollout stabilizes and the highest-risk groups are manually reviewed.

## Files

- `url-classification.csv` — all 1165 current sitemap URLs with GSC evidence, prior audit context, owner-decision context, risk and classification.
