# GSC-R9B GA4 + CTA Measurement MVP

**Date:** 2026-08-08  
**Mode:** IMPLEMENTATION — BRANCH ONLY  
**Site:** https://amphon.co.th  

## Final Verdict

**R9B_CODE_READY_WITH_CONFIGURATION_GAPS**

Code ships consent-aware GA4 loader + `cta_click` / `contact_intent` measurement.  
Production measurement remains incomplete until owner configures a real GA4 Measurement ID and validates DebugView.

---

## Git

| Item | Value |
|------|-------|
| Branch | `measurement/gsc-r9b-ga4-cta-mvp` |
| Base SHA | `2a06cd621a1697482867621d87114a188d7a3834` (`origin/main`) |
| Worktree | `../amphon-r9b-measurement` |
| Merge | **NOT MERGED** |
| Deploy | **NOT DEPLOYED** |

---

## Base SHA

Matches R9A audit base / current `origin/main` at implementation time:

`2a06cd621a1697482867621d87114a188d7a3834`

---

## Architecture

```
BaseLayout
  → html data-page-type / data-service-category / data-province [/ data-lead-type]
  → AnalyticsConsent (banner)
  → Analytics (boot + client)
       → consent gate (localStorage)
       → load gtag only if granted + PUBLIC_GA_MEASUREMENT_ID valid
       → delegated document click listener
Shared CTA components + layouts: data-track-cta enums
Markdown LINE/tel: classified by href via same listener (no Markdown edits)
```

**Deferred:** National→Local tracking, Blog→Service tracking, generate_lead, CRM/offline stages.

---

## GA4 Loader

- Integrated once via `src/components/Analytics.astro` in `BaseLayout`
- Uses gtag.js (`googletagmanager.com/gtag/js`) — **no GTM**
- `dataLayer` / `gtag` initialized once
- **No manual `page_view` event** (MPA default config pageview only after consent+ID)
- Missing ID or denied consent → **no Google script load** (safe no-op)

---

## Measurement ID Configuration

| Item | Status |
|------|--------|
| Env name | `PUBLIC_GA_MEASUREMENT_ID` |
| `.env.example` | documented (empty) |
| Hardcoded fake `G-XXXXXXXX` | **none** |
| Repo real ID | **MISSING_CONFIGURATION** |

**GA4_MEASUREMENT_ID_STATUS:** `MISSING_CONFIGURATION`

Optional debug: `PUBLIC_GA_DEBUG=true`

---

## Consent Gate

| Item | Behavior |
|------|----------|
| Status before choice | Banner shown; GA not loaded |
| Accept | `analytics_consent=granted` in `localStorage` key `amphon_analytics_consent` → load GA4 |
| Deny | `denied` → no GA4 |
| Revisit | Footer link **ตั้งค่าคุกกี้** (`data-consent-revisit`) clears choice and reopens banner |
| Dark patterns | Reject visible; not preselected |

**Consent classification after R9B:** first-party basic gate implemented (not a PDPA legal certification).

**PRIVACY_COPY_FOLLOW_UP_REQUIRED:** existing `/privacy-policy` does not yet describe analytics cookies / GA4 — recommend factual follow-up copy in a later batch.

---

## Pageview

| Check | Verdict |
|-------|---------|
| Navigation | MPA (no View Transitions) |
| Manual page_view | Not added |
| After consent+ID | One gtag `config` per full page load |
| DOUBLE_PAGEVIEW | Low for custom code; Enhanced Measurement outbound clicks remain **PROPERTY_SETTING_UNKNOWN** until property exists |

**Pageview verdict with config:** `CORRECT_PAGEVIEW` (design)  
**Today without ID:** still no network pageviews (`MISSING_CONFIGURATION`)

---

## Event Utility

| Module | Role |
|--------|------|
| `src/lib/analytics.ts` | CTA classify, sanitize, allowed events, consent key |
| `src/lib/analytics-context.ts` | page taxonomy from pathname |
| `src/scripts/analytics-client.ts` | browser init, gtag load, delegated clicks |
| API | `trackEvent`, `trackCtaClick`, `trackContactIntent` (client) |

Events allowed: **`cta_click`**, **`contact_intent`** only.

---

## CTA Tracking

Semantics:

| CTA | Events |
|-----|--------|
| LINE | `cta_click` + `contact_intent` |
| Phone | `cta_click` + `contact_intent` |
| Maps | `cta_click` only |
| Facebook page | `cta_click` only |
| Email | `cta_click` only |
| Internal nav | none |

Never `preventDefault`; never delay navigation; fail silently.

---

## Delegated Markdown Coverage

One `document` capture listener classifies:

- `line.me` / `lin.ee` → line
- `tel:` → phone
- Maps hosts → maps
- Facebook → facebook
- `mailto:` → email

Position fallback: sticky / header / footer / contact_section / hero / inline_middle / card / other.

**No Markdown body edits.**

---

## Page Taxonomy

Controlled `page_type` values implemented (lowercase snake_case).

Representative tests: home, phone, iphone, tablet, ipad, notebook, macbook, computer, gaming_pc, ram, corporate parent, bulk, server-network, Phuket, Hatyai→`สงขลา`, Notebook Khon Kaen — **PASS**.

---

## Service Taxonomy

Controlled enums including `phone`, `iphone`, `tablet`, `ipad`, `notebook`, `macbook`, `computer`, `gaming_pc`, `ram`, `corporate_it`, `bulk_computer`, `server_network`, etc.

---

## Geo Taxonomy

- National pages: `province=national`
- Area hubs: province from slug
- Hatyai city hub: **`province=สงขลา`** (never `หาดใหญ่`)
- Local pages: province from slug suffix
- No visitor GPS

---

## Lead Type

Optional when reliable: `consumer` | `corporate` | `bulk` | `infrastructure`  
Omitted when ambiguous.

---

## Event Dictionary

| Event | Trigger | Stage | Conversion |
|-------|---------|-------|------------|
| cta_click | Contact/outbound CTA click | Website interaction | MICRO_INTERACTION — not Key Event |
| contact_intent | LINE / phone / messenger | Contact intent | MICRO_CONVERSION — not Key Event |
| generate_lead | — | — | **not implemented (0)** |

---

## Parameter Dictionary

| Parameter | Notes |
|-----------|-------|
| page_type | enum |
| service_category | enum |
| province | controlled / national |
| cta_type | enum |
| cta_position | enum |
| destination | normalized enum (never full URL / tel digits) |
| contact_method | line / phone / messenger / form |
| lead_type | optional |

No custom `page_path`. PII keys blocked in sanitizer.

---

## LINE / Phone / Maps / Facebook / Copy LINE ID

- LINE / Phone: dual events as specified  
- Maps / Facebook: `cta_click` only  
- Copy LINE ID: no dedicated UI control found; classifier supports `copy_line_id` if added later  

---

## No Generate Lead Verification

Source scan: no `generate_lead` / `deal_agreed` / `closed_sale` / `lead_details_completed` implementation.  
Allow-list rejects `generate_lead`.

---

## PII Guardrail

Sanitizer strips blocked keys, `tel:`/`mailto:`/http(s) values, query strings, long free text.  
**Querystring PII risk:** LOW (no lead forms).  
Business OA / business phone remain in `href` (unchanged) but are **not** sent as event parameters.

---

## Shared Components

Instrumented with `data-track-cta` + enums:

StickyCTA, Header, Footer, CTAContact, InlineServiceCTA, Service/Area/ServiceArea layout CTAs, home/contact Astro CTAs.

Visible labels/hrefs unchanged.

---

## Performance

- Added client analytics bundle ≈ **6.8 KB** (`Analytics.astro` script asset)
- No per-CTA SDK
- GA remote script loads only after consent + valid ID

---

## Accessibility

- Consent dialog: buttons, focus-visible, privacy link  
- CTA `href` behavior preserved  
- Tracking does not replace anchors  

---

## Frozen SEO Verification

| Check | Result |
|-------|--------|
| Markdown content bodies | **unchanged** |
| SEO title/description/H1/FAQ/canonical | **unchanged** |
| Tracking path | layout/components/scripts only |

---

## Route / Sitemap Regression

| Check | Result |
|-------|--------|
| Sitemap loc count (build) | **1166** (+ index file) |
| Redirects / noindex / canonical changes | **none** in diff |
| Route inventory | unchanged (measurement-only) |

---

## Tests

| Command | Result |
|---------|--------|
| `npm run test` | **NOT_CONFIGURED** |
| `npm run test:google-reviews` | **21/21 PASS** |
| `npm run test:analytics` | **PASS** (22 node tests + taxonomy script) |
| `npx astro check` | **0 errors** |
| `npm run build` | **PASS** |

---

## Analytics Tests

Cover taxonomy cases from R9B spec, CTA classification, PII sanitize, forbidden events.

---

## Build

PASS on clean worktree after `npm ci`.

HTML sample checks: consent present; `data-page-type` correct; no fake Measurement ID; LINE hrefs intact; GA script tags absent until consent+ID (expected).

---

## Security

| Check | Result |
|-------|--------|
| New OAuth / service account / API secrets | **0** |
| GSC CSV / credentials committed | **0** |
| Real GA ID committed | **0** |

---

## GA4 Admin Configuration Required

Owner steps (outside repo):

1. Create/use GA4 property  
2. Web data stream for `amphon.co.th`  
3. Obtain Measurement ID (`G-…`)  
4. Set Vercel/env `PUBLIC_GA_MEASUREMENT_ID`  
5. Register event-scoped custom dimensions actually sent: `page_type`, `service_category`, `province`, `cta_type`, `cta_position`, `destination`, `contact_method`, `lead_type`  
6. Validate consent grant/deny  
7. DebugView: config pageview, `cta_click`, `contact_intent`  
8. **Do not** create `generate_lead` yet  
9. Do **not** mark `cta_click` / `contact_intent` as primary Key Events  
10. Review Enhanced Measurement outbound clicks vs custom CTA events  

---

## DebugView Status

**DEBUGVIEW = OWNER_CONFIGURATION_PENDING**

Local validation via tests + sanitized debug logging when `PUBLIC_GA_DEBUG=true`.

---

## Files Included

- `src/lib/analytics.ts`
- `src/lib/analytics-context.ts`
- `src/lib/analytics-context.test.ts`
- `src/scripts/analytics-client.ts`
- `src/components/Analytics.astro`
- `src/components/AnalyticsConsent.astro`
- `src/env.d.ts`
- `scripts/test-analytics-taxonomy.mjs`
- Shared CTA / layout / BaseLayout / Footer / Header / index / contact instrumentation
- `.env.example`, `package.json`
- This report

## Files Excluded

- `docs/gsc-r9-local/`
- Real Measurement ID / secrets
- Markdown SEO content
- CRM / lead backend

---

## Recommended R9C / Release Step

1. Owner configures GA4 + env  
2. Optional R9B.1: privacy-policy analytics disclosure + staging DebugView  
3. Release branch merge/deploy when validated  
4. **R9C separately:** lead backend, opaque `lead_id`, confirmed lead → deal → sale  

---

## Confirmations

- NOT MERGED  
- NOT DEPLOYED  
- NO GENERATE_LEAD  
- NO CRM  
- NO SEO CONTENT REWRITE  
- NO MASS MARKDOWN EDITS  
- NO GSC/OAUTH/CSV COMMITTED  
