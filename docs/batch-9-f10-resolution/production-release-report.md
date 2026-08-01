# Production Release Report — Batch 9 F-10

```text
Verdict: PASS
Finding F-10 status: CLOSED
Finding definition: tel: href inconsistency (tel:+66642579353 vs tel:0642579353)
Priority/category: P3 / Consistency (NAP)
Branch: fix/batch-9-f10-resolution
Base SHA: 252ba810c6a1cad9c45860b53c5fb1ff4fa1f34e
Implementation SHA: cd0271fe5211300c9b967b5767f0a341d87669c6
Merge SHA: 70c745c7526a62e52dffc673912e72434e8c4bd8
Production SHA: NOT VERIFIED
Report-only SHA: PENDING
Deployment URL: https://amphon.co.th
Root cause: markdown body used national tel:0642579353 while chrome/schema used E.164 site.phoneTel
Fix: replace 948 hrefs in 884 content files to tel:+66642579353 (display text unchanged)
URLs affected: 884 content sources; 823 live 200 pages verified clean; 61 legacy 308 redirects
Files changed: 884 markdown + package.json + qa script + docs/batch-9-f10-resolution/*
Production result: PASS (0 local tel on all live inventory pages)
Regression result: PASS (Batch 1–9 QA; F-12 warning expected)
Route/Sitemap/Canonical/Noindex diff: 0 / 0 (1185) / 0 / 0
Batch 1–9 QA: PASS (Batch 7 PASS WITH WARNING for F-12)
Build result: exit 0
F-12 status: OPEN / BLOCKED BY VERCEL DOMAIN CONFIGURATION
Remaining Findings: F-04, F-06, F-09, F-12, F-14, F-15, F-16, F-17, F-18 (and other open backlog items)
```
