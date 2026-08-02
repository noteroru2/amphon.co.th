# Test results (pre-merge)

| Check | Result |
| --- | --- |
| `npx astro check` | 0 errors / 0 warnings |
| `npm run build` | exit 0 |
| `qa:gsc-404-thai-location-encoding` | PASS (config) |
| Batch 1–12G + redirect-chain + sitemap | ALL PASS |
| Sitemap | 1166 |
| Broken / redirecting links | 0 / 0 |
| Route/content/metadata/schema diffs | 0 (not in change set) |

Runtime Location ASCII checks after deploy:

```text
npm run qa:gsc-404-thai-location-encoding -- --runtime
PASS … runtime=OK
```

Evidence: `strict-client-validation.csv`, `post-deploy-validation.csv`, `production-redirect-validation.csv`.
Node fetch Location is ASCII percent-encoded; follow → 200.
