# Baseline — Batch 5 / F-07

## Base SHA

`bbb30055a018c8d806e7ce1db060ca7d887515b8`

## Finding

**F-07 — P2**: Large PNG (~600–900KB) used in ~20 service pages while WebP alternatives were believed to exist.

## Confirmed reality

| Metric | Value |
| --- | --- |
| Audit narrative | ~20 pages; use existing `.webp` |
| Oversized service PNG files on disk (>300KB) | 44 |
| True basename PNG↔WebP pairs before fix | 1 (invalid: both were JPEG magic) |
| Referenced oversized PNG in `src` | **21** |
| Impacted service markdown/config files | **25** |
| Impacted routes (approx) | **24** |
| Total referenced bytes before | 15,007,296 (~14.7 MB) |
| Candidate WebP bytes after generation | 1,825,972 (~1.8 MB) |
| Shared component origin | No path swap in `OptimizedImage.astro`; content/frontmatter refs only |
| Hero loading | Service heroes already `eager` + `fetchpriority="high"` + 600×338 |
| Dimensions / Alt | Preserved (no F-13 mass width/height rewrite) |
| PNG deletion | Not performed (retained for OG/external safety) |

## Image roles

- Most targets: `heroImage` + body markdown + `ogImage` pointing at same oversized asset
- Exceptions: some pages already had a different WebP hero and only body PNG (e.g. gaming notebook, headphones)

## Production status (pre-fix)

Assets served as `/images/services/*.png` with large Content-Length; Content-Type often image/png despite JPEG payloads.
