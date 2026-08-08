# GSC-R9B.1 GA4 Preview Validation

**Date:** 2026-08-08  
**Mode:** PREVIEW VALIDATION (resume after owner configuration)  
**Source branch:** `measurement/gsc-r9b-ga4-cta-mvp`  
**Branch tip validated:** `9fca1e671bf6c47d1991b813409a07a91d7fb5ce` (+ Preview redeploy with env)

## Final Verdict

**R9B1_READY_FOR_PRODUCTION**

Owner configured `PUBLIC_GA_MEASUREMENT_ID` on Vercel Preview. Preview HTML boots a real Measurement ID (`G-V2…D9X`). Consent gate, gtag single load, CTA/`contact_intent` semantics, Markdown delegated tracking, taxonomy (incl. Hatyai → `สงขลา`), and PII-free payloads were verified via Playwright against a local static serve built with that same Preview Measurement ID.

**Note:** Vercel Deployment Protection (login wall) blocks unauthenticated browser automation against the Preview URL. Preview Measurement ID presence was confirmed with `vercel curl`. Runtime GA behavior was validated using the identical ID from that Preview HTML. GA Admin DebugView UI was not accessible from this agent — events were confirmed through live `gtag`/`dataLayer` against the real stream (owner should glance Realtime/DebugView once).

---

## Source SHA

| Item | Value |
|------|-------|
| R9B.1 docs tip (pre-resume) | `9fca1e671bf6c47d1991b813409a07a91d7fb5ce` |
| R9B implementation | `1c83ff2b47055993de4eaf575bd0335fadd83a64` |
| Main merge | **NO** |
| Production deploy | **NO** |

---

## GA4 stream status

| Check | Result |
|-------|--------|
| Vercel env `PUBLIC_GA_MEASUREMENT_ID` | Present — **Preview only** (Sensitive) |
| Production env Measurement ID | Not required for R9B.1 (still absent) |
| Preview HTML boot | `const measurementId = "G-V2…D9X"` present |
| Hardcoded fake ID in repo | none |

**GA4_STREAM_CONFIGURED**

---

## Preview deployment

| Item | Value |
|------|-------|
| Deployment ID | `dpl_4SsBNCyYnt35cRfsZ2yRuGL6WnVs` |
| Preview URL | https://amphon-co-74l696r41-amphons-projects-bb1ec3bf.vercel.app |
| Status | Ready |
| Protection | Vercel login wall for anonymous browsers |
| Earlier R9B git alias deploy (pre-env) | `dpl_5Mna92QuS2g8iKxJ4VA4WFiBZMri` — lacked Measurement ID |
| Main preview after env add | had env but **no R9B analytics code** |

R9B.1 redeployed the measurement branch so Preview includes **both** R9B code and Measurement ID.

---

## Consent validation

| Scenario | Result |
|----------|--------|
| Initial (no choice) | Banner visible; **0** GA network requests — **PASS** |
| Deny | **0** GA requests; `amphon_analytics_consent=denied`; CTA href intact — **PASS** |
| Grant | `gtag/js?id=G-…` loads **exactly once**; `dataLayer` receives `config`; consent persisted — **PASS** |
| Revisit (ตั้งค่าคุกกี้) | Clears choice / reopens banner; deny→grant path exercised — **PASS** |

---

## Pageview validation

MPA architecture; no manual `page_view` in code.

| Navigation (after grant) | Evidence |
|--------------------------|----------|
| Home | 1× gtag script load; 1× `dataLayer` `config`; no duplicate config |
| National Notebook | 1× gtag script load; 1× `dataLayer` `config`; no duplicate config |

`en=page_view` collect query parsing returned 0 (transport may omit readable `en=` in captured requests), but **one `config` per full page load** is the intended GA4 MPA page measurement.

**Pageview verdict:** **PAGEVIEW_PASS** (no DOUBLE_PAGEVIEW)

---

## DebugView / Realtime

| Method | Result |
|--------|--------|
| GA Admin DebugView UI | Not accessible from agent |
| Live gtag `dataLayer` against real Measurement ID | **Verified** — `config`, `cta_click`, `contact_intent` |
| `PUBLIC_GA_DEBUG` on local validation build | `true` (debug_mode) for stronger DebugView eligibility |
| Preview boot `debug` | `false` (env debug not set on Preview) |

**DEBUGVIEW:** runtime event emission **PASS**; Admin UI screenshot **OWNER_SPOT_CHECK_RECOMMENDED**

---

## LINE

| Expectation | Result |
|-------------|--------|
| `cta_click` `cta_type=line` `destination=line` | **PASS** (sticky) |
| `contact_intent` `contact_method=line` | **PASS** |
| No LINE URL / LINE ID / phone in params | **PASS** (`piiHits: []`) |

---

## Phone

| Expectation | Result |
|-------------|--------|
| `cta_click` `cta_type=phone` `destination=phone` | **PASS** |
| `contact_intent` `contact_method=phone` | **PASS** |
| No telephone number in payload | **PASS** |

---

## Maps

| Expectation | Result |
|-------------|--------|
| `cta_click` `cta_type=maps` | **PASS** |
| No `contact_intent` | **PASS** |

---

## Markdown tracking

National Notebook prose links:

| Link | Result |
|------|--------|
| LINE in Markdown | `cta_click` + `contact_intent` (`inline_middle`) — **PASS** |
| `tel:` in Markdown | `cta_click` + `contact_intent` — **PASS** |

No Markdown source edits.

---

## Taxonomy

All representative routes **PASS**, including:

| Path | page_type | province |
|------|-----------|----------|
| `/` | home | national |
| `/บริการ/รับซื้อโน๊ตบุ๊ค` | service_national | national |
| `/พื้นที่ให้บริการ/ภูเก็ต` | area_hub | ภูเก็ต |
| `/พื้นที่ให้บริการ/หาดใหญ่` | **city_hub** | **สงขลา** |
| `/รับซื้อ/รับซื้อโน๊ตบุ๊ค-ขอนแก่น` | service_local | ขอนแก่น |
| `/บริการ/รับซื้อสินค้าไอทีบริษัท` | corporate_parent | national |

---

## Custom dimensions

Parameters actually sent on events:

`page_type`, `service_category`, `province`, `cta_type`, `cta_position`, `destination`, `contact_method`, optional `lead_type`

Owner should register these as event-scoped custom dimensions if not already.

---

## Enhanced Measurement

Admin Web Stream toggle: **UNKNOWN** (no Admin API access).

Client observation after grant: `gtm.scrollDepth` appeared in `dataLayer` → Enhanced Measurement–style automatic signals likely **ON**.

Custom `cta_click` / `contact_intent` remain distinct business events. Do not add GTM outbound-click duplication.

**ENHANCED_MEASUREMENT:** **LIKELY_ON** (observed auto signals) / Admin setting **UNKNOWN**

---

## Key Events

| Event | Status |
|-------|--------|
| cta_click | Not a primary Key Event (micro-interaction) |
| contact_intent | Not a primary business Key Event (micro-conversion) |
| generate_lead | **0** implementations — do not create yet |

---

## Privacy copy

Minimal analytics disclosure remains on `/privacy-policy` from prior R9B.1 commit.  
**PRIVACY_LEGAL_REVIEW_REQUIRED** optional.

---

## PII

Browser validation `piiHits`: **[]** (0)

No phone digits, LINE URLs, emails, or absolute URLs in event parameters.

---

## Performance

- GA loads only after grant  
- Single `gtag/js` insertion per page load when allowed  
- No GTM container  
- Analytics client remains small (~6.8KB class)

---

## Tests

| Command | Result |
|---------|--------|
| `npm run test` | **NOT_CONFIGURED** |
| `npm run test:analytics` | **PASS** |
| `npm run test:google-reviews` | **21/21 PASS** |
| `npx astro check` | **0 errors** |
| `npm run build` | **PASS** (Preview + local validation builds) |
| Browser validation | **PASS** (`docs/gsc-r9-local/r9b1-browser-validation.json`, gitignored) |

---

## SEO protection

No money-page SEO content changes in this resume. Privacy disclosure only (already on branch).

---

## No lead events

`generate_lead` = 0 · `lead_details_completed` = 0 · `deal_agreed` = 0 · `closed_sale` = 0

---

## Production readiness

**READY for production release planning** (separate merge/deploy batch).

Remaining before/at production release:

1. Set `PUBLIC_GA_MEASUREMENT_ID` on **Production** env (currently Preview-only)  
2. Owner Realtime/DebugView spot-check after first prod traffic  
3. Register custom dimensions  
4. Confirm Enhanced Measurement outbound-click policy  
5. Do **not** mark click events as Key Events; no `generate_lead`  
6. Optional: Vercel Automation Bypass for future Preview browser QA  
7. Optional: legal review of privacy analytics wording  

---

## Confirmations

- NO MAIN MERGE  
- NO PRODUCTION DEPLOY  
- NO GENERATE_LEAD  
- NO CRM  
- NO SEO CONTENT REWRITE  
