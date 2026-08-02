# Fix F — Percent-encode Thai redirect destinations

```text
Branch: fix/gsc-404-thai-location-encoding
Finding: NF-GSC-404-THAI-LOCATION (encoding defect)
```

## What changed

- `vercel.json` destinations with non-ASCII → UTF-8 percent-encoded path segments
- Rules: **222 → 222**
- Thai destinations encoded: **219**
- Logical targets: **unchanged**
- Blog → `/blog`: **unchanged** (2)

## Commands

```bash
node scripts/apply-gsc-404-thai-location-encoding.mjs   # already applied
npm run qa:gsc-404-thai-location-encoding
npm run qa:gsc-404-thai-location-encoding -- --runtime  # after deploy
```
