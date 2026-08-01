# Batch 10 — Metadata Quality (F-09)

Selective metadata clarity fixes for Finding F-09. Length is a signal only — no automatic truncation.

## What changed

- Removed payment/logistics/product-list boilerplate from confirmed problem titles
- Removed duplicated brand from frontmatter (layout already appends `| Amphon.co.th`)
- Rewrote a few extreme service descriptions without changing claims policy

## QA

```bash
npm run build
npm run qa:batch-10-metadata
```
