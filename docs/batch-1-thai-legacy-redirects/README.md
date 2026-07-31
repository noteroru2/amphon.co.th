# Batch 1 — Repair Dead Thai Legacy Redirects

แก้เฉพาะ Finding **F-01 (P1)** จาก `docs/seo-audit-2026-07-31/`

| รายการ | ค่า |
|---|---|
| Branch | `fix/batch-1-thai-legacy-redirects` |
| Scope | `vercel.json` redirects + regression tests + batch docs |
| ไม่รวม | Content / Metadata / Sitemap / Schema / Internal Link / F-02..F-18 |
| Merge / Deploy | **ยังไม่ทำ** |

## ไฟล์ในชุดนี้

| ไฟล์ | เนื้อหา |
|---|---|
| `README.md` | ภาพรวม Batch |
| `redirect-map.csv` | Legacy URL 86 คู่ (unicode + encoded) → destination |
| `test-results.md` | ผล regression |
| `post-deploy-validation.csv` | checklist หลัง deploy (status_after = PENDING) |
| `final-report.md` | รายงานสรุป + Verdict |
| `regression-results.json` | ผลดิบจาก test script |

## คำสั่งที่เกี่ยว

```bash
npm run qa:batch-1-redirects
npm run qa:redirect-chain
node scripts/generate-batch-1-redirects.mjs   # regenerate vercel redirects if needed
```
