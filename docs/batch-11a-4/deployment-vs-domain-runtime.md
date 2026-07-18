# Deployment URL vs Custom Domain Runtime

The unique deployment URL is protected by Vercel SSO. Anonymous requests to all three paths returned `302` to `vercel.com/sso-api`, `Cache-Control: no-store`, and `X-Robots-Tag: noindex`. Therefore application route behavior and body fingerprints on that host are **UNVERIFIED**, not guessed.

| Path | Unique deployment URL | `amphon.co.th` baseline | Classification |
|---|---|---|---|
| `/บริการ/รับซื้อเลนส์` | SSO protected | 308 to correct destination, then 200 | Deployment runtime unverified; domain correct |
| `/บริการ/รับซื้อ-storage-nas` | SSO protected | 404, no Location | Deployment runtime unverified; domain incorrect |
| `/บริการ/รับซื้อ-gopro` | SSO protected | 200 static fallback, no Location | Deployment runtime unverified; domain incorrect |

Deployment identity metadata proves the custom domain points to the same production deployment. The failures therefore cannot be classified as a wrong-domain alias without contrary evidence.

