# Google Places Reviews

## สถาปัตยกรรม

หน้าแรก (`/`) แสดง Full Live Reviews แบบ click-to-load เท่านั้น เมื่อผู้ใช้กดปุ่ม “แสดงรีวิวล่าสุด” browser จึงเรียก `/api/google-reviews` หนึ่งครั้งต่อ page load และ endpoint เรียก Google Places API (New) โดยตรง

หน้าอื่นทั้งหมด เช่น `/about`, `/contact`, หน้าบริการ, หน้าพื้นที่, บทความ และ programmatic SEO แสดงเฉพาะ Compact Trust Card (`GoogleReviewsLink`) ซึ่งไม่มี code เรียก reviews API

ระบบไม่มี application-level Redis/KV counter และไม่ต้องใช้ counter storage การควบคุมจำนวน request และค่าใช้จ่ายใช้ hard quota ของ Google Cloud

## Click-to-load และ duplicate protection

- การเปิดหน้า การเลื่อนหน้า และ viewport observer ไม่เรียก API
- API เริ่มทำงานหลังผู้ใช้กดปุ่มเท่านั้น
- flag ภายในหน้าและ click listener แบบ `once` ป้องกันการกดซ้ำหรือ request ซ้ำใน page load เดียวกัน
- ไม่มี prefetch, build-time fetch หรือ background refresh

## Environment variables

ตั้งค่าใน Vercel สำหรับ environment ที่ใช้งาน:

```dotenv
GOOGLE_PLACES_API_KEY=
GOOGLE_PLACE_ID=
PUBLIC_GOOGLE_MAPS_URL=
```

`GOOGLE_PLACES_API_KEY` เป็น server-only secret ห้ามใช้ชื่อขึ้นต้นด้วย `PUBLIC_` ห้ามใส่ค่าจริงลง source, log หรือ response

`PUBLIC_GOOGLE_MAPS_URL` ต้องเป็น HTTPS Google Maps URL ที่ผ่าน allowlist เพื่อใช้เป็น fallback และลิงก์ไปยังรีวิวต้นฉบับ

ระบบ Google Reviews ไม่ใช้ `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `UPSTASH_REDIS_REST_URL` หรือ `UPSTASH_REDIS_REST_TOKEN`

## Google Cloud hard quota

ไปที่ Google Cloud Console แล้วตั้ง quota สำหรับ Places API (New) → `GetPlaceRequest`:

- GetPlaceRequest per day = **15**
- GetPlaceRequest per minute = **2**

ที่ 15 requests ต่อวัน จำนวนสูงสุดเชิงทฤษฎีสำหรับเดือน 31 วันคือประมาณ **465 GetPlace requests ต่อเดือน** ซึ่งยังต่ำกว่า free usage cap **1,000 requests ต่อเดือน**

ตัวเลขนี้ใช้ได้เมื่อ API key/project นี้ไม่ได้มี traffic อื่น หาก API Key หรือ Google Cloud project ถูกใช้กับระบบอื่น ต้องนำ usage ทั้งหมดมาคำนวณรวม เพราะ quota และ billing อาจนับร่วมกัน

Google Cloud quota เป็นตัวจำกัดการใช้งานจริง ส่วน Budget Alert เป็นเพียงระบบแจ้งเตือนและไม่หยุดค่าใช้จ่าย ควรตั้ง alert หลายระดับ เช่น 50%, 80% และ 100%

## Endpoint และ error handling

`/api/google-reviews`:

- เรียก Google Places API ได้โดยไม่ขึ้นกับ Redis/KV หรือ storage อื่น
- คง timeout และแปลง network/upstream errors เป็น response ที่ปลอดภัย
- กรณี quota exceeded แสดงข้อความสุภาพและไม่ส่ง upstream error body เต็มไป browser
- กรณี Google error, quota exceeded, timeout หรือ missing configuration ส่ง Google Maps fallback URL เมื่อมีการตั้งค่า
- ไม่พิมพ์ API key ลง log และไม่ส่ง API key ไป browser

ทุก response ใช้:

```http
Cache-Control: no-store, max-age=0
```

## นโยบายไม่ cache รีวิว

ระบบไม่ cache หรือบันทึก review content ใน CDN, server storage, Redis/KV, browser cache, Local Storage, Session Storage, IndexedDB, static file หรือ build artifact การควบคุมค่าใช้จ่ายอาศัย click-to-load และ Google Cloud hard quota ไม่ใช่การเก็บสำเนารีวิว

## SEO และ schema

ข้อมูลรีวิวเป็น client-loaded content เท่านั้น ไม่มีการเพิ่ม `aggregateRating`, `Review` schema หรือ JSON-LD จากข้อมูลรีวิว การแก้ระบบนี้ต้องไม่เปลี่ยน metadata, canonical, sitemap หรือ structured data เดิม

## การทดสอบ

```bash
npm run test:google-reviews
npx astro check
npm run build
npm run validate:seo
```

Automated tests ใช้ mock เท่านั้น ไม่เรียก Google API จริง และตรวจว่า:

- endpoint ไม่ต้องมี counter storage หรือ Redis/KV env
- หน้าแรกไม่ request ก่อนคลิก และ request ได้ครั้งเดียวหลังคลิก
- การกดซ้ำไม่เพิ่ม request
- quota/error/timeout มี Google Maps fallback
- response ทุกกรณีเป็น no-store
- ไม่มี review caching
- หน้าอื่นไม่เรียก API
- ไม่มี rating/review schema เพิ่มขึ้น
