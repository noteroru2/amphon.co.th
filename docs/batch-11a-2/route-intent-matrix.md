# Route Intent Matrix (Batch 11A.2)

| Source URL | Intended Destination | Rule Location | Status Code | Astro Source File | Expected Production Behavior | SEO Reason |
|:---|:---|:---|:---|:---|:---|:---|
| `/บริการ/รับซื้อเลนส์` | `/บริการ/รับซื้อเลนส์กล้อง` | vercel.json | 301 | Yes (Proposed Fallback) | Edge Redirect (301) to Destination | Prevents 404s for legacy URL |
| `/บริการ/รับซื้อ-storage-nas` | `/บริการ/รับซื้อ-nas` | vercel.json | 301 | Yes (Proposed Fallback) | Edge Redirect (301) to Destination | Prevents 404s for legacy URL |
| `/บริการ/รับซื้อ-gopro` | `/บริการ/รับซื้อ-gopro-action-camera` | vercel.json | 301 | Yes (Current Fallback) | Edge Redirect (301) to Destination | Prevents 404s for legacy URL |

### 🚫 SEO Considerations:
- Enforcing permanent 301 redirects ensures that search engines transfer link equity from old deleted pages to active canonical targets.
- Standardizing URLs prevents indexation bloating and crawl budget waste.
