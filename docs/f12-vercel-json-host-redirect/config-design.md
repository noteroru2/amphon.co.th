# Config design — F-12 host-aware WWW redirects

## Source of Truth

```text
vercel.json  (project root)
```

- No `vercel.ts`
- No `public/_redirects`
- No separate generated redirect file that replaces SoT
- Astro `.vercel/output/config.json` contains framework routes only (~7); **platform merges `vercel.json` redirects at deploy** (proven: existing 222 path redirects already live in production while absent from adapter config.json)

## Schema validation

Per [Vercel vercel.json redirects docs](https://vercel.com/docs/project-configuration/vercel-json):

- `has: [{ type: "host", value: "www.amphon.co.th" }]` — supported
- `statusCode: 307` — supported (Phase A; do not combine with `permanent`)
- `preserveQueryParams: true` — required (default is false)
- Absolute destinations `https://amphon.co.th/...` — supported
- Redirect array limit: 2,048 (Phase A total **445** < limit)

Note: `has` does not apply in `vercel dev` locally; production edge applies it.

## Rule order

```text
1. Exact WWW legacy rules (222) — host=www → absolute apex FINAL target, status 307
2. Existing path redirects (222) — unchanged, permanent as before
3. Generic WWW catch-all (1) — host=www, source /(.*), dest https://amphon.co.th/$1, 307
```

## Generator

```text
scripts/generate-f12-www-redirects.mjs
```

Derives WWW exact rules from existing path redirects; resolves multi-hop finals; excludes external targets.

## QA

```text
npm run qa:f12-vercel-host-redirect
```

`scripts/lib/site-audit.mjs` `resolveRedirectChain` ignores host-conditioned rules so apex Batch 1/12B/12C permanence checks remain valid.
