# Baseline — Batch 10 F-09

```text
Branch: fix/batch-10-metadata-quality
Base SHA: 98057bc41074df96e439223febb3b0b1d1dab553
Finding: F-09 (P2 Metadata)
Audit Title flags (LONG >70): 314
Audit Description flags (>170): 216
Union flagged URLs reviewed: 321
GSC data in repository: NOT AVAILABLE
```

## Classification summary (pre-edit)

| Decision | Count |
|---|---:|
| KEEP (valid long / signal only) | 307 |
| EDIT_TITLE (confirmed structural/semantic) | 14 |
| Plus brand-suffix cleanup on other service frontmatter | included in implementation (TEMPLATE_CAUSED) |

Confirmed edit themes:

1. Payment process boilerplate in title
2. Product-list stuffing + logistics clause in service hub title
3. Semantic repetition (`รับซื้อ` twice)
4. Duplicated brand (`| อำพล เทรดดิ้ง` / `| Amphon.co.th` in frontmatter while layout appends brand)
5. Extreme service descriptions with stacked lists + unscoped pickup language
