# Astro Preview Runtime Verification (Batch 11A.2)

In local preview mode (`npm run preview` serving `dist/` on `http://localhost:4321`), built static HTML pages are served. Vercel edge rules remain inactive.

---

## 1. Runtime Responses
The HTTP headers and body content match the local development server exactly:
- **HTTP Status:** 200 OK
- **Location header:** undefined
- **Robots meta:** `noindex,follow` (serves redirect stub page directly)
- **Client redirection:** Executed via meta refresh and JavaScript `window.location.replace()`.

---

## 2. Dev/Preview vs. Production Behavior

| Environment | HTTP Status | Redirection Type | Edge Priority | Notes |
|:---|:---|:---|:---|:---|
| **Local Dev** | 200 OK | Client-side (Meta Refresh / JS) | No | Serves fallback stubs |
| **Local Preview** | 200 OK | Client-side (Meta Refresh / JS) | No | Serves built HTML fallbacks |
| **Vercel Production** | 301 Redirect | Server-side (Location Header) | Yes | Bypasses HTML, triggers Edge directly |
