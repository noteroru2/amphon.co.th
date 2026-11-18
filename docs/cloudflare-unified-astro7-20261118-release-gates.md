# Cloudflare Astro7 — Unified Release Candidate (NO DEPLOY) • 18 Nov 2026

## One candidate source of truth
**Branch:** `release/cloudflare-unified-astro7-20261118` is cut from the SHA `43f2e62a742f82673766266b6ca4e2a8e299c7e7` of [Security PR #70](https://github.com/noteroru2/amphon.co.th/pull/70), which is a descendant of the head of [Editorial PR #68](https://github.com/noteroru2/amphon.co.th/pull/68), itself a descendant of [Issue #50 PR #59](https://github.com/noteroru2/amphon.co.th/pull/59). Thus the 180 SEO remediation pages, 25 editorial changes, and all tested Astro7/Cloudflare Security remediation are **already included by ancestry**. DO NOT cherry-pick those commits again.

**Target:** open a single Draft PR against `main` for conflict and QA review; **no merge or deployment**. The last known `main` commit is `f3f91b804432c9b56542db38d70547f657cd54de` (one unique commit versus the candidate ancestry), so maintain a strict diff/mergeability check.

## Deployment baseline (Vercel connector, 2026-11-18)
- Last Vercel `production` READY: deployment `dpl_DmtdiCXTsy6zBMKNVEehFyMoUBwr`, source SHA `1d235196f45e29af4c425fa4505111596db8e4c6`.
- GitHub `main` SHA `f3f91b804432c9b56542db38d70547f657cd54de` has **not** been confirmed live; do not claim it was deployed.
- Project `amphon-co-th` registers `amphon.co.th` and `www.amphon.co.th`; www has a configured `301` redirect to apex. The final **Cloudflare edge** rule must be confirmed separately.
- Public DNS snapshots / live HTTP are independent of Vercel and GitHub. `scripts/cloudflare-rc-dns-audit.mjs` is read-only, and `scripts/verify-cloudflare-production-release.mjs` requires a real deployment version + Cloudflare API token **only after owner-approved release**.

## Go / no-go checklist
- [ ] Single PR to `main`, no conflicts, reviewed exact final commit SHA (never an old preview).
- [ ] Strict `npm audit --omit=dev`: **0 High / 0 Critical**; no ignore/waiver.
- [ ] **FULL** `npm audit` includes build tools and still has **24 High / 2 Moderate** (known latest evidence on the pre-release ancestor). Separate independently remediable `fast-uri`, `sharp`, `undici`, `path-to-regexp` from `picomatch`; do not claim the full graph is clean.
- [ ] Local parser mitigation and adversarial tests installed on `npm ci`, plus emitted-Worker source scan.
- [ ] Astro7 Cloudflare production-config Build and Wrangler dry-run **with no Worker deployment**.
- [ ] Content preserved: 921 indexable service areas, 99 known exclusions, source URL inventory, 260 exact redirects + 1 dynamic rule, canonical, sitemap, robots, 404, LINE CTA, parent Notebook/PC/MacBook and B2B pages, no unsupported province branches/prices.
- [ ] Local Worker Google Reviews endpoint tests 21/21; **live Cloudflare API with production secrets** can only be tested after authorized deployment, and must not expose API keys.
- [ ] Actual TLS / public DNS apex/www / query-preserving 301 / redirects + variations, staging noindex only on staging, no production noindex, API 503 fallback when secrets missing.
- [ ] Live monitoring and Owner-approved rollback: preserve Vercel READY `dpl_DmtdiCXTsy6zBMKNVEehFyMoUBwr`; snapshot DNS/custom-domain/rulesets/worker bindings, record exact release Worker version ID, 5xx, SEO and GSC checks.
- [ ] Schedule GSC dataState=FINAL baselines and 7/14/28-day **post-live** cohorts based on actual release date, not branch merge date. Distinguish a simultaneous SEO content release from host migration; ranking attribution is confounded.

## Safety and release decision
This unified candidate deliberately contains both infrastructure migration and editorial changes: this increases attribution and regression risk compared with the earlier infra-only plan in Issue #54. User specifically requested combined candidate testing, NOT a cutover. Keep full baseline and previous Vercel artifacts available for rollback. Do not deploy, merge main, change DNS, modify secrets or billing without a separate final Production GO on the exact SHA.

## Main ancestry conflict reconciliation (2026-11-18)
The last `main` commit `f3f91b804432c9b56542db38d70547f657cd54de` changed **186 paths** compared with the previous live Vercel SHA `1d235196f45e29af4c425fa4505111596db8e4c6`. Comparing exact Git tree-object blob SHAs to the unified candidate:
- **181/186 files are byte-identical**, including the overwhelming majority of the 180 Issue #50 service-area pages.
- Four Markdown pages intentionally differ from `main`: `รับซื้อทีวี-ขอนแก่น.md`, `รับซื้อเฟอร์นิเจอร์-นครราชสีมา.md`, `รับซื้อโดรน-มหาสารคาม.md`, `รับเหมาประมูลอุปกรณ์ไอที-ขอนแก่น.md`. Candidate versions have later dated (18 Nov) issue-specific editorial detail, qualified no-provincial-office/service promises and no claimed transaction proof. Preserve reviewed candidate versions, not the older 11-Nov main versions.
- `.github/workflows/seo-evidence-audit.yml` is deliberately newer in the candidate: keeps 921-URL truth QA and adds specific parent-service and 60-CTA checks. Preserve newer QA.
This decision does **not** remove any unrelated newer `main` changes: all 186 changed paths have been inventoried; 181 exactly preserved and the five reviewed later versions retained. A true two-parent Git merge commit records both `main` and candidate ancestry while retaining the validated candidate tree. The integration is **not a Production merge**.
