# Production release report — Batch 3

## Verdict

**PASS WITH WARNING**

- Windows F-08 fixed and validated locally (3 consecutive exit 0 builds).
- Production HTTP smoke checks pass; Production deploy SHA could not be cryptographically tied to Merge SHA (`gh` unavailable; no new Vercel token created).

## Release identity

| Field | Value |
| --- | --- |
| Branch | `fix/batch-3-windows-build-crash` |
| Base SHA | `6c3d0a25877785ff6d4069b8f4267528c422e977` |
| Implementation SHA | `cc00ade3da93dffa179d5b18e369520428bf20d7` |
| Merge SHA | `8521563fe5882fd4097a2701e1e58dbd812c2727` |
| Production SHA | `NOT VERIFIED` |
| Site | https://amphon.co.th |

## Change scope

Only Windows build lifecycle + Batch 3 docs/QA. No content, redirect, sitemap-inclusion, metadata, schema, internal-link, or image changes.

## Production checks

See `post-deploy-validation.csv`.

Highlights:

- Homepage 200
- Sitemap index 200 / sitemap-0 count **1185**
- F-02 and F-03 still included
- Legacy F-01 sample redirect **308**
- Sample service/location URLs 200

## Remaining findings

F-04, F-05, F-06, F-07, F-09, F-11, F-12, and lower-priority items remain open.
