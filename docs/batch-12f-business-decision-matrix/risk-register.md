# Risk Register — Batch 12F

| risk | affected_group | likelihood | impact | owner_decision | mitigation | validation | rollback |
|---|---|---|---|---|---|---|---|
| Service claim ไม่ตรงธุรกิจ | all BD groups | medium | high | A–D | รอคำตอบก่อนแก้ claim | claim inventory + prod crawl | revert content/redirect |
| Redirect ผิด Intent | B/D answers | medium | high | B/D | ใช้ hub หมวดเดียวกันที่ผ่าน target-validation | intent check + 200/self-can | remove redirect rule |
| Traffic loss | merge/redirect groups | unknown | medium | B/D | GSC before mass merge; pilot 12I | GSC after deploy | restore routes |
| Long-tail loss | all non-Ubon SA | unknown | medium | A/B | SEARCH DEMAND UNKNOWN — conservative | keep-monitor if E | n/a |
| Backlink loss | all | unknown | medium | B/D | EXTERNAL LINK DATA NOT AVAILABLE — conservative | check when data exists | 301 retain equity |
| Index removal | D/B | medium | medium | B/D | sitemap remove only after redirect | sitemap count | re-include |
| Fake local-service impression | all province LPs | high | high | A–D | ไม่สื่อสาขา; ใช้โมเดลประเมินผ่านรูป | claim scan | rewrite claims |
| Large-item fulfilment | BD-01, BD-05, BD-06 | medium | high | A/C/D | ถามความสามารถขนส่ง/นัดรับ | owner notes | limit claims |
| Auction/bulk ambiguity | BD-07 | high | high | A–D | ถามแยกหมวดประมูล | owner sheet | tighten copy |
| Product-condition ambiguity | BD-03, BD-06, others | medium | medium | C | ถามสภาพที่รับ | content limits | soften claims |
| Duplicate content | all template families | high | medium | B | merge to hub if no unique value | similarity | improve if A |
| Internal-link cleanup | B/D | medium | medium | B/D | retarget links with redirects | batch-11 QA | restore links |
| Sitemap changes | B/D | medium | low | B/D | expect count drop = redirected URLs | sitemap QA | republish |
| Redirect-rule growth | B/D | medium | medium | B/D | explicit per-URL like 12B/12C; no wildcards unless approved | redirect QA | delete rules |
| GSC unavailable | all | certain | medium | E possible | flag UNKNOWN demand | n/a | n/a |
| External-link data unavailable | all | certain | medium | conservative | do not assume zero links | n/a | n/a |
| F-12 warning | host | certain | low | out of scope | ignore as baseline | batch-7 | n/a |
