# Owner Decision Lock — Batch 12F.2

```text
Owner decision date:
2026-08-01

URLs covered:
134

Decision groups:
7

Owner strategy:
KEEP_EXISTING_URLS_AND_IMPROVE

Merge approved:
0

Redirect approved:
0

Noindex approved:
0

Remove route approved:
0

URLs retained:
134
```

## Reason

เจ้าของธุรกิจสร้างโครง URL และ SEO Landing Pages ไว้รองรับแล้ว จึงต้องการเก็บ URL เดิมทั้งหมด

Hub ใช้เป็นหน้าหลักของหมวด ส่วนหน้ารองใช้รองรับพื้นที่และ Long-tail Intent

งานถัดไปต้องเพิ่ม Unique Value และแก้ข้อความให้ตรงข้อจำกัดทางธุรกิจ โดยไม่เปลี่ยน URL Architecture

## Owner answers (service)

| Group | Answer | Meaning in this lock |
|---|---|---|
| BD-01 | C | บริการมีเงื่อนไข — **ไม่** Merge/Retire |
| BD-02 | C | บริการรายกรณี — **ไม่** Merge/Retire |
| BD-03 | B | ให้บริการจริง — **ไม่** Merge |
| BD-04 | B | ให้บริการจริง — **ไม่** Merge |
| BD-05 | C | บริการมีเงื่อนไข (Rack รายกรณี) — **ไม่** Merge/Retire |
| BD-06 | B | ให้บริการจริง — **ไม่** Merge |
| BD-07 | B | ให้บริการจริง — **ไม่** Merge |

B = ยืนยันบริการจริง · C = ยืนยันบริการจริงแบบมีข้อจำกัด · Page strategy แยกต่างหากและถูกล็อกเป็น `KEEP_EXISTING_URLS_AND_IMPROVE`

Technical recommendation เดิม `MERGE_TO_HUB` ถูก **supersede** โดย Owner Strategy

## Hubs (Topic Hub only — not redirect targets)

- `/บริการ/รับซื้อเครื่องใช้ไฟฟ้า`
- `/บริการ/รับซื้อทีวี`
- `/บริการ/รับซื้อโดรน`
- `/บริการ/รับซื้ออุปกรณ์-network`
- `/บริการ/รับซื้อ-server`
- `/บริการ/รับซื้อ-ups`
- `/บริการ/รับเหมาประมูลอุปกรณ์ไอที`

## Prohibition

```text
ห้ามเปลี่ยนกลยุทธ์นี้เป็น Merge, Redirect, Noindex
หรือ Remove Route โดยไม่มี Owner Approval ใหม่
```

## Outside this lock

Remaining MERGE **19** (`G-SA-รับซื้อเฟอร์นิเจอร์`) = `REQUIRES SEPARATE OWNER REVIEW` — ไม่รวมใน BD-01–BD-07
