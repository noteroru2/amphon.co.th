# Final report — Batch 12G-1 Appliances Outside Ubon

## Verdict

PASS WITH WARNING (pending production validation)

## Status

- Batch 12G-1: CLOSED — 19/19 IMPROVED (pending prod)
- BD-01: CLOSED — OWNER-CONFIRMED KEEP-AND-IMPROVE COMPLETE (pending prod)
- F-04: OPEN — BD-01 COMPLETE / REMAINING OWNER-CONFIRMED GROUPS AND MERGE REVIEW PENDING

## SHAs

- Branch: `fix/batch-12g-1-appliances-outside-ubon`
- Base SHA: `17e03d39706fddabba83f89f84ba84757d4af145`
- Implementation SHA: `4f137ce5fc5dff72157eafd876becbebcaaed77d`
- Merge SHA: `564ef0069389188d0b87ed9cc0e4722a9ca3f426`
- Production SHA: NOT VERIFIED
- Report-only SHA: PENDING
- Deployment URL: https://amphon.co.th
- Note: `check-batch-12f-owner-decisions.mjs` allows BD-01 KEEP-AND-IMPROVE source diffs after Batch 12G-1

## Scope

- URL count: 19
- Provinces: กาฬสินธุ์ ขอนแก่น ชัยภูมิ นครพนม นครราชสีมา บึงกาฬ บุรีรัมย์ มหาสารคาม มุกดาหาร ยโสธร ร้อยเอ็ด เลย ศรีสะเกษ สกลนคร สุรินทร์ หนองคาย หนองบัวลำภู อำนาจเจริญ อุดรธานี
- URLs retained: 19
- Routes retired: 0
- Redirects added: 0
- URL set hash: `e70e14a11b79bf77…`
- Patterns: A/B/C rotated (not identical copy)
- Sections added: province handoff + photo/district context + large-item limits (+ FAQs via layout)
- Sections rewritten: legacy province-swap intros
- Boilerplate removed: yes
- Unsupported claims removed: vague nationwide / guarantee language
- Verified facts: store 740/8; tel E.164; LINE @webuy; owner BD-01 limits; districts from `province-districts.json`
- Unique Value: PASS (≥3 types/page — district notify, handoff limits, photo checklist, FAQ variants)
- Similarity: sibling patterns differ; hub overlap limited to shared policy
- Intent regression: none
- Metadata/H1 diff: 0 unexpected
- Internal links: hub + area hub retained (no F-06 architecture change)
- Schema: FAQPage via existing ServiceArea layout
- Image diff: 0
- Route/Sitemap/Canonical/Noindex/Redirect diff: 0
- Sitemap: 1,166
- Orphans: 2/2/0/0
- Owner-confirmed remaining after BD-01: 115
- MERGE review remaining: 19
- Expected F-04 remaining: 134
- F-12: OPEN/BLOCKED unchanged
