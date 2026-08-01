# Finding Definition — F-10

```text
Finding ID: F-10
Priority: P3
Category: Consistency / NAP
Audit description: รูปแบบ tel: ไม่สอดคล้อง — tel:+66642579353 (1,186 หน้า) ปนกับ tel:0642579353 (803 หน้า); ทั้งคู่ใช้งานได้ แต่ควรเลือกมาตรฐานเดียว (แนะนำ E.164)
Exact evidence:
  - docs/seo-audit-2026-07-31/prioritized-fix-backlog.csv row F-10
  - docs/seo-audit-2026-07-31/full-seo-audit.md § F-10
  - docs/seo-audit-2026-07-31/content-audit.md § Trust/NAP
  - scratch/audit-schema.json telVariants (อ้างใน audit)
Affected URLs: ทุกหน้าที่มีเนื้อหา markdown ฝัง tel:0642579353 (audit: ~803 หน้า; source ปัจจุบัน 884 ไฟล์ / 948 occurrences ก่อนแก้)
Affected source files:
  - src/content/{services,areas,serviceAreas,blog}/**/*.md ที่ใช้ (tel:0642579353)
  - Chrome/CTA ใช้ site.phoneTel = +66642579353 อยู่แล้ว (Header/Footer/StickyCTA/layouts)
Current production behavior: หน้าเดียวกันมีทั้ง tel:+66642579353 (layout CTA) และ tel:0642579353 (body markdown)
Expected behavior: tel: href ทุกจุดใช้มาตรฐานเดียว tel:+66642579353 (E.164); ข้อความแสดงผล 064-257-9353 คงเดิมได้
Recommended fix from audit: เลือกมาตรฐานเดียว (แนะนำ tel:+66642579353) แล้วแก้ให้ตรงทั้งเว็บ
Dependencies: ไม่มี (แก้ใน repository ได้)
Risk: ต่ำมาก
Can be fixed in repository: yes
Requires external access: no
Requires business decision: no (audit แนะนำ E.164 ชัดเจน และ site.phoneTel ใช้ E.164 อยู่แล้ว)
Confidence: high
```
