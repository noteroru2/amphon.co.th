# Batch 12F — Business Decision Matrix (F-04 RBD)

Audit-only batch. **No production code changes. Not merged. Not deployed.**

## Purpose

Reduce 134 `REQUIRES_BUSINESS_DECISION` URLs into a small set of owner questions by service / template family.

## Counts

| Metric | Value |
|---|---:|
| Business-decision URLs | 134 |
| Decision groups / owner questions | 7 |
| Reduction | 134 → 7 (94.8%) |
| Remaining MERGE (out of scope) | 19 (เฟอร์นิเจอร์ นอกอุบล) |

## Decision groups

| ID | Priority | URLs | Hub target |
|---|---|---:|---|
| BD-01 เครื่องใช้ไฟฟ้า | A | 19 | `/บริการ/รับซื้อเครื่องใช้ไฟฟ้า` |
| BD-02 ทีวี | B | 19 | `/บริการ/รับซื้อทีวี` |
| BD-03 โดรน | B | 19 | `/บริการ/รับซื้อโดรน` |
| BD-04 Network | B | 19 | `/บริการ/รับซื้ออุปกรณ์-network` |
| BD-05 Server | A | 19 | `/บริการ/รับซื้อ-server` |
| BD-06 UPS | A | 19 | `/บริการ/รับซื้อ-ups` |
| BD-07 รับเหมาประมูล | A | 20 | `/บริการ/รับเหมาประมูลอุปกรณ์ไอที` |

## Start here (owner)

1. `owner-decision-questionnaire.md`
2. Fill `owner-response-sheet.csv` (answers blank on purpose)

## Status

```text
F-04:
OPEN — BUSINESS DECISION MATRIX COMPLETE /
OWNER RESPONSES PENDING
```
