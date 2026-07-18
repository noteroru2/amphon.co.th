# Astro Development Runtime Verification (Batch 11A.2)

In Astro local development mode (`npm run dev` on `http://localhost:4321`), the Vercel Edge redirects configured in `vercel.json` are **not** parsed. The server resolves requests directly using physical Astro routes.

---

## 1. Runtime curl Responses

### 1.1 Request: `/บริการ/รับซื้อเลนส์`
```bash
$ curl -I http://localhost:4321/บริการ/รับซื้อเลนส์
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Date: Sat, 18 Jul 2026 02:47:06 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```
- **HTTP status:** 200 OK (no redirect at HTTP layer)
- **Location header:** None
- **Meta Robots in body:** `noindex,follow`
- **Canonical in body:** `https://amphon.co.th/บริการ/รับซื้อเลนส์กล้อง`
- **Meta Refresh redirection:** `0;url=/บริการ/รับซื้อเลนส์กล้อง`

### 1.2 Request: `/บริการ/รับซื้อ-storage-nas`
```bash
$ curl -I http://localhost:4321/บริการ/รับซื้อ-storage-nas
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Date: Sat, 18 Jul 2026 02:47:06 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```
- **HTTP status:** 200 OK
- **Location header:** None
- **Meta Robots in body:** `noindex,follow`
- **Canonical in body:** `https://amphon.co.th/บริการ/รับซื้อ-nas`
- **Meta Refresh redirection:** `0;url=/บริการ/รับซื้อ-nas`

### 1.3 Request: `/บริการ/รับซื้อ-gopro`
```bash
$ curl -I http://localhost:4321/บริการ/รับซื้อ-gopro
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Date: Sat, 18 Jul 2026 02:47:06 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```
- **HTTP status:** 200 OK
- **Location header:** None
- **Meta Robots in body:** `noindex,follow`
- **Canonical in body:** `https://amphon.co.th/บริการ/รับซื้อ-gopro-action-camera`
- **Meta Refresh redirection:** `0;url=/บริการ/รับซื้อ-gopro-action-camera`
