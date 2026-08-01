# QA results — Phase A (pre-domain-switch)

| Command | Result |
| --- | --- |
| astro check | 0 errors / 0 warnings |
| npm run build | exit 0 |
| qa:f12-vercel-host-redirect | PASS (config Phase A) |
| qa:batch-1-redirects | PASS |
| qa:batch-2-sitemap | PASS |
| qa:batch-3-build | PASS |
| qa:batch-4-claims | PASS |
| qa:batch-5-images | PASS |
| qa:batch-6-schema-geo | PASS |
| qa:batch-7-host-redirects | PASS WITH WARNING (http www legacy hops 3 — expected until Domain→Production) |
| qa:batch-8-image-dimensions | PASS |
| qa:batch-9-f10 | PASS |
| qa:batch-10-metadata | PASS |
| qa:batch-11-internal-links | PASS |
| qa:batch-12b-collectibles | PASS |
| qa:batch-12c-collectibles | PASS |
| qa:batch-12d-thin-content | PASS |
| qa:batch-12e-improve | PASS |
| qa:batch-12f-owner-decisions | PASS |
| qa:batch-12g-1-appliances | PASS |
| npx vercel build | NOT VERIFIED (needs `vercel pull`; platform uses vercel.json at deploy) |

## Integrity

- Sitemap: 1,166
- Routes: 1,169
- Broken links: 0
- Redirecting internal links: 0
- Indexable orphans: 0
