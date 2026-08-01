# Post-switch validation — FAILURE

```text
FAIL — DOMAIN CUTOVER REGRESSION
```

Observed 2026-08-01 (after DOMAIN SWITCH COMPLETE):

| Case | Result |
| --- | --- |
| https://www.amphon.co.th/ | **200 on www** (expected 1×307→apex) |
| https://www.amphon.co.th/contact | **200 on www** |
| https://www legacy hdd | 308 stays on **www**/…/ssd (host exact rule did not fire) |
| http://www … | ends on **www** 200 |
| https://amphon.co.th/ | 200 OK (apex healthy) |

## Root cause (evidence)

1. Host-conditioned rules in `vercel.json` (`has: host=www`) did **not** redirect.
2. Unconditional path redirects **did** run on www, but destinations are relative → final host remains www.
3. Static current pages on www return **HTTP 200** → WWW 200 ≠ 0 (duplicate-host risk).

This matches known Vercel edge behavior reports where `has` host conditions may not apply as expected, and/or filesystem routes take precedence over host redirects for existing pages.

## Required action

```text
ROLLBACK REQUIRED

Vercel → Settings → Domains → www.amphon.co.th
ตั้งกลับเป็น: 301 Redirect → amphon.co.th
```

- Do **not** change 307→308
- Do **not** close F-12
- Apex remains production-ready after domain rollback

## F-12 status after rollback

```text
OPEN — ROLLED BACK TO SAFE DOMAIN REDIRECT
Production: READY WITH KNOWN OPEN FINDING
```

Owner confirmed `ROLLBACK COMPLETE`. Re-smoke: **PASS** — see `post-rollback-validation.md`.
