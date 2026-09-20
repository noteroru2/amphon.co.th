# A6 Targeted Ranking / CTR Push — 2026-09-20

## Objective
- PROTECT: `/บริการ/รับซื้อแรม`
- PROTECT: `/บริการ/รับซื้อคอมบริษัท`
- PUSH: `/บริการ/รับซื้อคอมพิวเตอร์` for `รับซื้อคอม`
- RECOVERY: `/บริการ/รับซื้อแท็บเล็ต`

## GSC baseline used
Finalized data through 2026-09-17:
- รับซื้อแรม: avg position 4.43 — protect Top 5.
- รับซื้อคอม: avg position 9.68 — push toward <=7, then Top 5; impressions had expanded while CTR softened.
- รับซื้อคอมบริษัท: avg position 1.40 — protect Top 1–3.
- รับซื้อแท็บเล็ต: avg position 27.40 — recover toward <=20, then Page 1.

## A6 implementation
### Computer hub
- Kept canonical slug and primary page ownership unchanged.
- Tightened title/description around `รับซื้อคอมมือสอง`, `รับซื้อคอมพิวเตอร์`, PC and Gaming intent.
- Added a concise above-the-fold seller-intent section explaining the minimum data needed for an initial valuation.
- No redirect, no canonical change, no H1 rewrite, no broad body rewrite.

### Tablet hub
- Kept canonical slug and primary ownership unchanged.
- Added exact `รับซื้อแท็บเล็ต` alignment to title and lead heading.
- Expanded related terms for selling used tablets / Android Tablet.
- Reinforced Android/Windows scope and explicitly separated iPad intent.
- Added one homepage priority link to the tablet hub.

### Protected pages
- `src/content/services/รับซื้อแรม.md`: no A6 content change.
- `src/content/services/รับซื้อคอมบริษัท.md`: no A6 content change.
- Existing homepage links to RAM and company-computer pages remain unchanged.

## Observation gates
Review exact Query × Page at T+7, T+14 and T+28.
Do not layer another rewrite before the first meaningful observation window unless ownership breaks or a technical regression appears.

Targets:
- รับซื้อแรม: retain Top 5.
- รับซื้อคอมบริษัท: retain Top 1–3.
- รับซื้อคอม: <=7 first; Top 5 next; CTR recovery toward 10%+ as exposure grows.
- รับซื้อแท็บเล็ต: <=20 first; Page 1 next.
