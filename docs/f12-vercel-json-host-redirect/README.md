# F-12 — File-based host redirects (Vercel Hobby)

Phase A prepares `vercel.json` host-aware WWW redirects (307).  
Host rules become effective only after the owner switches `www.amphon.co.th` from Domain Redirect 301 → Production.

```text
Source of Truth: vercel.json
Exact WWW legacy rules: 222
Generic WWW catch-all: 1
Existing path rules retained: 222
Total redirects after Phase A: 445
Phase A status: 307
```

## Status

- Phase A code: IN PROGRESS → see `final-report.md` / handoff
- Manual domain switch: REQUIRED before Phase B
- F-12: OPEN until post-switch validation + 308 finalize
