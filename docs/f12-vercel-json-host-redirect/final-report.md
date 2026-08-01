# Final report — F-12 Phase A (pre-manual gate)

## Verdict

**PASS — READY FOR PHASE A DEPLOYMENT** → Phase A **merged & apex healthy**; **STOP for manual domain switch**

## F-12 status

```text
OPEN — PHASE A DEPLOYED / WAITING FOR DOMAIN SWITCH
```

## SHAs

- Base: `ff6f453b0dc1a059d8c13fbf0fa365755d05315b`
- Phase A implementation: `8bf095f3951d726e53f608ad9640873a58f2da2d`
- Phase A merge: `84f083b57bb523310e763b986bc986d33cbb96e5`
- Production SHA: NOT VERIFIED
- Final 308 / Phase B: PENDING

## Counts

| Item | Value |
| --- | --- |
| Base SHA | `ff6f453b0dc1a059d8c13fbf0fa365755d05315b` |
| Existing path rules retained | 222 |
| Exact WWW rules | 222 |
| Catch-all | 1 |
| Total redirects | 445 |
| Phase A status | 307 |
| Baseline http://www legacy hops | 3 |
| Baseline https://www legacy hops | 2 |

## Scope

- No content/metadata/sitemap/canonical/schema/image changes
- No Pro / no CDN Project Redirects UI
- No new tokens

## Next

1. Merge + deploy Phase A
2. Verify apex still healthy
3. Owner: Domain switch www → Production
4. Reply: `DOMAIN SWITCH COMPLETE`
5. Only then Phase B validation + 308 finalize
