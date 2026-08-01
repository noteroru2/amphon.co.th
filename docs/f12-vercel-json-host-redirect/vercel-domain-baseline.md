# Vercel domain baseline (owner-confirmed)

Before Phase A cutover:

```text
www.amphon.co.th
Valid Configuration
301 → amphon.co.th

amphon.co.th
Valid Configuration
Production
```

## Observed production hop problem (baseline)

```text
http://www.amphon.co.th/<legacy>
→ HTTPS upgrade (stays on www)
→ Domain 301 www → apex (same legacy path)
→ Path redirect → final target
= 3 hops
```

Evidence: `redirect-chain-baseline.csv`  
Example: `http-www-legacy-hdd-*` redirect_count=3

## Target after Domain→Production + host rules

```text
https://www … legacy → 1 × 307/308 → https://amphon.co.th/<final>
http://www … legacy → ≤2 (HTTPS upgrade + host rule)
```
