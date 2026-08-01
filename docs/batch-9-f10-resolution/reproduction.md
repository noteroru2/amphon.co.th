# Reproduction — F-10

## Classification

```text
CONFIRMED ACTIVE
```

## Source (pre-fix)

| Metric | Value |
|---|---|
| `tel:0642579353` occurrences | 948 |
| Files with local tel href | 884 |
| `tel:+66642579353` hardcoded in content | 0 |
| Components using `site.phoneTel` (`+66642579353`) | 13 files / 19 template hrefs |
| `site.phoneTel` in `src/config/site.ts` | `+66642579353` |

Root pattern: layout/chrome CTAs already E.164; markdown body links used national `tel:0642579353`.

## Build (pre-fix expectation)

Built pages that include both chrome + markdown body would emit **both** href forms on the same HTML document.

## Production (2026-08-01 samples)

| URL | Status | `tel:+66642579353` | `tel:0642579353` |
|---|---|---:|---:|
| `/` | 200 | 8 | 0 |
| `/contact` | 200 | 5 | 0 |
| `/บริการ/รับซื้อโน๊ตบุ๊คเกมมิ่ง` | 200 | 6 | 2 |
| `/รับซื้อ/รับซื้อโน๊ตบุ๊ค-อุบลราชธานี` | 200 | 6 | 1 |

Homepage/contact have only chrome CTAs → E.164 only. Service/serviceArea pages mix both → **CONFIRMED ACTIVE**.

## Batch 1–8 impact

ไม่มี Batch ก่อนหน้าที่ตั้งใจแก้ F-10; `site.phoneTel` เป็น E.164 อยู่แล้วก่อน Batch 9 แต่เนื้อหา markdown ยังเป็นรูปแบบท้องถิ่น

## Gate B decision

แก้ใน repository ได้: แทนที่เฉพาะ `tel:0642579353` → `tel:+66642579353` ใน source content (ไม่เปลี่ยนเลขที่แสดงผล, URL, schema type, หรือ Finding อื่น)
