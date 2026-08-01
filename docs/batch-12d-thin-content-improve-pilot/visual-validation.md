# Visual validation — Batch 12D

Validated from local SSR build (`dist/client`) for all 6 pilot URLs:

- H1/title unchanged from pre-pilot metadata
- New product-specific sections render under main content
- FAQ block shows ≥3 items with visible Q&A (layout FAQ component)
- No keyword directory / district-only padding
- Hero image path unchanged
- `tel:+66642579353` present
- Store address 740/8 shown in local process section
- No horizontal overflow patterns introduced (standard prose + lists)
- Sibling non-pilot Ubon pages (e.g. server/ups) not edited this batch

Desktop/mobile: same HTML response (Astro SSR); content hierarchy readable on narrow viewport via existing CSS.
