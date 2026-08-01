# Post-rollback validation — PASS

```text
PASS — SAFE DOMAIN REDIRECT RESTORED
```

Observed after owner `ROLLBACK COMPLETE` (2026-08-01):

| Case | Hops | First | Final | Result |
| --- | ---: | ---: | --- | --- |
| https://www.amphon.co.th/ | 1 | 301 | apex 200 | PASS |
| https://www.amphon.co.th/contact | 1 | 301 | apex 200 | PASS |
| http://www.amphon.co.th/ | 2 | 308 | apex 200 | PASS |
| https://www …/รับซื้อ-hdd | 2 | 301 | apex …/ssd 200 | PASS |
| http://www …/รับซื้อ-hdd | 3 | 308 | apex …/ssd 200 | PASS |
| https://www /contact?query | 1 | 301 | apex + QP | PASS |
| https://amphon.co.th/ | 0 | 200 | apex 200 | PASS |
| https://amphon.co.th …/hdd | 1 | 308 | apex …/ssd 200 | PASS |

WWW 200 = **0**. Matches pre-cutover baseline (including known 3-hop http://www legacy).

Evidence CSV: `post-rollback-validation.csv`

## Status

```text
F-12: OPEN — ROLLED BACK TO SAFE DOMAIN REDIRECT
Production: READY WITH KNOWN OPEN FINDING
```

Phase B (`has: host` in `vercel.json`) remains **not viable** on this Hobby cutover path. Do not re-attempt domain switch without a new remediation plan (e.g. Middleware).
