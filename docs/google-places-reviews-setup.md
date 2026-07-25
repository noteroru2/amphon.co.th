# ตั้งค่า Google Places Reviews

ระบบใช้ `GOOGLE_PLACES_API_KEY` และ `GOOGLE_PLACE_ID` เฉพาะฝั่งเซิร์ฟเวอร์ ห้ามเปลี่ยนชื่อเป็นตัวแปรที่ขึ้นต้นด้วย `PUBLIC_` และห้ามใส่ค่าจริงใน source code

## ตั้งค่าในเครื่อง

1. เปิด Places API (New) ใน Google Cloud project ที่เปิด Billing แล้ว
2. ค้นหา Place ID ด้วย `GOOGLE_PLACES_API_KEY=... npm run find:google-place -- "บริษัท อำพล เทรดดิ้ง อุบลราชธานี"` แล้วตรวจชื่อและที่อยู่ก่อนใช้งาน
3. คัดลอก `.env.example` เป็น `.env.local` และใส่:

   ```dotenv
   GOOGLE_PLACES_API_KEY=
   GOOGLE_PLACE_ID=
   PUBLIC_GOOGLE_MAPS_URL=
   ```

4. รันเว็บและเปิด `/api/google-reviews` โดยต้องไม่เห็น API key ใน response, browser source, network request headers ฝั่ง browser หรือ build output

Text Search (New) ที่ helper ใช้เป็นส่วนหนึ่งของ Places API (New) และขอเฉพาะ Place ID, ชื่อ และที่อยู่ผ่าน field mask

## ตั้งค่าใน Vercel

ไปที่ Project → Settings → Environment Variables แล้วเพิ่มตัวแปรทั้งสาม เลือก Production และ Preview; เลือก Development ด้วยเมื่อใช้ Vercel Development Environment จากนั้น Redeploy เพื่อให้ค่ามีผล `PUBLIC_GOOGLE_MAPS_URL` เป็นลิงก์สาธารณะของ listing เท่านั้น ระบบรับเฉพาะ HTTPS บนโดเมน Google Maps ที่รองรับและจะซ่อนปุ่ม Google Maps หากไม่ได้ตั้งค่าหรือ URL ไม่ผ่านการตรวจสอบ

จำกัด API key ด้วย API restriction ให้เรียกได้เฉพาะ Places API (New) เท่านั้น Vercel Server Function ทั่วไปไม่มี static outbound IP จึงอาจต้องตั้ง Application restriction เป็น None; ให้ลดความเสี่ยงด้วย server-only environment variable, quota ที่เหมาะกับจำนวนผู้เข้าชม และ Billing Budget Alert ใน Google Cloud

หลังตั้งค่า ให้ตรวจ `/api/google-reviews` ว่าตอบ JSON ปกติ และค้นหา repository/build output เพื่อยืนยันว่าไม่มีค่าจริงของ key รั่ว ห้ามพิมพ์ key ลง log หรือรายงาน

## ข้อจำกัดด้านนโยบายและ SEO

- ข้อมูลรีวิวโหลดเมื่อ section เข้าใกล้ viewport และ response ใช้ `Cache-Control: no-store`
- Full Live Reviews ใช้เฉพาะหน้าแรก, about, contact และหน้าบริการหลักใน whitelist 6 หน้า หน้าอื่นใช้ Compact Trust Card ที่ไม่เรียก API
- ห้ามเก็บหรือคัดลอกรีวิวลงไฟล์/ฐานข้อมูลถาวร
- ห้ามใส่ component ที่เรียก API ในทุกหน้า Programmatic SEO; หน้าเหล่านั้นใช้ลิงก์ trust ไป Google Maps
- ห้ามเพิ่ม `aggregateRating` หรือ `review` schema ให้ Organization/LocalBusiness ของธุรกิจเอง
- คงลำดับและข้อความที่ Google ส่งมา และต้องแสดง attribution, ผู้เขียน, ลิงก์ต้นฉบับ และลิงก์รายงานเมื่อ API มีข้อมูล
