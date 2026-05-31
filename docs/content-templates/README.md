# Content Markdown Templates — amphon.co.th

Copy template ไปวางใน collection ที่ถูกต้อง แล้วแก้ placeholder `[...]` ให้ครบ

| Template | วางที่ | URL ที่ได้ |
|----------|--------|------------|
| `service.md` | `src/content/services/` | `/บริการ/{slug}` |
| `area.md` | `src/content/areas/` | `/พื้นที่ให้บริการ/{slug}` |
| `serviceArea.md` | `src/content/serviceAreas/` | `/รับซื้อ/{slug}` |
| `blog.md` | `src/content/blog/` | `/blog/{slug}` |

## กฎสำคัญ

- **H1 มาจาก `title` ใน frontmatter** — ใน body ใช้ `##` ขึ้นไปเท่านั้น
- **ชื่อไฟล์ = `{slug}.md`** (ภาษาไทยได้)
- **ลิงก์ภายในไม่มี trailing slash** — `/บริการ/รับซื้อ-iphone` ✓
- **`faqs` ใน frontmatter** — ใช้กับ service / area / serviceArea เท่านั้น (ระบบสร้าง FAQPage schema + แสดง FAQ component อัตโนมัติ)
- **blog** — ใส่ Q&A ใน body ใต้ `### คำถามที่พบบ่อย` (BlogLayout ยังไม่รองรับ `faqs` ใน frontmatter)
- **`updated`** อัปทุกครั้งที่แก้เนื้อหา
- **`draft: true`** จนกว่าพร้อม publish

## หลัง save

```bash
npm run build
npm run validate:seo
```

## slug serviceArea

รูปแบบ: `{serviceSlug}-{areaSlug}`

ตัวอย่าง: `รับซื้อ-iphone-อุบลราชธานี`

`serviceSlug` และ `areaSlug` ต้องตรงกับ slug ที่มีอยู่ใน `services/` และ `areas/` แล้ว
