# Final report — Batch 12G-1 Appliances Outside Ubon

## Verdict

**PASS WITH WARNING** — Production content live and validated; Production SHA NOT VERIFIED

## Status

- Batch 12G-1: **CLOSED — 19/19 IMPROVED**
- BD-01: **CLOSED — OWNER-CONFIRMED KEEP-AND-IMPROVE COMPLETE**
- F-04: **OPEN — BD-01 COMPLETE / REMAINING OWNER-CONFIRMED GROUPS AND MERGE REVIEW PENDING**

## SHAs

- Branch: `fix/batch-12g-1-appliances-outside-ubon`
- Base SHA: `17e03d39706fddabba83f89f84ba84757d4af145`
- Implementation SHA: `4f137ce5fc5dff72157eafd876becbebcaaed77d`
- Merge SHA: `564ef0069389188d0b87ed9cc0e4722a9ca3f426`
- Main tip (incl. 12F QA BD-01 allowlist): `3e4a87e0950df35a2d149c5794e2e1590ad59853`
- Production SHA: **NOT VERIFIED**
- Report-only SHA: `4f8660e651b5e5d0e58fa284dc43fbeca77266ce`
- Deployment URL: https://amphon.co.th
- URL set hash: `e70e14a11b79bf77`
- Note: Visual validation was rendered from local dist; production page markers re-validated live for all 19 URLs

## Scope

- URL count: **19**
- Provinces: กาฬสินธุ์ ขอนแก่น ชัยภูมิ นครพนม นครราชสีมา บึงกาฬ บุรีรัมย์ มหาสารคาม มุกดาหาร ยโสธร ร้อยเอ็ด เลย ศรีสะเกษ สกลนคร สุรินทร์ หนองคาย หนองบัวลำภู อำนาจเจริญ อุดรธานี
- URLs retained: 19
- Routes retired: 0
- Redirects added: 0
- Patterns: A/B/C rotated
- Sections added: province handoff + photo/district context + large-item limits + unique FAQs
- Sections rewritten: legacy province-swap intros
- Boilerplate removed: yes
- Unsupported claims removed: vague nationwide / guarantee language
- Verified facts: store 740/8; tel E.164; LINE @webuy; owner BD-01 limits; districts from `province-districts.json`
- Unique Value: PASS
- Similarity: sibling patterns differ; hub overlap limited to shared policy
- Intent regression: none
- Metadata/H1 diff: 0 unexpected
- Internal links: hub + area hub retained
- Schema: FAQPage via existing ServiceArea layout (no architecture change)
- Image diff: 0
- Route/Sitemap/Canonical/Noindex/Redirect diff: 0
- Sitemap: **1,166** (diff 0)
- Production crawl: pages=1166 broken=0 redirecting=0
- Orphans: all-routes 2 / sitemap 0 / indexable 0 / new 0
- Owner-confirmed remaining after BD-01: **115**
- MERGE review remaining: **19**
- Expected F-04 remaining: **134**
- F-12: OPEN/BLOCKED unchanged

## Production checklist

- BD-01 19/19 live with unique section markers: PASS
- Self-canonical + indexable: PASS
- Sitemap inclusion 19/19: PASS
- Store / tel / case-by-case / hub links: PASS
- No fake branch / team / unqualified claims: PASS
- Batch 12D Ubon + collectibles regression: PASS
- Batch 12E sample + BD-02/BD-05 sibling samples: PASS
- Collectibles redirect sample: PASS (308)
- Homepage + Topic Hub: PASS
