# Pilot Recommendation — Batch 12A → Implementation

## Recommended Pilot: **Pilot A**

```text
Name: MERGE ของสะสม × จังหวัด (non-Ubon) → Service Hub
URLs: 10 (pilot slice) / 19 (full family wave)
Classification: MERGE
Target: /บริการ/รับซื้อของสะสม
Risk: low–medium
GSC blocker: none confirmed (data unavailable — spot-check live GSC before go-live)
External link risk: unknown
Business decision: confirm business no longer needs province landings for ของสะสม
```

### Why this pilot

1. Same template family; normalized similarity high within group
2. Unique value is mostly province-name swap + district list
3. Clear commercial primary: national service hub
4. Does not touch core MacBook/iPhone/notebook clusters
5. Measurable: sitemap −10 (pilot) then −19 (full), redirects +10/+19, zero content rewrite required for sources
6. Batch 11 did not add inbound to these destinations

### Pilot URL set (10)

Select any 10 non-Ubon URLs from `redirect-candidate-map.csv` where target = `/บริการ/รับซื้อของสะสม`. Suggested start:

- กาฬสินธุ์, ขอนแก่น, ชัยภูมิ, นครพนม, นครราชสีมา, บึงกาฬ, บุรีรัมย์, มหาสารคาม, มุกดาหาร, ยโสธร

### Validation plan

- Before: crawl source 200 + indexable + inbound count
- After: 301 to hub, hub 200 self-canonical, no chain, sitemap excludes sources, internal links retargeted
- Rollback: remove redirect rules, restore routes

---

## Pilot B (alternative)

```text
Name: IMPROVE thin blogs (6)
Classification: IMPROVE
URLs: 6
Batch: 12C-blog-improve
```

Expand checklist/FAQ without claims. No URL change. Lower index risk; slower SEO win.

---

## Pilot C (alternative)

```text
Name: IMPROVE secondary service×Ubon (8)
Classification: IMPROVE
URLs: 8
```

Add real store-province value (pickup notes, verified districts). Do **not** invent branches.

---

## Not recommended as first pilot

- Full `REQUIRES_BUSINESS_DECISION` set (134 URLs) — needs owner confirmation
- Core hubs / MacBook clusters
- Mass redirect of all 188 thin pages
