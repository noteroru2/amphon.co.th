# Test Results — Batch 9 F-10

| Check | Result |
|---|---|
| `npx astro check` | PASS — 0 errors / 0 warnings (67 pre-existing hints; scratch + unused vars) |
| `npm run build` | PASS — exit 0 |
| HTML / routes | 1188 built pages |
| Sitemap | 1185 URLs |
| `qa:batch-1-redirects` | PASS |
| `qa:batch-2-sitemap` | PASS |
| `qa:batch-3-build` | PASS |
| `qa:batch-4-claims` | PASS |
| `qa:batch-5-images` | PASS |
| `qa:batch-6-schema-geo` | PASS |
| `qa:batch-7-host-redirects` | PASS WITH WARNING (F-12 expected; not Batch 9 regression) |
| `qa:batch-8-image-dimensions` | PASS |
| `qa:batch-9-f10` | PASS — source forbidden=0; dist forbidden=0; e164 pages=1186; sitemap=1185 |

## Dist validation

- `tel:0642579353` occurrences in dist HTML: **0**
- Pages with `tel:+66642579353`: **1186**
- Spot checks `/`, `/contact`, `/บริการ/รับซื้อโน๊ตบุ๊คเกมมิ่ง`, `/รับซื้อ/รับซื้อโน๊ตบุ๊ค-อุบลราชธานี`: PASS

## Unexpected SEO diffs

```text
Route diff: 0
Unexpected sitemap diff: 0
Unexpected canonical diff: 0
Unexpected noindex diff: 0
Unexpected redirect diff: 0
Unexpected content diff: 0 (only tel: href string)
Unexpected metadata diff: 0
Unexpected schema diff: 0
Unexpected internal link diff: 0 (tel is not internal path link)
Unexpected image diff: 0
```
