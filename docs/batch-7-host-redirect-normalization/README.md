# README — Batch 7 Host Redirect Normalization

## Verdict

**BLOCKED: PENDING DOMAIN CONFIGURATION** — F-12 remains **OPEN**.

## What we learned

Production hop owners are Vercel platform + Domain redirect. A repo `vercel.json` www host rule does not run early enough to collapse `http://www`.

## Current production (acceptable vs not)

| Case | Hops | Close criteria |
| --- | --- | --- |
| Current `http://www` | 2 | OK with platform evidence |
| Legacy `http://www` | 3 | Not OK (need ≤2) |

## Files

See `final-report.md`, `production-validation-summary.md`, `host-variant-baseline.csv`, `redirect-hop-attribution.csv`.

## QA

```bash
npm run qa:batch-7-host-redirects
BATCH7_RUNTIME=1 BATCH7_ALLOW_BLOCKED=1 npm run qa:batch-7-host-redirects
```
