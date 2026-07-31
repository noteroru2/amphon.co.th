# Baseline — Batch 4 / F-05

## Base SHA

`fe4b9e420ccc97ec99168d603c096242268332cb` (`origin/main` tip after Batch 3 report-only)

## Finding

**F-05 — P2**: Notebook brand pages and blog pages use “ประเมินฟรี จ่ายทันที” / “จ่ายเงินทันที” without clear payment conditions.

## Counts

| Metric | Value |
| --- | --- |
| URLs reported by audit | 8 |
| URLs confirmed in current sources | 8 |
| Notebook service pages | 5 |
| Blog articles | 3 |
| Shared component origin | None — claims are per-file frontmatter/body |
| Title/Description on notebook pages | Already qualified (“ชำระเงินหลังตรวจสอบสินค้าและตกลงราคา…”) — no change |
| FAQ on safety blog | Already qualified (“จ่ายทันทีหลังตรวจเครื่องและตกลงราคา…”) — no change |

## Confirmed URLs

1. `/บริการ/รับซื้อ-notebook-acer` — H1
2. `/บริการ/รับซื้อ-notebook-asus` — H1
3. `/บริการ/รับซื้อ-notebook-dell` — H1
4. `/บริการ/รับซื้อ-notebook-hp` — H1
5. `/บริการ/รับซื้อ-notebook-lenovo` — H1
6. `/blog/รับซื้อสินค้าไอทีถึงที่-ปลอดภัยไหม` — intro + bullet
7. `/blog/ราคา-ipad-มือสอง-2026` — CTA paragraph
8. `/blog/ราคา-macbook-มือสอง-2026` — CTA paragraph

## Text before (examples)

- H1: `...ประเมินฟรี จ่ายทันที`
- Blog intro: `ตรวจเครื่องหน้างาน จ่ายเงินทันที`
- Blog CTA: `ประเมินเร็ว จ่ายเงินทันที`

## Production status (pre-fix)

Spot checks returned HTTP 200 for sample Acer notebook and the three blog URLs.

## Additional instances (out of F-05 URL list)

Inventory recorded deferred instances on other service pages (หูฟัง, อุปกรณ์คอมพิวเตอร์, กล้อง Nikon) and seed/OG scripts. Not fixed in this batch.
