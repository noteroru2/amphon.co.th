# GSC 404 + Thai URL Mojibake Audit

```text
AUDIT-ONLY — REPORT BEFORE FIX
Branch: audit/gsc-404-thai-url-mojibake
Verdict: PASS WITH WARNING
Finding: NF-GSC-404-THAI-URLS — OPEN — AUDIT COMPLETE / FIX APPROVAL PENDING
```

## Quick verdict

| Metric | Value |
| --- | --- |
| URLs audited | **20/20** |
| Production initial | **20 × 308** |
| Final (curl UTF-8 Location) | **20 × 200** |
| Raw UTF-8 `Location` (non-ASCII) | **18/20** |
| HTML body mojibake | **0** |
| Double-encoded chain (curl) | **0** |
| In production sitemap | **0/20** |
| Unicode vs encoded mismatch | **0** |

**Root cause (confirmed):** `vercel.json` Thai destinations are Unicode. Vercel emits `Location` with **raw UTF-8 bytes** (not percent-encoded). UTF-8-aware clients (curl, typical browsers) reach the correct 200 target. Strict/latin1 clients (Node `fetch`/undici; consistent with GSC 404 + “ภาษาเพี้ยน”) mis-decode → mojibake path → **404**.

Blog URLs (#15–16) redirect to ASCII `/blog` — Location is fine; owner decision on intent remains.

## Docs

| File | Purpose |
| --- | --- |
| `final-report.md` | Owner summary |
| `mojibake-root-cause.md` | Evidence-based RCA |
| `url-decision-matrix.csv` | Per-URL classification |
| `proposed-fix-plan.csv` | Fix batches A–F |
| `production-http-audit.csv` | HTTP matrix |
| `node-fetch-location-evidence.json` | Mojibake Location demo |

## Commands

```bash
npm run audit:gsc-404-thai-urls
```

## Constraints

No production code change, merge, or deploy in this audit.
