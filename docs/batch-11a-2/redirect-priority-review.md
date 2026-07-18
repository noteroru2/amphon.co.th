# Redirect Priority and Conflict Review (Batch 11A.2)

---

## 1. Order of Precedence
กลไกการค้นหาเส้นทางของ Vercel Production จะทำงานตามลำดับความสำคัญ (Precedence Order) ดังนี้:
1. **Edge Redirects / Rewrites (`vercel.json`):** ตรวจเช็กและส่งต่อเป็นลำดับแรกสุด
2. **Static Route matching (`dist/` html files):** ให้บริการไฟล์ HTML ที่สร้างตรงเส้นทาง
3. **Serverless Functions / SSR Routes:** จัดการผ่าน dynamic routing

---

## 2. Conflict Analysis
- **Exact vs. Dynamic clash:** กฎ Exact ใน `vercel.json` ถูกวางไว้เหนือกว่าและมีลำดับก่อนหน้า Dynamic Rule เสมอ จึงไม่มีการข้ามเส้นทาง
- **Percent encoding ภาษาไทย:** สอดคล้องและถูกต้องดี (เช่น `%E0%B8%...` แปลงกลับเป็นภาษาไทยตรงตัว)
- **Trailing Slash:** การตั้งค่า `trailingSlash: 'never'` ทำงานร่วมกับกฎเปลี่ยนเส้นทางแบบครอบคลุมใน `vercel.json` ช่วยป้องกัน Redirect Loop
