# Batch 2.1 MacBook Hub Strengthening — Contract-Compatible Final Report

ไฟล์นี้เป็น final report ชื่อมาตรฐานตาม Batch 2.2 contract ส่วน `final-report.md` คือรายงานต้นฉบับและยังคงเก็บไว้

Verdict หลัง Batch 2.1.1: **PASS WITH WARNING**

Batch 2.1 content และ internal-link mapping ยังคงเดิมครบ 14 routes ไม่มีการแก้ MacBook content เพิ่มใน recovery งาน Batch 2.1.1 แก้เฉพาะ:

- nullable FAQ schema type ที่ `src/pages/วิธีการรับซื้อ.astro`
- sitemap filter สำหรับ redirect source ที่มีอยู่เดิม
- QA output-root จาก `dist` เป็น public output `dist/client`
- sitemap checker ให้ fail จริงเมื่อไม่พบ sitemap
- targeted Batch 2.1 regression validator

ผลหลัง recovery:

- Astro check: 0 errors
- Production build: exit 0 บน ASCII worktree
- Sitemap: 2 files, 1,179 URLs, XML parse ผ่าน
- MacBook routes: 14/14 อยู่ใน sitemap
- MacBook broken internal links: 0
- MacBook canonical/H1/JSON-LD errors: 0
- ไม่มี dependency หรือ lockfile เปลี่ยน
- ไม่มี iPad, iPhone หรือ service-area content ถูกแก้
- ไม่มี merge และไม่มี deploy

คำเตือนที่เหลือเป็น full-site issues เดิมนอก scopeและบันทึกไว้ใน `batch-2-1-qa-report.md`
