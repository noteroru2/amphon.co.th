# Similarity before / after

## Methods

Audit baseline เดิมรายงาน average pairwise similarity **92.4%** และ 190/190 คู่เกิน 75% แต่ไม่ได้ให้ executable implementation เดียวกัน จึงเก็บตัวเลขนี้เป็น historical audit baseline เท่านั้น

เพื่อเปรียบเทียบแบบ method เดียวกัน งานนี้เพิ่ม `scripts/analyze-macbook-service-area.mjs`:

- อ่านเฉพาะ built `article.prose`
- ตัด HTML/script/style/URL
- normalize ชื่อทั้ง 20 จังหวัด, เบอร์โทร และ contact tokens
- สร้าง normalized 4-word shingles
- คำนวณ Jaccard similarity ครบ 190 คู่

## Reproducible comparison

| Metric | Before | After | Change |
|---|---:|---:|---:|
| Average similarity | 86.81% | 25.91% | -60.90 percentage points |
| Median similarity | 86.72% | 25.94% | -60.78 percentage points |
| Maximum similarity | 92.99% | 29.27% | -63.72 percentage points |
| Pairs > 75% | 190/190 | 0/190 | -190 pairs |
| Average unique-content ratio | 6.89% | 54.43% | +47.54 percentage points |

Before ใช้ output ของ commit `a40f6b3` ใน diagnostic build เดิม; After ใช้ production build ของ branch นี้ ทั้งสองรันด้วย script และ normalization เดียวกัน
