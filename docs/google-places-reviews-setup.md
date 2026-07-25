# Google Places Reviews

## 1. Architecture ใหม่

หน้าแรกแสดงส่วน Live Reviews แบบ click-to-load เท่านั้น เมื่อผู้ใช้กด “แสดงรีวิวล่าสุด” browser จึงเรียก `/api/google-reviews` หนึ่งครั้ง endpoint ต้องผ่านตัวนับรายวันแบบ atomic ก่อนจึงจะเรียก Places API (New)

หน้าอื่นทั้งหมดใช้ `GoogleReviewsLink` ซึ่งไม่เรียก API และไม่แสดงคะแนนหรือจำนวนรีวิวแบบ hard-coded

## 2. Full Live Reviews เฉพาะหน้าแรก

`GoogleReviews` render เฉพาะ `/` ส่วน `/about`, `/contact`, หน้าบริการ, หน้าพื้นที่, บทความ และ programmatic SEO ใช้ Compact Trust Card พร้อมระบุว่าหน้าร้านหลักอยู่จังหวัดอุบลราชธานี

## 3. Click-to-load

- การเปิดหน้าและการเลื่อนหน้าไม่เรียก API
- ผู้ใช้ต้องกดปุ่ม “แสดงรีวิวล่าสุด”
- ปุ่มถูกปิดระหว่างโหลด และหนึ่ง page load เรียกได้สูงสุดหนึ่งครั้ง
- response และข้อมูลรีวิวไม่ถูกบันทึกใน browser storage

## 4. Application daily limit

ระบบอนุญาต Google Places API สูงสุด 10 requests ต่อวัน ช่วงวันคือ 00:00–23:59 ตาม `Asia/Bangkok` request ลำดับ 1–10 ได้รับอนุญาต ส่วน request ถัดไปถูก block ก่อนออกไป Google

## 5. Storage สำหรับ daily counter

ใช้ Vercel KV หรือ Upstash Redis REST API ผ่าน Redis `EVAL` เพื่อทำ check-and-increment พร้อม expiry ใน operation เดียว จึง atomic ระหว่าง Vercel Function instances

Storage เก็บเฉพาะ key วันที่แบบ `google-reviews:YYYY-MM-DD`, count และ TTL ไม่มีเนื้อหารีวิว คะแนน ชื่อผู้เขียน หรือ response จาก Google

ถ้า storage ไม่ได้ตั้งค่าหรือใช้งานไม่ได้ ระบบ fail-closed และไม่เรียก Google

## 6. Environment variables

ตั้งใน Vercel สำหรับ Production/Preview ตามต้องการ แล้ว redeploy:

```dotenv
GOOGLE_PLACES_API_KEY=
GOOGLE_PLACE_ID=
PUBLIC_GOOGLE_MAPS_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

รองรับชื่อ `UPSTASH_REDIS_REST_URL` และ `UPSTASH_REDIS_REST_TOKEN` เป็น fallback ด้วย ห้ามเติมค่าจริงลง source และห้ามเปลี่ยน API key เป็นตัวแปร `PUBLIC_`

`PUBLIC_GOOGLE_MAPS_URL` ต้องเป็น HTTPS ของ Google Maps ที่ผ่าน allowlist

## 7. Google Cloud quota

ตั้ง quota เฉพาะ Places API (New) → GetPlaceRequest:

- Requests per day: **15**
- Requests per minute: **2**

Application limit คือ 10 ครั้ง/วัน ส่วนต่าง 5 ครั้งเป็น safety margin สำหรับ manual test หรือความผิดพลาด Google Cloud quota เป็นด่านสุดท้ายและต้องตั้งด้วยตนเอง

## 8. Budget Alert

ไปที่ Google Cloud Billing → Budgets & alerts สร้างงบและแจ้งเตือนหลายระดับ เช่น 50%, 80%, 100% โปรดทราบว่า Budget Alert แจ้งเตือนเท่านั้น ไม่หยุดค่าใช้จ่าย

## 9. Cache policy

ทุก response ของ `/api/google-reviews` ใช้:

```http
Cache-Control: no-store, max-age=0
```

ไม่มี `s-maxage`, `stale-while-revalidate`, CDN cache, server review cache, browser cache, static snapshot หรือ build-time fetch

## 10. ทำไมไม่ cache รีวิว

Places API จำกัดการ pre-fetch, cache และจัดเก็บ Places content นอกข้อยกเว้นที่ Google ระบุ ระบบนี้จึงควบคุมต้นทุนด้วย click-to-load และตัวนับ metadata แทนการเก็บรีวิว

## 11. Fallback เมื่อครบ daily limit

endpoint ตอบ `429`, `Retry-After`, `Cache-Control: no-store` และ Google Maps URL ที่ตรวจสอบแล้ว หน้าเว็บแสดงข้อความสุภาพพร้อมลิงก์ไปดูรีวิวบน Google Maps โดยไม่แสดงคะแนนปลอมและไม่เปิดเผยจำนวน request ที่ใช้ไป

## 12. ทดสอบโดยไม่ใช้ API จริง

```bash
npm run test:google-reviews
```

Automated tests ใช้ mock Google fetch และ mock counter storage ห้ามใช้ credential จริง

## 13. ตรวจว่า key ไม่รั่ว

ค้นหา source และ `dist/client` หลัง build โดยตรวจว่าไม่มีค่าจริงของ API key ห้ามพิมพ์ key ใน log, report หรือ browser response

## 14. Reset counter กรณีฉุกเฉิน

ลบเฉพาะ Redis key ของวันปัจจุบัน เช่น `google-reviews:2026-07-25` ผ่าน console ของ storage ห้ามลบ key อื่น และควรทำเฉพาะเมื่อเข้าใจว่าจะเปิดโควตา application ใหม่ในวันนั้น

## 15. Timezone

การสร้าง date key, expiry และ `Retry-After` อ้างอิง `Asia/Bangkok` โดยวันใหม่เริ่มเวลาเที่ยงคืนประเทศไทย

## 16. หน้าอื่นไม่ทำให้เกิด Places API request

หน้าอื่น render เฉพาะ `GoogleReviewsLink` ไม่มี client script ที่ fetch `/api/google-reviews` ดังนั้นการเข้าชมหน้าเหล่านั้นไม่ใช้โควตา Places API
