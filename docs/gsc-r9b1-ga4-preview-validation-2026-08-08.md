# GSC-R9B.1 GA4 Preview Validation

**Date:** 2026-08-08  
**Mode:** PREVIEW VALIDATION (+ minimal privacy disclosure)  
**Source branch:** `measurement/gsc-r9b-ga4-cta-mvp`  
**Implementation SHA (R9B):** `1c83ff2b47055993de4eaf575bd0335fadd83a64`

## Final Verdict

**BLOCKED**

Primary blockers:

1. **`PUBLIC_GA_MEASUREMENT_ID` is not configured** on Vercel Preview (or Production)
2. Therefore **no real GA4 stream can be exercised** from Preview
3. **DebugView cannot be validated** without a Measurement ID / owner GA4 access
4. Preview has **Vercel Deployment Protection** (auth wall for anonymous fetch); HTML checks used `vercel curl`

Code/consent UI on Preview is present and taxonomy attributes are correct, but R9B.1 cannot reach `R9B1_READY_FOR_PRODUCTION` or claim event/DebugView PASS.

---

## Source SHA

| Item | Value |
|------|-------|
| R9B implementation | `1c83ff2b47055993de4eaf575bd0335fadd83a64` |
| Preview deploy source | worktree tip including privacy disclosure (see Git section) |
| Main merge | **NO** |
| Production deploy | **NO** |

---

## GA4 stream status

| Check | Result |
|-------|--------|
| Vercel project | `amphon-co-th` (`amphons-projects-bb1ec3bf`) |
| Env vars present | `PUBLIC_GOOGLE_MAPS_URL`, `GOOGLE_PLACE_ID`, `GOOGLE_PLACES_API_KEY` |
| `PUBLIC_GA_MEASUREMENT_ID` Preview | **MISSING** |
| `PUBLIC_GA_MEASUREMENT_ID` Production | **MISSING** (not required for R9B.1, but noted) |
| Repo hardcoded Measurement ID | none |

**GA4_STREAM_CONFIGURED:** **BLOCKED_GA4_STREAM_MISSING** (no Measurement ID wired to Preview; GA Admin stream existence cannot be confirmed from repo/CLI alone)

---

## Preview deployment

| Item | Value |
|------|-------|
| Deployment ID | `dpl_392w6SgPuMNyBDPx86k5GWCapdec` |
| Preview URL | https://amphon-co-r5j4gw9hq-amphons-projects-bb1ec3bf.vercel.app |
| Environment | Preview (`target: preview`) |
| Status | Ready |
| Inspector | https://vercel.com/amphons-projects-bb1ec3bf/amphon-co-th/392w6SgPuMNyBDPx86k5GWCapdec |
| Protection | Vercel Authentication enabled (anonymous curl hits auth wall) |

---

## Consent validation

| Scenario | Evidence | Result |
|----------|----------|--------|
| Consent UI present | Preview HTML contains `#analytics-consent`, accept/deny buttons, privacy link | UI **PASS** |
| Cookie settings revisit | Footer `data-consent-revisit` / “ตั้งค่าคุกกี้” present | UI **PASS** |
| Before consent: no GA script in HTML | No `googletagmanager` / `gtag/js?id=` in initial HTML | Static **PASS** |
| Before consent: no events | Cannot observe live network DebugView without ID | **BLOCKED** (runtime) |
| Deny / Grant persistence | Code path reviewed; live browser grant→load requires Measurement ID | **BLOCKED** (cannot load GA without ID) |
| CTA works without analytics | `href` unchanged; progressive enhancement design | Design **PASS** (live click not DebugView-proven) |

**Consent overall:** UI ready; **runtime GA consent path BLOCKED by missing Measurement ID**

---

## Pageview validation

Without Measurement ID, gtag never loads → no page_view network traffic after grant.

| Expected after consent+ID | Status |
|---------------------------|--------|
| One config pageview per MPA load | Not testable |
| No manual duplicate `page_view` in code | Code review **PASS** (no manual page_view) |

**Pageview verdict:** **MISSING_PAGEVIEW** (configuration gap — not a double-pageview defect)

---

## DebugView

**DEBUGVIEW_OWNER_VALIDATION_REQUIRED** / effectively **BLOCKED**

No DebugView PASS claimed. Owner must:

1. Create/use GA4 Web Data Stream for amphon.co.th  
2. Set Preview env `PUBLIC_GA_MEASUREMENT_ID`  
3. Redeploy Preview  
4. Grant consent + open DebugView  
5. Confirm `page_view`, `cta_click`, `contact_intent`

---

## LINE / Phone / Maps / Facebook

| CTA | Expected | Preview status |
|-----|----------|----------------|
| LINE | `cta_click` + `contact_intent` (`line`) | Instrumented in HTML (`data-cta-type=line`); **events not DebugView-verified** |
| Phone | `cta_click` + `contact_intent` (`phone`) | Instrumented; **not DebugView-verified** |
| Maps | `cta_click` only | Instrumented; **not DebugView-verified** |
| Facebook | `cta_click` only | Instrumented; **not DebugView-verified** |

PII expectation for params remains enforced in code sanitizer; live payload inspection **not possible** without GA network traffic.

---

## Markdown tracking

National Notebook Preview HTML still contains Markdown-origin `line.me` and `tel:` links.  
Delegated listener remains in analytics client.  
**No Markdown source edits** in R9B.1.  
Live event capture: **not DebugView-verified**.

---

## Taxonomy

Preview HTML checks (via `vercel curl`) **PASS** for:

| Path | page_type | service_category | province |
|------|-----------|------------------|----------|
| `/` | home | multi_service | national |
| `/บริการ/รับซื้อโทรศัพท์มือสอง` | service_national | phone | national |
| `/บริการ/รับซื้อ-iphone` | service_brand | iphone | national |
| `/บริการ/รับซื้อโน๊ตบุ๊ค` | service_national | notebook | national |
| `/บริการ/รับซื้อคอมพิวเตอร์` | service_national | computer | national |
| `/บริการ/รับซื้อ-gaming-pc` | service_specialist | gaming_pc | national |
| `/บริการ/รับซื้อแรม` | service_specialist | ram | national |
| `/บริการ/รับซื้อสินค้าไอทีบริษัท` | corporate_parent | corporate_it | national |
| `/บริการ/รับซื้อคอมยกล็อต` | bulk_service | bulk_computer | national |
| `/บริการ/รับซื้อ-server-network` | service_specialist | server_network | national |
| `/พื้นที่ให้บริการ/ภูเก็ต` | area_hub | multi_service | ภูเก็ต |
| `/พื้นที่ให้บริการ/หาดใหญ่` | **city_hub** | multi_service | **สงขลา** |
| `/รับซื้อ/รับซื้อโน๊ตบุ๊ค-ขอนแก่น` | service_local | notebook | ขอนแก่น |

No known core route rendered `page_type=other`.

---

## Custom dimensions

Implementation sends (when GA loads):  
`page_type`, `service_category`, `province`, `cta_type`, `cta_position`, `destination`, `contact_method`, optional `lead_type`.

Owner-side GA4 custom dimension registration: **NOT VERIFIED** (no property access / no ID).

Do not register phone/URL/free-text dimensions.

---

## Enhanced Measurement

**UNKNOWN** — GA4 Admin Web Stream settings not accessible from this environment.

When ID exists, owner should document `ENHANCED_MEASUREMENT_ON|OFF` and keep custom `cta_click` semantics distinct from automatic outbound clicks.

---

## Key Events

| Event | Key Event? |
|-------|------------|
| cta_click | Must remain **NOT** primary Key Event |
| contact_intent | Must remain **NOT** primary business Key Event |
| generate_lead | **Not implemented (0)** — must not create yet |

Semantics: MICRO_INTERACTION / MICRO_CONVERSION only.

---

## Privacy copy

Minimal factual disclosure added to `/privacy-policy` section **“8. การวิเคราะห์การใช้งานเว็บไซต์”**:

- analytics only after accept  
- Google Analytics for usage/performance understanding  
- change via cookie settings  
- explicit non-claim of legal certification  

**PRIVACY_LEGAL_REVIEW_REQUIRED:** optional owner/legal review for broader policy language (isolated from money-page SEO content).

---

## PII

| Check | Result |
|-------|--------|
| Live GA payload PII | **N/A** (no GA requests without ID) |
| Code sanitizer | Present |
| Preview HTML baked Measurement ID | none observed |
| Expected after ID | 0 PII in event params |

---

## Performance

- Analytics client ships only after page load JS  
- GA remote script loads only after consent **and** valid Measurement ID  
- No GTM  
- Duplicate gtag insertion prevented by script id guard  
- Without ID: no Google tag network cost after consent

---

## Tests

| Command | Result |
|---------|--------|
| `npm run test` | **NOT_CONFIGURED** |
| `npm run test:analytics` | **PASS** |
| `npm run test:google-reviews` | **21/21 PASS** |
| `npx astro check` | **0 errors** |
| Preview HTML taxonomy checks | **PASS** (`scripts/r9b1-preview-html-checks.mjs`) |
| `npm run build` | PASS (via Preview deploy build) |

---

## SEO protection

| Area | Result |
|------|--------|
| Service / province Markdown | unchanged |
| Money-page titles/H1/FAQ/canonical | unchanged |
| Privacy page only | minimal analytics disclosure |
| Redirects / noindex | none introduced for SEO freeze pages |

---

## No lead events

Repository/source scan:  
`generate_lead` = 0 · `lead_details_completed` = 0 · `deal_agreed` = 0 · `closed_sale` = 0

---

## Production readiness

**NOT READY**

Blocked until Preview Measurement ID + DebugView event validation complete.

---

## Remaining owner actions

1. Create/confirm GA4 property + Web Data Stream for `amphon.co.th`  
2. Copy Measurement ID (`G-…`)  
3. Vercel → Project `amphon-co-th` → Environment Variables → add **`PUBLIC_GA_MEASUREMENT_ID`** for **Preview** (Production later)  
4. Redeploy Preview branch  
5. Disable or authenticate past Deployment Protection for tester browser if needed  
6. Fresh browser: deny → no GA; grant → one gtag load; revisit cookie settings  
7. DebugView: page_view, LINE (`cta_click`+`contact_intent`), phone, Maps (no contact_intent), Markdown LINE/tel  
8. Register useful custom dimensions only  
9. Confirm Enhanced Measurement outbound-click setting  
10. Do **not** mark click events as primary Key Events; no `generate_lead`  
11. Optional: legal review of privacy analytics wording  
12. Only then consider production env + merge release batch  

---

## Confirmations

- NO MAIN MERGE  
- NO PRODUCTION DEPLOY  
- NO GENERATE_LEAD  
- NO CRM  
- NO SEO CONTENT REWRITE (privacy disclosure only)  
