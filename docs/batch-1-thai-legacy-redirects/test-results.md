# Batch 1 — Test Results

## Commands

| Command | Result |
|---|---|
| `npm run qa:batch-1-redirects` | **PASS** — 174 cases, 20 provinces, 0 chains/loops, negatives OK |
| `npm run qa:redirect-chain` | **PASS** — 9 sample paths |
| `npx astro check` | **PASS** — 0 errors, 0 warnings (53 hints pre-existing / unrelated) |
| `npm run build` | HTML routes สร้างครบ แล้ว process ออกด้วย exit `-1073740791` (F-08 known Windows issue — ไม่แก้ใน Batch นี้) |

## Coverage

| กลุ่ม | จำนวนเคส | ผล |
|---|---|---|
| Hub exact (unicode + encoded) | 4 | PASS |
| Service exact under `/รับซื้อ` (unicode + encoded) | 8 | PASS |
| Service × province (4 services × 20 provinces × 2 forms) | 160 | PASS |
| Query string (`?source=test`) | 2 | PASS (config-level: destination ไม่มี `?` → Vercel preserve query) |
| Negative 404 | 3 paths | PASS — ไม่ถูก redirect ไป home/hub |
| Current URL regression | 10 paths | PASS — ไม่ถูก redirect |

รวมเคสใน regression script: **174** (query รวมอยู่ด้วย)

## Assertions ที่ตรวจทุกเคส

1. มี redirect rule ตรงกับ request (unicode หรือ percent-encoded)
2. `permanent: true` (= HTTP 301/308 ถาวรบน Vercel)
3. Destination ตรง redirect-map
4. Destination ไม่ redirect ต่อ (1 hop)
5. ไม่มี loop
6. Destination อยู่ในชุดปลายทางที่ยืนยันจาก content/pages
7. เมื่อมี `dist/client` — destination มี HTML จริง

## Query string

- Config ทุก F-01 rule ใช้ destination แบบ path อย่างเดียว (ไม่มี `?`)
- ตามพฤติกรรมมาตรฐานของ Vercel redirects: query ของ request จะถูกเก็บไปยัง Location
- **NOT VERIFIED LOCALLY บน Vercel Edge** — ต้องยืนยันหลัง deploy ด้วยแถว `query_test=yes` ใน `post-deploy-validation.csv`

## Local Vercel runtime

- Astro `dev` **ไม่อ่าน** `vercel.json` redirects → ไม่ใช้เป็นหลักฐาน
- ไม่ได้รัน `vercel dev` ใน Batch นี้
- Runtime verification = config matcher ใน `scripts/lib/site-audit.mjs` + production baseline ก่อนแก้
- หลัง Merge/Deploy ให้รัน checklist ใน `post-deploy-validation.csv`

## Production baseline (ก่อนแก้ — ยังเป็นสถานะ production ปัจจุบัน)

ตรวจด้วย percent-encoded requests วันที่ 2026-08-01:

| URL | Status |
|---|---|
| `/รับซื้อ` | **404** |
| `/บริการ/รับซื้อสินค้าไอที` | **404** |
| `/รับซื้อ/รับซื้อ-hdd` | **404** |
| `/รับซื้อ/รับซื้อ-gopro` | **404** |
| `/รับซื้อ/รับซื้อเลนส์` | **404** |
| `/รับซื้อ/รับซื้อ-storage-nas` | **404** |
| `/รับซื้อ/รับซื้อ-hdd-ขอนแก่น` | **404** |
| `/รับซื้อ/รับซื้อ-gopro-ขอนแก่น` | **404** |
| `/รับซื้อ/รับซื้อเลนส์-ขอนแก่น` | **404** |
| `/รับซื้อ/รับซื้อ-storage-nas-เลย` | **404** |
| `/บริการ/รับซื้อ-hdd` (มี encoded คู่เดิม) | **308** → `/บริการ/รับซื้อ-ssd` |
| Destinations ปัจจุบัน (`/รับซื้อสินค้าไอที`, `/บริการ/รับซื้อ-ssd`, …) | **200** |
