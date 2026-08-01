# Production Validation Summary — Batch 9 F-10

## Verdict

```text
PASS
```

Finding F-10 is **CLOSED** on production.

## Production checks

| Metric | Result |
|---|---|
| Inventory URLs checked | 884 |
| HTTP 200 live pages | 823 |
| Live pages with `tel:0642579353` | **0** |
| Live pages PASS (local tel = 0) | **823** |
| HTTP 308 legacy redirects | 61 (gopro×20, hdd×20, เลนส์×20, `/บริการ/รับซื้อสินค้าไอที`→hub) |
| Homepage | 200 |
| Sitemap index | 200 |
| Sitemap-0 URL count | **1,185** |

The 61 redirect responses are **not** live HTML serving mixed `tel:` forms. They are legacy/redirect routes (related to F-01/F-18 backlog), not an F-10 regression. Source markdown for those files was still normalized for consistency.

## Spot confirmation (post-deploy)

| URL | local | e164 |
|---|---:|---:|
| `/` | 0 | 8 |
| `/contact` | 0 | 5 |
| `/บริการ/รับซื้อโน๊ตบุ๊คเกมมิ่ง` | 0 | 8 |
| `/รับซื้อ/รับซื้อโน๊ตบุ๊ค-อุบลราชธานี` | 0 | 7 |

## Production SHA

```text
Production SHA: NOT VERIFIED
```

No Vercel token used. Deploy inferred from HTML behavior change (mixed → E.164-only on previously mixed pages).

## F-12

Still **OPEN / BLOCKED BY VERCEL DOMAIN CONFIGURATION** (unchanged).
