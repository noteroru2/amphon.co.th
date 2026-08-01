# Root Cause Analysis — F-10

```text
Symptom: หน้าเดียวมี tel: href สองรูปแบบ — tel:+66642579353 และ tel:0642579353
Finding definition: F-10 Consistency / NAP (P3) จาก seo-audit-2026-07-31
Confirmed reproduction: yes — source 948 local hrefs; production service pages mixed
Affected URLs: ~884 content pages with markdown tel links (+ chrome CTAs already E.164)
Affected source: src/content/**/*.md body links; NOT site.phoneTel / schema telephone
Production behavior: mixed hrefs on content-heavy pages; chrome-only pages E.164-only
Root cause: content authors used national format tel:0642579353 in markdown while site config standardized on E.164 for components/schema
Evidence: site.ts phoneTel=+66642579353; grep 948× tel:0642579353; production HTML samples
Ruled-out causes:
  - Schema telephone wrong format (schema already E.164)
  - Two different phone numbers (same number, different URI form)
  - Prior batches already fixed content (still present pre-Batch 9)
Selected fix: mechanical replace tel:0642579353 → tel:+66642579353 in source content only
Why it works: aligns body hrefs with site.phoneTel / audit recommendation (E.164); display text unchanged
Risks: low — dialers accept both; E.164 is recommended; no URL/route/metadata change
Rollback: revert content replace commit
Validation: source grep zero local tel; dist HTML zero local tel; qa:batch-9-f10; production re-check
```
