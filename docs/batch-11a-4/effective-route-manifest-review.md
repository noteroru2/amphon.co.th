# Effective Route Manifest Review

- Production build log: Astro built 1,174 pages and explicitly generated `/บริการ/รับซื้อ-gopro/index.html`.
- NAS and lens fallback static pages were not generated.
- `vercel pull --environment=production` succeeded and verified root/framework/output settings.
- Local `vercel build --prod` could not create `.vercel/output/config.json`; Vercel CLI 56.3.1 failed on Windows with `spawn cmd.exe ENOENT`, including after explicitly setting PATH, ComSpec, and npm script shell.
- Consequently the local output-manifest fields are marked **UNVERIFIED** rather than inferred.

Production behavior supplies effective-route evidence: correct encoded lens matches before filesystem handling; malformed NAS encoded source does not match and reaches 404; missing encoded GoPro source does not match and filesystem handling serves the static artifact.

## Post-fix remote effective manifest

`vercel inspect` on deployment `dpl_Ekk6EXehJE6wEHPML4XkzMYSCygY` exposed the effective route table and confirmed both corrected patterns before filesystem handling:

- `^/%E0%B8%9A.../%E0%B8%A3...-storage-nas$` → 308 `/บริการ/รับซื้อ-nas`
- `^/%E0%B8%9A.../%E0%B8%A3...-gopro$` → 308 `/บริการ/รับซื้อ-gopro-action-camera`

This remote manifest is authoritative for the deployed fix and resolves the earlier local CLI limitation.

