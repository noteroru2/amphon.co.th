# Batch 8 — Image Dimensions (F-13)

Add accurate intrinsic `width`/`height` to local markdown content images using sharp metadata (via rehype), without changing image binaries, alt text, loading, or URLs.

## Approach

1. Build `src/data/local-image-dimensions.json` from `public/images` (`npm run images:dimension-cache`)
2. `rehypeLocalImageDimensions` injects dimensions into markdown `<img src="/images/...">`
3. `OptimizedImage` fills missing props from the same cache (explicit props unchanged)

## QA

```bash
npm run images:dimension-cache
npm run build
npm run qa:batch-8-image-dimensions
```
