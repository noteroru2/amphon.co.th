# F-12 Final Code Cleanup Report

## Verdict

```text
PASS — SAFE ROLLBACK COMPLETE
```

## Status

| Item | Value |
| --- | --- |
| F-12 | **OPEN — VERCEL HOBBY PLATFORM LIMITATION / OWNER-ACCEPTED** |
| Domain | `www.amphon.co.th` → **301** → `amphon.co.th` (unchanged; no dashboard edits this cycle) |
| Failed Phase A runtime | **REMOVED** |
| Production | **READY** |
| Development cycle | **CLOSED** |
| Further F-12 remediation | **DEFERRED** (no Middleware proposed) |

## SHAs

| Role | SHA |
| --- | --- |
| Main tip before cleanup | `291e530f8e512899b72eedc26b4fe8b0c29da0c4` |
| Pre-Phase-A | `ff6f453b0dc1a059d8c13fbf0fa365755d05315b` |
| Phase A implementation | `8bf095f3951d726e53f608ad9640873a58f2da2d` |
| Phase A merge | `84f083b57bb523310e763b986bc986d33cbb96e5` |
| Post-rollback docs | `291e530f8e512899b72eedc26b4fe8b0c29da0c4` |
| Code rollback required | **YES** |
| Revert / cleanup commit | `2d1ec2470c764e44987ef31a538930e84cc42591` |
| Branch | `revert/f12-phase-a-runtime-changes` |
| PR URL | Not created (`gh` unavailable); compare: https://github.com/noteroru2/amphon.co.th/compare/main...revert/f12-phase-a-runtime-changes |
| Merge SHA | `b805a796026bcc17c7cad582339122a6afb362ea` |
| Report-only SHA | *(this docs commit)* |
| Production SHA | **NOT VERIFIED** (Hobby / no deployment API this cycle); smoke matches safe domain baseline after merge `b805a79` |

## Runtime before → after

| Metric | Before cleanup (main @ 291e530) | After |
| --- | ---: | ---: |
| `vercel.json` redirects | 445 | **222** |
| Host-aware rules (`has: host`) | 223 | **0** |
| Generic WWW catch-all `/(.*)` | 1 | **0** |
| Status 307 | 223 | **0** |
| Original path redirects retained | 222 | **222** (identical to `ff6f453`) |
| Original removed / modified | 0 / 0 | 0 / 0 |

### Files removed / restored

| File | Action |
| --- | --- |
| `vercel.json` | Restored to `ff6f453` |
| `scripts/generate-f12-www-redirects.mjs` | Deleted |
| `scripts/check-f12-vercel-host-redirect.mjs` | Deleted |
| `package.json` `qa:f12-vercel-host-redirect` | Removed |
| `scripts/check-batch-7-host-redirects.mjs` | Restored pre-Phase-A expectation |
| `scripts/lib/site-audit.mjs` | Restored pre-Phase-A `resolveRedirectChain` |
| `docs/f12-vercel-json-host-redirect/*` | **Retained** |

## Diff gates

| Check | Result |
| --- | --- |
| Sitemap count | **1166** simulated / QA; dist listing 1167 (index+urls; unchanged pattern) |
| Sitemap diff | **0** (no sitemap logic touched) |
| Route diff | **0** |
| Canonical / Noindex / Content / Metadata / Schema diff | **0** |
| Broken links | **0** |
| Redirecting internal links | **0** |
| Indexable orphan | **0** (utility orphans 2 baseline) |
| Astro check | **0 errors** (`npx astro check`; package has no `npm run check`) |
| Build | **exit 0** |
| Batch QA | **ALL PASS** (1–12G + redirect-chain + internal-404 + sitemap); Batch 7 **PASS WITH WARNING** (known 3-hop http://www legacy) |

## Production smoke

```text
PASS — production smoke OK
```

Evidence: `post-cleanup-production-smoke.csv`

| Case | Result |
| --- | --- |
| https://www /contact?query | 1×301 → apex, QP preserved, 200 |
| https://amphon.co.th/ | 0 redirects, 200 |
| https apex legacy hdd | 1×308 → ssd, 200 |
| http://www legacy hdd | 3 hops (known baseline), final apex 200 |
| https://www / | 1×301 → apex 200 |
| WWW HTTP 200 | **0** |
| sitemap-0.xml `<loc>` | **1166** |

## Known hop baseline (expected; F-12 remains open)

| Case | Expected |
| --- | --- |
| https://www → apex | 1 × 301 |
| http://www home | 2 hops (308 HTTPS + 301 apex) |
| http://www legacy | **3** hops (platform limit) |
| https apex legacy | 1 × 308 |
| WWW HTTP 200 | **0** |

## Remaining Findings

- **F-12** — multi-hop www chains under Vercel Hobby Domain Redirect; file-based `has: host` experiment failed and was rolled back
- **F-04** and other open audit items — unchanged; out of scope

## Recommended action

None for F-12 in this development cycle. Revisit only if owner opens a new F-12 remediation ticket.
