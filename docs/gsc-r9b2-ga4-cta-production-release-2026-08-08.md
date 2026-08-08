# GSC-R9B.2 GA4 + CTA Measurement Production Release

**Date:** 2026-08-08  
**Mode:** PRODUCTION RELEASE (resume after owner configured Production GA4 env)

## Final Verdict

**PASS_WITH_WARNING**

Production release completed. Live consent / CTA / taxonomy / PII checks PASS on `https://amphon.co.th`.

Non-blocking owner warnings only:

- `OWNER_REALTIME_SPOTCHECK_RECOMMENDED`
- `CUSTOM_DIMENSIONS_OWNER_PENDING`
- `ENHANCED_MEASUREMENT_ADMIN_STATUS_UNKNOWN`

GA Admin DebugView UI was **not** verified from this agent (do not fabricate Admin confirmation). Network + `dataLayer` evidence on Production shows correct real Measurement ID collection after consent grant.

---

## Gate: Production GA4 env

| Check | Result |
|------|--------|
| Previous blocker | `BLOCKED_PRODUCTION_GA4_ENV_MISSING` |
| Owner action | `PUBLIC_GA_MEASUREMENT_ID` set on Vercel **Production** |
| Live HTML boot | Measurement ID present (masked **`G-V2…D9X`**) — same stream as validated Preview |
| Hardcoded gtag before consent | No |

**PRODUCTION_GA4_ENV:** **CONFIGURED**

---

## Git / SHAs

| Item | Value |
|------|-------|
| Source branch | `measurement/gsc-r9b-ga4-cta-mvp` |
| Validated feature tip | `368a9f278e550382854b24b7684265ed042b5125` |
| Main before merge | `2a06cd621a1697482867621d87114a188d7a3834` |
| Merge commit (**Content / Deploy SHA**) | `d9e7b78d9d2e034c228bb102744650aa29d81b54` |
| Final main docs-only SHA | *(this docs commit — see after push)* |

Feature commits merged:

1. `1c83ff2` feat: add consent-aware GA4 CTA measurement  
2. `9fca1e6` fix: validate GA4 measurement privacy flow  
3. `368a9f2` docs: complete R9B.1 preview GA4 validation  
4. `d9e7b78` merge: release GA4 CTA measurement MVP  

Release worktree: `../amphon-r9b2-release` on `seo/gsc-r9b2-release-temp` (pushed to `origin/main`).  
Main worktree left untouched (unrelated dirty files).

---

## Pre-merge QA

| Check | Result |
|------|--------|
| `npm run test:analytics` | PASS |
| `npm run test:google-reviews` | 21/21 PASS |
| `npx astro check` | 0 errors / 0 warnings |
| `npm run build` | PASS |
| `generate_lead` / `lead_details_completed` / `deal_agreed` / `closed_sale` in `src` | **0** |
| Frozen SEO money-page content diffs | **0** (measurement + privacy disclosure + docs/tests only) |

---

## Merge / Push / Deploy

| Step | Result |
|------|--------|
| Merge `--no-ff` → main | DONE (`d9e7b78`) |
| Push `origin/main` | DONE (`2a06cd6..d9e7b78`) |
| Vercel Production | **Ready** |
| Deployment ID | `dpl_2LWxoGTbuMmMrz58n5aUFWs6CBXL` |
| Deployment URL | https://amphon-co-dx3sbzmbl-amphons-projects-bb1ec3bf.vercel.app |
| Build commit (Vercel logs) | `d9e7b78` on `main` |
| Aliases | `https://amphon.co.th`, `https://www.amphon.co.th`, project aliases |

---

## Live Production validation

Method: Playwright + request capture + `dataLayer` against `https://amphon.co.th` (script reused from R9B.1). Local artifact under `docs/gsc-r9-local/` (gitignored — not committed).

Measurement ID masked in all reports: **`G-V2…D9X`**

### Consent

| Scenario | Result |
|----------|--------|
| Initial (no choice) | Banner present; **GA requests = 0** |
| Deny | **GA requests = 0**; sticky LINE href still present (CTA works) |
| Grant | gtag.js loads **exactly once**; `dataLayer` has `config`; consent persisted `granted` |
| Revisit (`ตั้งค่าคุกกี้` / `data-consent-revisit`) | Opens consent UI; grant path validated after deny |

### Pageview

| Page | Result |
|------|--------|
| `/` | No duplicate `page_view` (`en=page_view` count ≤ 1); single gtag config init |
| Notebook national | Same — no duplicate pageviews |

Note: GA4 default `config` send may not always surface as a discrete `en=page_view` query in captured requests; pass criterion is **no duplicates** + single config init per MPA load.

### CTA semantics

| CTA | Expected | Result |
|-----|----------|--------|
| LINE (sticky) | `cta_click` + `contact_intent` (`line`) | PASS — no LINE ID / full URL / PII |
| Phone (sticky) | `cta_click` + `contact_intent` (`phone`) | PASS — no phone number in params |
| Maps | `cta_click` only; **no** `contact_intent` | PASS |
| Markdown LINE (notebook) | delegated `cta_click` + `contact_intent` | PASS |
| Markdown tel (notebook) | delegated `cta_click` + `contact_intent` | PASS |

### Taxonomy (dataset + expected)

| Path | page_type | province | service_category | Result |
|------|-----------|----------|------------------|--------|
| `/พื้นที่ให้บริการ/หาดใหญ่` | `city_hub` | `สงขลา` | multi_service | PASS |
| `/พื้นที่ให้บริการ/ภูเก็ต` | `area_hub` | `ภูเก็ต` | multi_service | PASS |
| `/บริการ/รับซื้อโน๊ตบุ๊ค` | `service_national` | `national` | notebook | PASS |
| `/รับซื้อ/รับซื้อโน๊ตบุ๊ค-ขอนแก่น` | `service_local` | `ขอนแก่น` | notebook | PASS |
| `/บริการ/รับซื้อสินค้าไอทีบริษัท` | `corporate_parent` | `national` | `corporate_it` | PASS |

### Privacy / PII

**PII count = 0** on inspected event parameters (LINE/phone/Markdown).

No phone, email, LINE ID, full external URLs, free text, serial/IMEI/address/customer identifiers in event params.

### Forbidden product scope

| Item | Result |
|------|--------|
| `generate_lead` | 0 |
| CRM / lead backend | None added |
| SEO content rewrite / mass Markdown | None |
| GSC / OAuth / CSV credentials | Not committed |

---

## Admin gaps (non-blocking)

| Warning | Status |
|---------|--------|
| `OWNER_REALTIME_SPOTCHECK_RECOMMENDED` | Owner should glance GA4 Realtime once after grant/CTA |
| `CUSTOM_DIMENSIONS_OWNER_PENDING` | Register custom dims for taxonomy params if not already |
| `ENHANCED_MEASUREMENT_ADMIN_STATUS_UNKNOWN` | Admin UI not accessible to agent |

These do **not** block release given Production network/`dataLayer` evidence.

---

## R9C Boundary

Unchanged — no `generate_lead`, deal/sale events, or CRM in this batch.

---

## Confirmations

- **MERGED**
- **PUSHED**
- **PRODUCTION READY**
- **GA4 MEASUREMENT ACTIVE** (masked `G-V2…D9X`)
- **CONSENT ACTIVE**
- **NO GENERATE_LEAD**
- **NO CRM**
- **NO SEO CONTENT REWRITE**
- **NO MASS MARKDOWN EDIT**
- **NO GSC/OAUTH/CSV COMMITTED**

Content/Deploy SHA: `d9e7b78d9d2e034c228bb102744650aa29d81b54`  
Final main docs-only SHA: *(filled after docs commit)*
