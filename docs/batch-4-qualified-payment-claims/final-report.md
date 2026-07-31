# Final report — Batch 4

## Verdict

**PASS WITH WARNING**

Warning: Production SHA `NOT VERIFIED`. All target claim checks and technical regressions passed.

## Finding

| Finding | Status |
| --- | --- |
| F-05 unqualified payment claims | **CLOSED** |

## Identity

| Item | Value |
| --- | --- |
| Branch | `fix/batch-4-qualified-payment-claims` |
| Base SHA | `fe4b9e420ccc97ec99168d603c096242268332cb` |
| Implementation SHA | `822171f01a8cef87d8ccae04c665740777220a7a` |
| Merge SHA | `7cd56e4ed186413a476a4b5a83b0c47f1cc2b3da` |
| Production SHA | `NOT VERIFIED` |
| Report-only SHA | `3493e59e2525b9f075c9d3fcd33549221c7e0d44` (tip `65a17f4`) |
| Deployment URL | https://amphon.co.th |

## Change summary

| Metric | Count |
| --- | --- |
| Audit URLs | 8 |
| Confirmed URLs | 8 |
| H1 changed | 5 |
| Title changed | 0 |
| Description changed | 0 |
| CTA/body changed | 3 |
| FAQ changed | 0 |
| JSON-LD direct edits | 0 |
| Additional instances found | deferred (other service pages + seed/OG scripts) |
| Unqualified claims remaining on targets | 0 |

## Intent / keywords

Preserved. No route/sitemap/canonical/redirect edits.

## QA / build

Astro check 0/0 · Batch 1–4 PASS · Build exit 0 · HTML 1188 · Sitemap 1185

## Files changed (implementation)

- 5 notebook service markdown H1s
- 3 blog markdown body/CTA lines
- `scripts/check-batch-4-qualified-payment-claims.mjs`
- `package.json` qa script
- `docs/batch-4-qualified-payment-claims/*`
