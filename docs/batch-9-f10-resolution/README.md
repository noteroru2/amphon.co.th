# Batch 9 — F-10 tel: href normalization

Normalize all `tel:` hrefs to E.164 `tel:+66642579353` to match `site.phoneTel` and close Finding F-10.

## Scope

- In scope: `tel:0642579353` → `tel:+66642579353` in content markdown
- Out of scope: F-04, F-06, F-09, F-12; display phone text; routes; sitemap; schema types

## QA

```bash
npm run build
npm run qa:batch-9-f10
```
