# Risk Register — Batch 12A / F-04 Implementation

| risk | affected_group | likelihood | impact | mitigation | validation | rollback |
|---|---|---|---|---|---|---|
| Traffic loss on redirected province URLs | MERGE ของสะสม/เฟอร์นิเจอร์ | medium | medium | Live GSC export before redirect; pilot 10 URLs first | GSC URL inspection 14–28 days | Remove 301; restore pages |
| Wrong redirect target | MERGE candidates | low | high | Target must be service hub 200 + self-canonical + same product intent | Spot-check final URL + title/H1 | Retarget rule |
| Cannibalization after partial merges | Secondary SA remaining live | medium | medium | Do not leave near-duplicate siblings without plan | Similarity + query review | Complete family or improve |
| Index removal surprise | NOINDEX (none proposed now) | low | high | No noindex in 12A; require human review later | robots/canonical crawl | Restore index |
| Loss of long-tail coverage | REQUIRES_BUSINESS_DECISION (134) | high if mass-merged | medium | Keep as business decision; improve Ubon first | Business intake form | N/A until decided |
| External backlink loss | Any MERGE/REDIRECT | unknown | medium | No inbound backlink inventory in repo; check Search Console links | External link report | 301 preserves equity if correct |
| Internal link cleanup | Sources linking to merged URLs | medium | low | Batch 11 added 0 new inbound to deferred destinations; still update any older links | Internal link crawl = 0 redirecting | Fix hrefs |
| Sitemap count changes | MERGE pilots | high (expected) | low | Expect −10 then −19 for ของสะสม family | Sitemap URL count | Re-include if rollback |
| Redirect rule growth | vercel redirects | medium | low | Prefer explicit map not wildcards | qa:batch-1 + redirect chain | Delete rules |
| False local-business claims | IMPROVE drafts | medium | high | Prohibit สาขา/ทีมประจำจังหวัด | qa:claim-risk + manual | Revert content |
| Programmatic template regression | All SA templates | medium | medium | Change shared layout carefully; prefer content-level | Diff template families | Revert layout |
| Content duplication | IMPROVE copies hub text | medium | medium | Require unique sections checklist | Similarity vs hub | Edit |
| GSC data unavailable | All decisions | high | medium | Flag REQUIRES_GSC where demand unknown; pilot low-value first | Export before 12B | Delay merge |
| Production SHA unavailable | Deploy validation | medium | low | Record NOT VERIFIED; validate HTML samples | Sample curl | N/A |
| F-12 www hop warning | Host redirects | certain | low | Do not touch host config in F-04 batches | qa:batch-7 warning expected | N/A |
