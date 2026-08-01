# Final report — Batch 12F Business Decision Matrix

## Verdict

PASS WITH WARNING

Matrix and owner questionnaire complete for all 134 `REQUIRES_BUSINESS_DECISION` URLs. GSC and external-link data are unavailable in the repository (conservative flags applied). No production code changes. F-04 remains open pending owner responses.

## F-04 status

```text
OPEN — BUSINESS DECISION MATRIX COMPLETE /
OWNER RESPONSES PENDING
```

## SHAs / Branch

| Field | Value |
|---|---|
| Branch | `audit/batch-12f-business-decision-matrix` |
| Base SHA | `b533120af3a18f89e24917e0f5b2eb3d7a21a3af` |
| Audit SHA | `54968f5057fbb67a645ea5f365802b94c11ea360` |
| PR URL | PENDING |
| Production code changes | **0** |
| Production changes | **0** |
| Merge | **NOT MERGED** |
| Deploy | **NOT DEPLOYED** |

## Reconciliation

| Metric | Count |
|---|---:|
| Original F-04 | 188 |
| False positives | 2 |
| Collectibles MERGE resolved (12B/12C) | 19 |
| IMPROVE resolved (12D/12E) | 14 |
| Remaining MERGE (เฟอร์นิเจอร์ นอกอุบล) | 19 |
| Business-decision URLs (Batch 12F) | 134 |
| Remaining F-04 total | 153 |
| Active/indexable in RBD set (matrix) | 134 |

## Decision grouping

| Metric | Value |
|---|---:|
| URL count | 134 |
| Decision group count | 7 |
| Owner question count | 7 |
| Reduction ratio | 94.8% (134 → 7) |
| Priority A groups / URLs | 4 / 77 |
| Priority B groups / URLs | 3 / 57 |
| Priority C groups / URLs | 0 / 0 |

### Groups

1. **BD-01** เครื่องใช้ไฟฟ้า นอกอุบล — 19 — Priority A — hub `/บริการ/รับซื้อเครื่องใช้ไฟฟ้า`
2. **BD-02** ทีวี นอกอุบล — 19 — Priority B — hub `/บริการ/รับซื้อทีวี`
3. **BD-03** โดรน นอกอุบล — 19 — Priority B — hub `/บริการ/รับซื้อโดรน`
4. **BD-04** Network นอกอุบล — 19 — Priority B — hub `/บริการ/รับซื้ออุปกรณ์-network`
5. **BD-05** Server นอกอุบล — 19 — Priority A — hub `/บริการ/รับซื้อ-server`
6. **BD-06** UPS นอกอุบล — 19 — Priority A — hub `/บริการ/รับซื้อ-ups`
7. **BD-07** รับเหมาประมูล (20 จังหวัด รวมอุบล) — Priority A — hub `/บริการ/รับเหมาประมูลอุปกรณ์ไอที`

## Unknown business facts (all 7 groups)

Agent did **not** answer these; marked `UNKNOWN — OWNER DECISION REQUIRED`:

- Service existence outside confirmed Ubon store model
- Product condition policy
- Fulfilment (appointment pickup / shipping for category)
- Page strategy (keep separate vs merge vs redirect)

| Signal | Count |
|---|---:|
| URLs with unknown service status | 134 |
| URLs with unknown condition policy | 134 |
| URLs with unknown fulfilment policy | 134 |
| Trust-risk groups (province LP / large-item / auction) | 7 (A: BD-01,05,06,07 elevated) |
| Hard `KNOWN TRUST ISSUE` branch-language hits in sampled claims | 0 |

## Targets

- Proposed category hubs validated locally: **7/7 valid** (200, indexable, self-canonical, in sitemap)
- Homepage as default redirect: **rejected** for all groups
- Targets requiring review: **0** for preferred hubs (sampled rows show `valid_target=yes`)

## Evidence

- GSC: **GSC DATA NOT AVAILABLE IN REPOSITORY** — SEARCH DEMAND UNKNOWN — CONSERVATIVE ACTION REQUIRED
- External links: **EXTERNAL LINK DATA NOT AVAILABLE**

## Proposed implementation batches (after owner answers)

| Batch | Scope |
|---|---|
| 12G-1…12G-4 | Priority A groups BD-01, BD-05, BD-06, BD-07 (~19–20 URLs each) |
| 12H-1…12H-3 | Priority B groups BD-02, BD-03, BD-04 |
| 12I | Merge pilot 5–19 URLs from groups answering B |
| 12J | Remaining merge/redirect |
| NOTE | Remaining MERGE furniture (19) — outside RBD set |

## QA baseline

- Astro check: 0/0
- Build: exit 0
- Sitemap: 1,166
- Broken / redirecting internal links: 0 / 0
- Indexable orphan: 0
- Batch 1–12E: PASS (F-12 warning unchanged)

## Remaining Findings

- **F-04** OPEN — owner responses + implementation batches pending; MERGE furniture still pending
- **F-12** OPEN / BLOCKED (Vercel domain)
- F-14–F-18 out of scope

## Report files

`docs/batch-12f-business-decision-matrix/` — README, baseline, candidate-reconciliation, business-decision-candidates, decision-group-map, business-service-matrix, owner-decision-questionnaire, owner-response-sheet, current-claim-inventory, decision-outcome-map, target-validation, gsc-evidence, external-link-evidence, decision-priority, implementation-batch-plan, risk-register, test-results, final-report
