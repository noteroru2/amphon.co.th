# Batch 2 — Repair Sitemap Inclusion Conflicts

แก้เฉพาะ Finding **F-02** และ **F-03** จาก SEO audit

| รายการ | ค่า |
|---|---|
| Branch | `fix/batch-2-sitemap-inclusion-conflicts` |
| Scope | Sitemap filter + regression tests + docs |
| ไม่รวม | Redirect / Content / Metadata / Schema / lastmod logic / F-08 |

## ไฟล์

| ไฟล์ | เนื้อหา |
|---|---|
| `README.md` | ภาพรวม |
| `baseline.md` | สถานะก่อนแก้ |
| `sitemap-diff.csv` | Before/After URL status |
| `test-results.md` | ผล QA |
| `post-deploy-validation.csv` | checklist หลัง deploy |
| `final-report.md` | รายงานสรุปก่อน/หลัง merge |

## คำสั่ง

```bash
npm run qa:batch-2-sitemap
npm run qa:batch-1-redirects
```
