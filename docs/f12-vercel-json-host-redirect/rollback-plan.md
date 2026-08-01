# Rollback plan

## Domain rollback (primary, fastest)

If post-switch smoke tests fail:

```text
Vercel → amphon-co-th → Settings → Domains → www.amphon.co.th
Set back to: 301 Redirect → amphon.co.th
```

Expected: restore pre-cutover behavior (http://www legacy may again be 3 hops). Apex remains healthy.

## Code rollback (if needed)

```bash
git revert <Phase-A-merge-SHA>
# or restore vercel.json redirects to path-only 222 from Base SHA ff6f453
git checkout ff6f453 -- vercel.json
```

Phase A uses **307** so browsers do not permanently cache WWW→apex mappings during cutover.

## Do not

- Change apex `amphon.co.th` assignment
- Force 308 before Phase B PASS
- Delete existing path redirects
