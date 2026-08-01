# Manual domain switch handoff

```text
Phase A code:
DEPLOYED

Temporary redirect status:
307

Apex production:
PASS

Rollback:
READY

Manual action required:
YES
```

## SHAs

- Base: `ff6f453b0dc1a059d8c13fbf0fa365755d05315b`
- Phase A implementation: `8bf095f3951d726e53f608ad9640873a58f2da2d`
- Phase A merge: `84f083b57bb523310e763b986bc986d33cbb96e5`

## Owner action

```text
READY FOR MANUAL DOMAIN SWITCH

กรุณาไปที่:
Vercel → Project amphon-co-th → Settings → Domains

ที่ www.amphon.co.th:
เปลี่ยนจาก 301 → amphon.co.th
ให้เป็น Production domain ของโปรเจกต์นี้

ห้ามแก้ amphon.co.th
ห้ามแก้ DNS หาก Dashboard ยังแสดง Valid Configuration

เมื่อเปลี่ยนแล้วตอบ:
DOMAIN SWITCH COMPLETE
```

## Expected Dashboard after switch

```text
www.amphon.co.th: Production
amphon.co.th: Production
```

## If Edit has no Production option

1. Remove only `www.amphon.co.th`
2. Add Existing
3. Add `www.amphon.co.th`
4. Assign to Production
5. Do **not** choose Redirect
6. Wait for Valid Configuration

## After you reply

Cursor will run Phase B smoke + full redirect validation.  
Do **not** finalize 308 until that PASS.
