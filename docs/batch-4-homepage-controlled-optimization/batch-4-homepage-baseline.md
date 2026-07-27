# Batch 4 Homepage Baseline

## Scope

- URL: `https://amphon.co.th/`
- Source: `src/pages/index.astro`
- Layout: `src/layouts/BaseLayout.astro`
- Header: `src/components/Header.astro`
- Footer: `src/components/Footer.astro`
- Primary content sources: Astro content collections `services`, `areas`, and `blog`
- Hero: inline in `src/pages/index.astro`
- Service grid: `ServiceCard.astro`, configured in `src/pages/index.astro`
- Province block: `ProvinceGrid.astro`, configured in `src/pages/index.astro`
- CTA: `CTAContact.astro`
- FAQ: inline visible cards in `src/pages/index.astro`
- Schema and metadata: `BaseLayout.astro`, `src/lib/seo.ts`, and homepage props/schema extras
- Starting branch: `batch-4-homepage-controlled-optimization`
- Starting SHA: `8826048`
- GSC source: `C:\Users\User\Downloads\amphon.co.th-Performance-on-Search-2026-07-26.xlsx`
- GSC filter: Web search, latest six months

## Rendered Baseline

| Field | Current value |
| --- | --- |
| URL | `https://amphon.co.th/` |
| Source file | `src/pages/index.astro` |
| Title | `รับซื้อสินค้าไอทีมือสองทั่วประเทศ \| AMPHON TRADING \| Amphon.co.th` |
| Meta description | `รับซื้อโน๊ตบุ๊ค คอมพิวเตอร์ RAM iPhone iPad MacBook และสินค้าไอทีมือสอง ส่งรูปเช็กราคาได้ มีหน้าร้านจริงที่อุบลราชธานี รองรับลูกค้าทั่วประเทศ` |
| H1 | `รับซื้อสินค้าไอทีมือสอง ส่งรูปประเมินราคาได้ทั่วประเทศ` |
| Canonical | `https://amphon.co.th` |
| Approximate rendered word/token count | 2,497 |
| Internal-link instances | 220 |
| Unique internal destinations | 159 |
| Service-link instances | 178 |
| Unique service destinations | 135 |
| Province-link instances | 14 |
| Unique province destinations | 13 |
| Footer-link instances | 28 |
| Structured data types | BreadcrumbList, ContactPoint, Country, GeoCoordinates, ImageObject, ItemList, ListItem, Offer, OfferCatalog, OpeningHoursSpecification, Organization, PostalAddress, Service, WebPage, WebSite |
| Primary CTA | LINE @webuy |
| Secondary CTA | Telephone and `/รับซื้อสินค้าไอที` |

## Baseline Finding

The homepage already ranked at average position 4.86. Its largest controllable risk was not the Title or H1; it was the homepage-only rescue-link block, which exposed a large list of service and model pages. That block accounted for most of the 135 unique service destinations and made the page act like an HTML sitemap. Batch 4 therefore uses a preserve-first approach: keep the Title, H1, hero, main CTA, canonical, URL, and established sections while replacing uncontrolled service/province selection with evidence-based lists.
