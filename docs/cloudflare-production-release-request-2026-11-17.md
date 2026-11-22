# AMPHON Cloudflare Production release request — 17 November 2026

This file records the user's explicit approval to deploy both previously tested changes, and intentionally triggers the connected Cloudflare Workers Builds GitHub production branch workflow.

- Production branch before trigger: `b438c52c3cd9ccc15b05b48f5d13221b81ed2d5f`
- Hours-only PR #58 source: `5d4bf2541e0ef1b06e2c1d33a7b4b36fafbbc465`
- Integrated PR #59 source: `8835065fca73934917bf816bf77d2376b3547efc`
- Integrated release: 180 SEO regional service-area pages, GSC-backed Notebook/PC metadata, storefront 09:00–19:00, aligned search and AI training robots.txt, Cloudflare Astro7 QA and release evidence
- Passing GitHub QA: https://github.com/noteroru2/amphon.co.th/actions/runs/44070942710
- Worker target: `amphon-co-th-production`; account `2382f4589cd2452e9e3b7b83c25d4fc0`
- Last verified active Worker version before this trigger: `e231e3ce-7016-49cb-9882-403c666debe4`
- Cloudflare Builds: connect confirmed on existing Worker; production branch is `release/cloudflare-production`; build and deployment use checked in guarded Node scripts
- Do not merge GitHub `main`, modify DNS or routes, or change another Worker as part of this release.
- This source commit is a **deployment request**, not proof of a completed deployment.

## Rollback / release gate

The Build script must pass `npm ci`, pinned lock checks, SEO validation, 1,189 sitemap URLs, 260 legacy redirect parity, 921 service-area storefront truth checks, Worker binding and secrets preservation. The Deploy script must verify live homepage, Google Reviews, LINE, robots and www 301 and attempt rollback if live smoke fails.

Record exact new deployed Worker Version UUID, deployment UTC timestamp, source SHA and postdeployment smoke evidence after the Cloudflare Build succeeds; until then keep the older Worker version and Vercel rollback available. Keep GSC monitoring at 7/14/28-day checks (25 Nov, 2 Dec, 16 Dec).
