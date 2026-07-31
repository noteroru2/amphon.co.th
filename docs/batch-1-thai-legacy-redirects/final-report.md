# Batch 1 Final Report — Thai Legacy Redirects (F-01)

## Verdict: `PASS WITH WARNING`

ผ่านเกณฑ์ Batch ในระดับ configuration + automated regression ครบทุก Legacy URL ใน Finding F-01  
Warning: ยังไม่ได้ยืนยันบน Vercel Edge / Production หลัง deploy (ห้าม deploy ใน Batch นี้) และ query preservation ยืนยันได้ระดับ config เท่านั้น

## Identity

| รายการ | ค่า |
|---|---|
| Source branch | `fix/batch-1-thai-legacy-redirects` |
| Base SHA (main) | `a0fb3703d493b85a9bcefbad16ef62945a2ec220` |
| Final SHA | `fe6b2d61e10390d7ffe228d5b52843419cfbf010` |
| Production system of record | **Vercel redirects ใน `vercel.json`** (ไม่มี `public/_redirects`, ไม่มี middleware, ไม่มี Cloudflare redirect rules ใน repo) |

## Files changed (scope)

- `vercel.json` — เพิ่ม/ขยาย redirect rules สำหรับ F-01
- `package.json` — เพิ่ม script `qa:batch-1-redirects`
- `scripts/generate-batch-1-redirects.mjs` — generator กัน encode ผิด
- `scripts/generate-batch-1-docs-csv.mjs` — สร้าง CSV รายงาน
- `scripts/check-batch-1-thai-legacy-redirects.mjs` — regression test
- `docs/batch-1-thai-legacy-redirects/*` — รายงาน Batch

ไม่มีการแก้ content, metadata, sitemap filter, schema, หรือ internal links

## Redirect rules

| กลุ่ม | จำนวน |
|---|---|
| กฎที่ทำงานอยู่แล้ว (คงไว้) | 11 |
| F-01 exact (unicode + encoded) | 12 |
| F-01 service × province explicit (unicode + encoded) | 160 |
| Trailing-slash catch-all | 1 |
| **รวมใน vercel.json** | **184** (เดิม 22) |

หมายเหตุ: แทนที่ `:province` pattern ด้วยกฎรายจังหวัดแบบ explicit เพราะ percent-encoded province segment ไม่ match กับ Unicode pattern บน production

## Coverage counts

| รายการ | จำนวน |
|---|---|
| Legacy logical URLs (redirect-map rows) | **86** |
| Unicode sources เพิ่ม/ยืนยัน | 86 |
| Percent-encoded sources เพิ่ม | 86 |
| Service × Province logical URLs | 80 (4 × 20) |
| Regression test cases | 174 |
| Redirect chains | **0** |
| Redirect loops | **0** |
| Negative tests still 404 (ไม่ไป home) | **PASS** |

## Destinations (confirmed in repo)

| Destination | Evidence |
|---|---|
| `/รับซื้อสินค้าไอที` | `src/pages/รับซื้อสินค้าไอที.astro` + production 200 |
| `/บริการ/รับซื้อ-ssd` | `src/content/services/รับซื้อ-ssd.md` + production 200 |
| `/บริการ/รับซื้อ-gopro-action-camera` | content + production 200 |
| `/บริการ/รับซื้อเลนส์กล้อง` | content + production 200 |
| `/บริการ/รับซื้อ-nas` | content + production 200 |
| `/รับซื้อ/รับซื้อ-ssd-{province}` × 20 | serviceAreas files + production sample 200 |

ไม่มี URL ที่ถูก redirect ไป `/` เพราะเดาปลายทางไม่ได้

## Query string

- Config: destination ไม่มี query → คาดว่า Vercel preserve
- Local Edge: **NOT VERIFIED LOCALLY**
- ใส่ใน post-deploy checklist

## Astro check / Build

- `npx astro check`: 0 errors, 0 warnings
- `npm run build`: สร้าง HTML routes สำเร็จ แล้ว crash exit `-1073740791` บน Windows หลัง rearrange (Finding **F-08**, OUT OF SCOPE) — ไม่ซ่อน exit code

## Production baseline

Legacy F-01 URLs ยังตอบ **404** บน production ปัจจุบัน (ยังไม่ได้ deploy branch นี้)  
Destination URLs ปัจจุบันตอบ **200**

## Post-deploy

ดู `post-deploy-validation.csv` — `production_status_after = PENDING DEPLOYMENT` ทุกแถว

## OUT OF SCOPE ที่พบระหว่างงาน

- F-08 Windows build crash
- F-02 sitemap substring bug
- F-12 http://www 2-hop chain
- อื่น ๆ ตาม audit

## Ready for deploy?

**Branch พร้อม Review / Merge** — หลัง Merge+Deploy ต้องรัน `post-deploy-validation.csv` ให้ครบก่อนปิด F-01
