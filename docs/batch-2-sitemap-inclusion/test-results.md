# Batch 2 — Test Results

## Commands

| Command | Result |
|---|---|
| `npx astro check` | **PASS** — 0 errors, 0 warnings |
| `npm run qa:batch-2-sitemap` | **PASS** — required inclusions OK; simulated sitemap **1185**; dist XML = `BLOCKED_BY_F08_OR_MISSING` |
| `npm run qa:batch-1-redirects` | **PASS** — 174 cases |
| `npm run build` | HTML routes OK; exit `-1073740791` (F-08 known) — sitemap XML ไม่ถูก emit ใน local |

## Coverage

- F-02 `/บริการ/รับซื้อสินค้าไอทีบริษัท` — filter includes + built page indexable/self-canonical
- F-03 `/รับซื้อ/รับซื้อคอมพิวเตอร์-อุบลราชธานี` — filter includes + ไม่ได้อยู่ใน exact exclusion set
- Exact exclusions (legacy hub + 4 fallback services) ยัง exclude
- Batch 1 legacy province prefixes ยัง exclude (`startsWith`)
- Simulated sitemap count: **1185** (= production baseline 1183 + 2)

## Lastmod

- ไม่มีการแก้ `trustworthy-sitemap-lastmod.mjs`
- URL ที่เพิ่มกลับเข้า sitemap ไม่ได้ถูกบังคับ lastmod เป็นวัน Batch — ใช้ resolver เดิม

## Local sitemap XML

`NOT VERIFIED LOCALLY` / blocked by F-08 — ต้องยืนยันบน Production หลัง deploy
