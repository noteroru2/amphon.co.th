# Batch 1.1 — Production Release Report

## Verdict: `PASS WITH WARNING`

Merge + Production deploy + HTTP validation ของ Finding F-01 ผ่านครบทุก Legacy URL  
Warnings ที่ไม่บล็อก F-01:

1. Vercel คืน **308** สำหรับ `permanent: true` (ไม่ใช่ 301) — พฤติกรรมเดิมของโดเมนนี้
2. Production commit SHA **NOT VERIFIED** ผ่าน Vercel API (ไม่มี auth) — ยืนยันจาก Git push + HTTP behavior
3. Windows build crash F-08 (known, OUT OF SCOPE)
4. `http://www` host chain 3 ทอด (Finding F-12, OUT OF SCOPE)

## Identity

| รายการ | ค่า |
|---|---|
| Source branch | `fix/batch-1-thai-legacy-redirects` |
| Source branch tip | `31282ccc1ec5436e5302e572eeebb94b0d632769` |
| Main SHA ก่อน Merge | `a0fb3703d493b85a9bcefbad16ef62945a2ec220` |
| Merge SHA | `1d59ee848ef6946f9822880dfeeea29d64b36957` |
| Production SHA | NOT VERIFIED (Vercel API) / expected = Merge SHA |
| Deployment URL | https://amphon.co.th |
| Deployment status | **Live** — legacy redirects ตอบ 308 ไปปลายทางถูกต้อง |
| Validation timestamp | 2026-07-31T17:44:36.533Z (Asia/Bangkok) |
| Rollback | ไม่ทำ — ไม่มี regression |

## Pre-merge gates

| Check | Result |
|---|---|
| Branch tip match `31282cc` | PASS |
| Fix commit `fe6b2d6` present | PASS |
| Diff scope (11 files, redirect-only) | PASS |
| `npm ci` | PASS |
| `npx astro check` | 0 errors, 0 warnings |
| `npm run qa:batch-1-redirects` | PASS 174 cases |
| `npm run qa:redirect-chain` | PASS |
| `npm run build` | HTML OK + exit `-1073740791` (F-08 known) |

## Production validation

| Metric | Value |
|---|---|
| Legacy logical URLs | 86 |
| Unicode sources tested | 86 — **PASS** |
| Percent-encoded sources tested | 86 — **PASS** |
| Query tests | 7 — **PASS** |
| Total redirect cases | 179 — **179 PASS** |
| Redirect chains (https apex path) | **0** |
| Redirect loops | **0** |
| Incorrect destinations | **0** |
| Production 404 (legacy) | **0** |
| Production 5xx | **0** |
| Negative 404 | **PASS** |
| Current URL regression | **PASS** (11 URLs) |
| Sitemap regression | **PASS** (1183 URLs, no legacy sources added) |

## Finding status

| Finding | Status |
|---|---|
| **F-01** | **CLOSED** — Production redirects ทำงานครบ |
| F-02 sitemap substring | OUT OF SCOPE (ยังเปิด) |
| F-03 Ubon indexability conflict | OUT OF SCOPE |
| F-08 Windows build crash | OUT OF SCOPE / Known warning |
| F-12 http://www 2–3 hop host chain | OUT OF SCOPE / Known warning |

## Files in this Batch 1.1 report update

- `docs/batch-1-thai-legacy-redirects/production-validation-results.csv`
- `docs/batch-1-thai-legacy-redirects/production-validation-summary.md`
- `docs/batch-1-thai-legacy-redirects/production-validation-raw.json`
- `docs/batch-1-thai-legacy-redirects/post-deploy-validation.csv` (updated after)
- `docs/batch-1-thai-legacy-redirects/production-release-report.md`

## Report-only SHA

`e23d2a1ba1e8b8206c9c3b63225ebd77a5079e8c`
