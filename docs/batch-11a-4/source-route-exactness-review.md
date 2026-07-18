# Source Route Exactness Review

All relevant rules use the top-level `redirects` array, `source`, `destination`, and `permanent: true`; expected Vercel status is 308. JSON parses successfully. Rules precede the trailing-slash catch-all.

## Lens control

- Literal source `/บริการ/รับซื้อเลนส์` is present.
- Correct encoded source is present.
- Destination is `/บริการ/รับซื้อเลนส์กล้อง`.
- Production returns the intended 308.

## NAS defect

- Literal source `/บริการ/รับซื้อ-storage-nas` is present.
- Destination `/บริการ/รับซื้อ-nas` is correct.
- Encoded source begins `/%E0%B8%9B%E0%B8%A3...`, which decodes to `/ปริการ/...`, not `/บริการ/...`.
- The correct first Thai character `บ` is `%E0%B8%9A`; the erroneous `ป` is `%E0%B8%9B`.
- No invisible character, whitespace, or trailing slash was found in the literal rule.

## GoPro defect

- Literal source `/บริการ/รับซื้อ-gopro` is present as the first redirect.
- Destination `/บริการ/รับซื้อ-gopro-action-camera` is correct.
- No encoded source variant is present for this service path.
- The build log confirms a static `/บริการ/รับซื้อ-gopro/index.html` artifact, and production serves it as 200 because the encoded request does not match an effective redirect first.

