# Batch 2.1 QA Report — Contract-Compatible Post-Recovery

วันที่อัปเดต: 2026-07-27

ไฟล์นี้เป็นรายงานชื่อมาตรฐานสำหรับ Batch 2.2 contract ส่วน `qa-report.md` เป็นรายงานต้นฉบับ ณ เวลาจบ Batch 2.1 และยังเก็บไว้โดยไม่ลบ

Verdict: **PASS WITH WARNING**

## Technical gate หลัง Batch 2.1.1

- `npx astro sync`: exit 0
- `npx astro check`: exit 0, 0 errors, 46 pre-existing hints
- `npm run build`: exit 0 ใน diagnostic worktree path ASCII ที่ใช้ source และ lockfile เดียวกัน
- Public output: `dist/client`
- HTML: 1,186 files
- Asset/non-HTML/non-XML files: 197 files
- Sitemap: 2 files, parse ผ่านทั้ง `sitemap-index.xml` และ `sitemap-0.xml`
- Sitemap URLs: 1,179
- `npm run qa:sitemap`: exit 0
- Batch 2.1 regression: 14/14 routes ผ่าน route, sitemap, indexability, canonical, H1, JSON-LD และ internal-link checks

## Warning เดิมนอก scope

- Full-site internal-link checker พบ 17 links ไปยัง route ที่ไม่มี built page ทั้งหมดอยู่นอก 14 MacBook target routes
- Full-site SEO validator พบ 2 H1 ใน `src/content/blog/วิธีเช็กรุ่น-ipad-ว่าเป็น-gen-ไหน.md` ซึ่งเป็นไฟล์ที่คำสั่งห้ามแตะ
- Claim-risk checker พบ 1 จุดใน `src/content/services/รับซื้อโทรศัพท์เสีย.md:145`
- Working directory หลักมี path ภาษาไทยและทำให้ Windows native process จบ `0xC0000409`; source เดียวกันบน path ASCII ผ่าน exit 0

รายละเอียดคำสั่งและหลักฐานอยู่ใน `../batch-2-1-1-validation-recovery/`
