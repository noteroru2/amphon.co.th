# `picomatch` Cloudflare Worker Runtime Exposure — 18 November 2026

## Question being tested
Whether the already-flagged `picomatch@4.0.7` ReDoS parser is actually included in the emitted **Astro 7 Cloudflare Worker Runtime** (not just installed as a build tool). The npm graph's 11 HIGH package flags all relate to `GHSA-fc5q-39xc-vjpf`; they are not evidence that the same vulnerable code executes inside the Worker.

## Changes in this PR
- Add immutable, SHA-specific static binary/script-signature QA covering **both** `dist/server` and **Wrangler --dry-run emitted output**, after a real Cloudflare Build.
- Reject unexpected missing/empty artifacts, scan for `picomatch`, `analyzeRepeatedExtglob`, `POSIX_REGEX_SOURCE`, `tinyglobby`, `anymatch`, and first-party direct imports.
- Produce file hashes and report `artifacts/security/picomatch-runtime-exposure.json`; add negative-regression tests.
- Keep existing mandatory `npm audit --omit=dev` **untouched**: it must still fail if advisory HIGH remains. A passed scan is evidence of reduced runtime attack surface **not a waiver, dependency fix, or release approval**.
- No changes to `package*.json`, source content, redirects, site map, DNS, Wrangler bindings, Cloudflare Worker production, or GitHub secrets.

## Interpretation
Even a PASS cannot prove absolute absence of all vulnerable logic because bundlers can inline/rename functions, and source-level dynamic imports may be difficult to detect. The released Worker must be reviewed separately. Failures block further QA. Static signature absence, **plus** verified no first-party runtime inputs being treated as glob expressions, supports a narrower, documented risk analysis only; it does **not** turn npm audit to zero.

## Decision / release gate
Do **not** merge or deploy based on this test alone. The parent security PR #70 and Issue #69 remain pending the official patched `picomatch` or an explicitly reviewed, validated safe remediation and separate release permission.
