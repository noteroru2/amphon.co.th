# Emergency — Remove GA4 Consent UI / Stop R9 Production Release

**Date:** 2026-08-08  
**Branch:** `hotfix/remove-ga4-consent-ui`  
**R9 status:** `R9_GA4_ROLLOUT = PAUSED_BY_OWNER`

## Verdict (expected)

- `GA4_PRODUCTION_DISABLED`
- `CONSENT_UI_REMOVED_OR_NOT_PRESENT`
- `SEO_CONTENT_UNCHANGED`

## Production before hotfix

Live `https://amphon.co.th` **DID** show consent UI (not Preview-only).

| Check | Before |
|------|--------|
| Consent banner / “ยอมรับการวิเคราะห์” | **PRESENT** |
| `__AMPHON_ANALYTICS_BOOT__` | PRESENT |
| Measurement ID in HTML (masked) | `G-V2…D9X` |
| Footer “ตั้งค่าคุกกี้” | PRESENT |
| Inline gtag.js before consent | absent (loads only after grant) |
| `origin/main` | `fbfb5ce` (R9B.2 merged + docs) |

**Correction to earlier assumption in the emergency brief:** R9B.2 **was merged and deployed**. This was a Production regression requiring hotfix — not Preview-only.

## Hotfix scope

| Change | Purpose |
|--------|---------|
| Remove `<AnalyticsConsent />` + `<Analytics />` from `BaseLayout` | No popup / no GA boot |
| Remove html `data-page-type` analytics dataset wiring | No GA taxonomy surface |
| Remove Footer “ตั้งค่าคุกกี้” | Analytics-only control |
| Empty `Analytics.astro` / `AnalyticsConsent.astro` | Safety no-op if re-imported |
| `initAnalytics` hard return | No gtag / no CTA GA events |
| Privacy §8 factual wording | Matches “GA not loaded” |
| `.env.example` pause note | Operator guidance |

**Preserved:** CTA `href` (LINE / phone / maps), routes, canonicals, SEO money-page content, schema, sitemap, robots.

**Not merged:** `measurement/gsc-r9b-ga4-cta-mvp` remains experimental/paused (already on main via R9B.2 merge history; further R9 work stays paused).

## Production after hotfix

_(filled after deploy)_

## Tests

_(filled after QA)_

## Vercel

`PUBLIC_GA_MEASUREMENT_ID` Production: remove or leave unused (ID never printed). Preview may keep for paused R&D with no Production effect once hotfix ships.

## Confirmations

- CONSENT_UI removed from Production path
- GA4 Production disabled (no loader)
- SEO content unchanged (privacy factual only)
- R9_GA4_ROLLOUT = PAUSED_BY_OWNER
