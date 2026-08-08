# Emergency — Remove GA4 Consent UI / Stop R9 Production Release

**Date:** 2026-08-08  
**Branch:** `hotfix/remove-ga4-consent-ui`  
**Hotfix SHA:** `552e1042cf766bc9135794aa0862a1f4c9eac194`  
**R9 status:** `R9_GA4_ROLLOUT = PAUSED_BY_OWNER`

## Final Verdict

- `GA4_PRODUCTION_DISABLED`
- `CONSENT_UI_REMOVED_OR_NOT_PRESENT`
- `SEO_CONTENT_UNCHANGED`

Was popup Preview-only? **No — it was on Production** (R9B.2 had already merged/deployed).

---

## Production before hotfix

Live `https://amphon.co.th` **DID** show consent UI.

| Check | Before |
|------|--------|
| Consent banner / “ยอมรับการวิเคราะห์” | **PRESENT** |
| `__AMPHON_ANALYTICS_BOOT__` | PRESENT |
| Measurement ID in HTML (masked) | `G-V2…D9X` |
| Footer “ตั้งค่าคุกกี้” | PRESENT |
| Inline gtag.js before consent | absent (would load after grant) |
| `origin/main` | `fbfb5ce` (R9B.2 merged + docs) |

---

## Hotfix scope

| Change | Purpose |
|--------|---------|
| Remove `<AnalyticsConsent />` + `<Analytics />` from `BaseLayout` | No popup / no GA boot |
| Remove html analytics dataset wiring | No GA taxonomy surface |
| Remove Footer “ตั้งค่าคุกกี้” | Analytics-only control |
| Empty `Analytics.astro` / `AnalyticsConsent.astro` | Safety no-op if re-imported |
| `initAnalytics` hard return | No gtag / no CTA GA events |
| Privacy §8 factual wording | Matches “GA not loaded” |
| `.env.example` pause note | Operator guidance |

**Preserved:** CTA `href` (LINE / phone / maps), routes, canonicals, SEO money-page content, schema, sitemap, robots.

**SEO files changed:** none under `content/services|serviceAreas|areas|blog`. Only `privacy-policy.astro` factual §8.

**Routes / indexability:** unchanged.

**Feature branch:** `measurement/gsc-r9b-ga4-cta-mvp` — no further merge; `R9_GA4_ROLLOUT = PAUSED_BY_OWNER`.

---

## Production after hotfix

| Check | After |
|------|--------|
| Consent banner | **ABSENT** |
| `__AMPHON_ANALYTICS_BOOT__` | ABSENT |
| Measurement ID in HTML | NONE |
| gtag.js | ABSENT |
| Footer “ตั้งค่าคุกกี้” | ABSENT |
| CTA LINE / phone / maps hrefs | PRESENT |
| Privacy claims active consent/GA | ABSENT |
| Privacy says GA not loaded | PRESENT |
| Deploy | `dpl_3Br1FQGHVwXN64juvAgnZQjbJWGN` Ready → `amphon.co.th` |
| `origin/main` tip (hotfix) | `552e104` |

---

## Tests

| Check | Result |
|------|--------|
| `npm run test:google-reviews` | 21/21 PASS |
| `astro check` (local binary) | 0 errors / 0 warnings |
| `npm run build` | PASS |
| Build HTML consent/gtag | 0 |
| Build HTML LINE/tel/maps | present |

---

## Vercel

| Env | Status |
|-----|--------|
| `PUBLIC_GA_MEASUREMENT_ID` **Production** | **REMOVED** |
| `PUBLIC_GA_MEASUREMENT_ID` Preview | Kept (paused R&D; does not affect `amphon.co.th` after hotfix) |

Measurement ID never printed in full in this report.

---

## Confirmations

- Production consent UI **before:** PRESENT  
- Production consent UI **after:** REMOVED  
- Popup was **Production** (not Preview-only)  
- GA4 Production: **DISABLED**  
- Analytics network loader on live HTML: **0**  
- LINE / phone / maps CTAs: **functional hrefs preserved**  
- SEO content / routes / indexability: **unchanged**  
- `R9_GA4_ROLLOUT = PAUSED_BY_OWNER`
