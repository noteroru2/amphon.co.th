# Vercel Runtime Verification (Batch 11A.2)

---

## 1. Status and Constraints
**สถานะการจำลอง Vercel dev:** ไม่สามารถรันในเครื่องได้

### ข้อจำกัดหลัก:
1. **Missing Project Association:** โครงการในเครื่องยังไม่ได้ทำการเชื่อมต่อกับ Vercel (ไม่มีโฟลเดอร์ `.vercel`).
2. **Interactive Auth Block:** การรันคำสั่ง `npx vercel dev` ต้องอาศัยการเข้าสู่ระบบผ่านเว็บบราวเซอร์ (OAuth / Interactive Logon) ซึ่งตัวควบคุมการทำงานใน Sandbox ไม่สามารถทำรายการแบบโต้ตอบแบบมีหน้าต่างได้

---

## 2. Theoretical Verification of vercel.json
พฤติกรรมการทำงานของระบบ Vercel Edge ในโหมดจำลอง (Vercel dev) และ Production จะใช้ข้อมูลตรงตามกฎ `vercel.json` โดยเมื่อ Client ร้องขอ URL ต้นทาง เซิร์ฟเวอร์ของ Vercel จะตอบสนองด้วยสถานะ **301 Permanent Redirect** พร้อมระบุ `Location` ไปหน้าปลายทางใหม่ทันทีโดยไม่เข้าสู่ขั้นตอนการอ่านไฟล์หรือรันฟังก์ชันของแอพพลิเคชัน
