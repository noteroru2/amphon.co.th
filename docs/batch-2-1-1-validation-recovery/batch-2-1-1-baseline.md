# Batch 2.1.1 Baseline

วันที่: 2026-07-27 (Asia/Bangkok)

## Repository

- Starting branch: `batch-2-1-macbook-hub-strengthening`
- Recovery branch: `batch-2-1-1-validation-recovery`
- Starting SHA: `aba75eebac2e9d4b3a4d05d0a9bb281ca45da669`
- Batch 2.1 SHA: `aba75ee`
- `git merge-base --is-ancestor aba75ee HEAD`: exit 0
- Existing modified files: none
- Existing staged files: none

## Existing untracked files preserved

- `docs/batch-2-macbook-cannibalization-audit/`
- `scratch/`
- `sitewide-deep-audit.md`
- `verify_production_results.json`

ไฟล์เหล่านี้มีอยู่ก่อนเริ่ม Batch 2.1.1 และไม่ได้ถูกแก้ ลบ ย้าย หรือ stage

## Initial blockers

- `astro check`: TS2322 ที่ `src/pages/วิธีการรับซื้อ.astro:104:3`
- Native build exit: `-1073740791` (`0xC0000409`) หลัง `Rearranging server assets`
- Public output ที่ถูกต้อง: `dist/client`
- Sitemap files ใน build ที่ crash: 0
- QA helper เดิมใช้ `dist` เป็น public root จึงตีความ route เป็น `/client/...`
- Sitemap checker เดิมสามารถ PASS เมื่อพบ sitemap 0 ไฟล์

## Scope protection

- ไม่เริ่ม Batch 2.2
- ไม่แก้ MacBook content
- ไม่แก้ iPad, iPhone หรือ service-area content
- ไม่เปลี่ยน dependency หรือ lockfile
- ไม่สร้าง redirect, noindex หรือ slug ใหม่
- ไม่ merge และไม่ deploy
