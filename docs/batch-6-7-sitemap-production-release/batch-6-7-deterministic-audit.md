# Batch 6.7 Deterministic Sitemap Audit

Two consecutive builds of merge SHA `34d77935871ae1680e5b1d846cefba3fee084e4c` were performed without source changes.

| Sitemap file | Build 1 SHA-256 | Build 2 SHA-256 | Production SHA-256 | Result |
| --- | --- | --- | --- | --- |
| `sitemap-index.xml` | `ABDA440485F5E8446BD3863B53B56D45D8A33B25F6150EF0472D117FCEEA72A6` | `ABDA440485F5E8446BD3863B53B56D45D8A33B25F6150EF0472D117FCEEA72A6` | `ABDA440485F5E8446BD3863B53B56D45D8A33B25F6150EF0472D117FCEEA72A6` | PASS |
| `sitemap-0.xml` | `EAC1F2A0A58130792863A46025DFFFEA3CB7172557742E5C0D940412E50E1250` | `EAC1F2A0A58130792863A46025DFFFEA3CB7172557742E5C0D940412E50E1250` | `EAC1F2A0A58130792863A46025DFFFEA3CB7172557742E5C0D940412E50E1250` | PASS |

- Byte-for-byte local build comparison: PASS
- Byte-for-byte local versus production comparison: PASS
- URL-to-lastmod mapping mismatches: 0
- Build-time date fallback: none
- Deployment-time date fallback: none
- Git-date fallback: none
- Filesystem mtime/ctime fallback: none
- Report-only date influence: none

The sitemap derives lastmod only from validated frontmatter `updated ?? date`.
