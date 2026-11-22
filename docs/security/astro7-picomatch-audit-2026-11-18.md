# Cloudflare Astro 7 Dependency Security Review — 18 November 2026

## Current decision — NO-GO for Production

**Do not merge/deploy this security candidate until the required GitHub Actions `cloudflare-candidate` security gate passes without ignore rules.** A passing Cloudflare/SEO content build is not equivalent to a passing security audit.

- Tracking issue: [#69](https://github.com/noteroru2/amphon.co.th/issues/69)
- Source PR: [#70](https://github.com/noteroru2/amphon.co.th/pull/70), stacked on Cloudflare SEO [#68](https://github.com/noteroru2/amphon.co.th/pull/68)
- Last known official `picomatch` npm release: **4.0.7**, which is in the affected version range `<=4.0.7`.
- Direct versions upgraded from the Astro7 release candidate: `astro 7.4.9 → 7.4.12`, `@astrojs/markdown-remark 7.3.6 → 7.3.9`. The new pinned Astro resolved `@astrojs/markdown-satteri 0.4.10` and `@astrojs/vite-plugin-astro 0.1.3`. Cloudflare `14.4.7` and Wrangler `4.125.0` remain pinned.
- Generated `package-lock.json` is from **real npm** under Node 22.23.4 in isolated [GitHub Actions #44283274667](https://github.com/noteroru2/amphon.co.th/actions/runs/44283274667), re-created/validated by CI and committed to this branch. It was NOT hand-generated from version guesses. `npm ci` completed.
- The temporary **write-permission** lock-regeneration Workflow was deleted after the regenerated artifact had been committed, so it will not ship in this PR. No Cloudflare secrets, Worker API calls or DNS writes took place.

## Why `npm audit --omit=dev` still reports HIGH 11

The latest audited dependency graph reports **11 package records with HIGH**, **0 CRITICAL**. All 11 are connected to one high advisory **GHSA-fc5q-39xc-vjpf / CVE-2026-112366**: ReDoS in the `picomatch` glob parser for attacker-supplied repeated extglob patterns. This is a potential availability problem if application code passes an attacker-controlled glob pattern to the vulnerable matcher.

| Root / children | What the audit establishes |
| --- | --- |
| `picomatch` 4.0.7 | Direct vulnerable package, advisory affects versions through 4.0.7, no verified official patched npm release as of 2026-11-18 |
| `fdir`, `tinyglobby`, `anymatch`, `unstorage` | Indirect flags because they depend on the vulnerable matcher |
| `vite` 8.3.8 | Indirect flag through `picomatch` / `tinyglobby`; no separate direct Vite advisory appeared in this audit |
| `astro`, `@astrojs/internal-helpers`, `@astrojs/markdown-remark`, `@astrojs/markdown-satteri`, `@astrojs/vite-plugin-astro` | Parent-package flags transitively through this chain |

**IMPORTANT:** npm's `fixAvailable` object misleadingly proposes **downgrading to Astro 5.3.0** (`isSemVerMajor=true`) to remove certain vulnerable dependency edges. This would break the Astro7 Cloudflare adapter peer compatibility and must not be applied with `npm audit fix --force`.

Upstream references:
- [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf)
- [picomatch issue #247 requesting fix guidance](https://github.com/micromatch/picomatch/issues/247)

## Practical controls while upstream patch is unavailable

1. Keep Production and Cloudflare security gate **blocked**. Do not use `--audit-level=critical`, ignore files, blanket overrides or a fake version `4.0.8`.
2. Continue exact-pin verification with `scripts/cloudflare-lock-verify.mjs`, SHA-scoped `npm ci` and clean-source guards.
3. Build Astro7 for the Cloudflare production adapter and perform Wrangler `--dry-run` plus redirect/sitemap/robots checks **without publishing**; this validates compatibility but does **not** clear the CVE.
4. During review, assess whether any publicly controlled request, route, query or API input is used as a *glob pattern* at runtime. Do not assert non-exposure solely because a source grep or bundle scan finds no literal package name.
5. When a verified fixed `picomatch` version is published, update the lockfile with real npm resolution, rerun `npm ci`, `npm audit --omit=dev` (high=0, critical=0), 21 Google Reviews tests, all 921 SEO routes, 260 redirects, Cloudflare worker dry-run, preview and rollback QA.
6. Obtain explicit Owner GO before final Worker Production deploy. This PR authorizes no merge, branch promotion, DNS or Production changes.

## Editorial and UX preservation

This security branch was forked from exact Cloudflare Content Candidate `5c50b628ffb532ae55ebaf8c904fd93b7feeaa62`: preserve 25 content edits, all 921 indexable service-area URLs and their 99 exclusions, and national pages with verified Ubon storefront details; no new provincial branch claims or unsupported buy-price tables.
