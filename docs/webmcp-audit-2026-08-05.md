# WebMCP Audit — amphon.co.th

**Date:** 2026-08-05  
**Scope:** Audit / report only — no code changes, no commit, no push, no deploy  
**Production URL:** https://amphon.co.th/

---

## Executive summary

| Lighthouse item (TH / EN) | Verdict | Evidence | Business impact | Action required |
|---|---|---|---|---|
| ความครอบคลุมของแบบฟอร์ม WebMCP / Form coverage (`webmcp-form-coverage`) | **NOT_APPLICABLE** | Source + dist + Production มี `<form>` = **0**; Lighthouse 13.4.1 → `scoreDisplayMode: notApplicable` | ไม่กระทบ SEO / Lighthouse pass-ratio ปัจจุบัน (audit เป็น informational / N/A) | ไม่จำเป็นต้องเพิ่ม declarative form attributes ตอนนี้ เพราะยังไม่มี HTML form |
| ลงทะเบียนเครื่องมือ WebMCP แล้ว / Registered tools (`webmcp-registered-tools`) | **NOT_APPLICABLE** (พร้อมหมายเหตุ: ยังไม่ได้ติดตั้ง WebMCP) | Repo ไม่มี `document.modelContext` / `registerTool` / `toolname`; LH → N/A | ไม่มี Agent tool ที่ไซต์เปิดเอง; conversion ยังพึ่ง LINE / โทร | พิจารณา Imperative tools แบบ read-only ในอนาคตเท่านั้น (แผนด้านล่าง) |
| สคีมา WebMCP ถูกต้อง / Schema validity (`webmcp-schema-validity`) | **NOT_APPLICABLE** | ไม่มี Tool → ไม่มี schema ให้ validate; LH → N/A | ไม่มี schema error | ไม่มีงานแก้ schema |

### Mapping กับชื่อในโจทย์ Lighthouse

| ชื่อในโจทย์ | Audit ID ที่พบใน Lighthouse 13.4.1 | หมายเหตุ |
|---|---|---|
| Forms missing declarative WebMCP | `webmcp-form-coverage` (title: “WebMCP form coverage”) | Docs Chrome ใช้ชื่อ “Forms missing declarative WebMCP”; CLI ID ไม่ใช่ `forms-missing-declarative-webmcp` |
| Registered WebMCP tools | `webmcp-registered-tools` (title: “WebMCP tools registered”) | — |
| WebMCP schema validity | `webmcp-schema-validity` (title: “WebMCP schemas are valid”) | — |

---

## Final verdict

**NOT_APPLICABLE**

เหตุผลหลัก:

1. เว็บไซต์ **ไม่มี `<form>` HTML** สำหรับประเมินราคา / ติดต่อ / นัดรับ — ช่องทางหลักคือ **LINE @webuy**, โทรศัพท์, และลิงก์ภายนอก  
2. Repository **ยังไม่ได้ติดตั้ง WebMCP** (ไม่มี Declarative attributes และไม่มี Imperative `document.modelContext`)  
3. Lighthouse Agentic Browsing audits ทั้งสามรายการบน Production ได้ **`notApplicable`** และ **weight = 0** จึงไม่ทำให้ fail SEO score  
4. ไม่พบ User action บนหน้าเว็บที่เหมาะและปลอดภัยพอจะบังคับเปิดเป็น Agent tool ในสถานะปัจจุบันโดยไม่สร้าง form/ธุรกรรมใหม่

> **ไม่ใช่ FAIL** — การไม่มี WebMCP tool ไม่ถือว่า fail เมื่อไม่มี form ที่ควร expose  
> **ไม่ใช่ MISSING_WEBMCP แบบเร่งด่วน** — ไม่มี form ที่ขาด `toolname`/`tooldescription` เพราะไม่มี form เลย  
> WebMCP audits เป็น **Agentic Browsing / informational** ไม่ใช่ SEO core metrics

---

## Environment

| Item | Value |
|---|---|
| Branch | `main` |
| HEAD SHA | `7bd2be2caa2db44e9409d1cce766a0bd850d0e89` |
| Git working tree | Clean relative to HEAD for product code; audit artifacts may exist untracked (`webmcp-lighthouse.json`, temp scripts) — **ไม่ได้ commit** |
| Node.js | `v24.14.1` |
| Astro | `6.4.2` (from `npm ls`) |
| Lighthouse (npx) | `13.4.1` |
| Chrome | `151.0.7922.76` (HeadlessChrome/151.0.0.0 ใน LH run) |
| Production URL | `https://amphon.co.th/` |
| LH category | `agentic-browsing` มีอยู่; WebMCP audit IDs: `webmcp-form-coverage`, `webmcp-registered-tools`, `webmcp-schema-validity` |
| Chrome WebMCP support ในรอบนี้ | **ไม่ได้ยืนยันว่า origin trial / flag เปิด** — LH gatherer คืน N/A ให้ทั้งสาม audits; DevTools Application → WebMCP panel **ไม่ได้เปิดตรวจด้วยมือในรอบนี้** → runtime panel = **UNVERIFIABLE** |
| Flag / Early Preview | ตามเอกสาร Chrome/Lighthouse: WebMCP อาจต้อง Origin Trial หรือ flag (เช่น DevTools/WebMCP testing) — **ไม่ได้เปิด flag เพิ่ม** ตามข้อห้ามไม่เปลี่ยน environment เพื่อให้ audit ผ่าน |

คำสั่งที่ใช้ (ไม่แก้ dependency ของโปรเจกต์):

```bash
npx lighthouse@13.4.1 https://amphon.co.th/ \
  --only-audits=webmcp-form-coverage,webmcp-registered-tools,webmcp-schema-validity \
  --output=json --output-path=./webmcp-lighthouse.json
```

---

## Inventory

| Metric | Count |
|---|---|
| Form ทั้งหมด (source `src/`, `public/`) | **0** |
| Form ใน `dist/client/**/*.html` | **0** |
| Form บน Production (หน้าแรก, contact, โน๊ตบุ๊ค, คอมพิวเตอร์, MacBook, รับซื้อสินค้าไอที) | **0** |
| Form ที่ควรเปิดเป็น Tool (`SHOULD_EXPOSE`) | **0** |
| Form ที่ไม่ควรเปิด (`SHOULD_NOT_EXPOSE`) | **0** (ยังไม่มี form; ดูแผนสำหรับ form อนาคต) |
| `NOT_A_REAL_FORM` UI controls | **1** (hamburger checkbox นอก `<form>`) |
| Declarative Tools (`toolname` + `tooldescription`) | **0** |
| Imperative Tools (`document.modelContext.registerTool`) | **0** |
| Schema errors | **0** (ไม่มี schema) |
| Schema warnings | **0** |

---

## Source scan — WebMCP APIs

ค้นทั้ง repo ด้วย: `WebMCP`, `webmcp`, `modelContext`, `document.modelContext`, `navigator.modelContext`, `registerTool`, `unregisterTool`, `getTools`, `executeTool`, `toolname`, `tooldescription`, `toolparamdescription`, `inputSchema`, `outputSchema`, `structuredContent`

| Finding | Result |
|---|---|
| ไฟล์ที่ match | **ไม่มี** |
| Declarative WebMCP | **ไม่พบ** |
| Imperative WebMCP (`document.modelContext`) | **ไม่พบ** |
| Legacy `navigator.modelContext` | **ไม่พบ** |
| Library / polyfill | **ไม่พบ** |
| Feature detection / error handling สำหรับ WebMCP | **ไม่พบ** (ไม่มีโค้ด WebMCP) |

### สิ่งที่พบแทน (ไม่ใช่ WebMCP)

| File | Line | Role |
|---|---|---|
| `src/components/Header.astro` | 32 | `<input type="checkbox" id="nav-toggle">` สำหรับเมนูมือถือแบบ CSS-only — **ไม่อยู่ใน `<form>`** → `NOT_A_REAL_FORM` |
| `src/components/CTAContact.astro` | 24–40 | CTA ไป LINE / tel / Facebook — ไม่ใช่ form submit |
| `src/pages/contact.astro` | ทั้งหน้า | ช่องทางติดต่อผ่าน LINE QR / โทร — ไม่มี form |
| `src/layouts/ServiceLayout.astro` / `AreaLayout.astro` | sidebar CTA | “ติดต่อประเมินราคา” ผ่าน LINE |

---

## Form inventory table

| Route | Source file | Form purpose | Submit method | toolname | tooldescription | เหมาะเป็น WebMCP Tool หรือไม่ | สถานะ |
|---|---|---|---|---|---|---|---|
| *(sitewide)* | — | ไม่มี HTML form | — | — | — | — | **ไม่มี form** |
| `/` และทุก layout | `Header.astro:32` | เปิด/ปิดเมนู (checkbox) | ไม่ submit | — | — | **D. NOT_A_REAL_FORM** | ไม่ใช่ form |
| `/contact` | `contact.astro` | ติดต่อประเมินราคา | External LINE / tel | — | — | **C. SHOULD_NOT_EXPOSE** หากสร้างเป็น form ส่งข้อมูลจริงในอนาคต | ปัจจุบันไม่มี form |
| Service / area pages | `CTAContact.astro`, layouts | ประเมินราคา / นัดรับ | External LINE | — | — | **C. SHOULD_NOT_EXPOSE** สำหรับ form ส่งรูป/PII/นัดหมายจริง | ปัจจุบันไม่มี form |
| Admin / login / upload / search filter | — | ไม่พบใน repo | — | — | — | — | ไม่มี |

### การจัดประเภท (ถ้าจะมี form ในอนาคต)

| Class | ตัวอย่างบนธุรกิจนี้ | คำแนะนำ |
|---|---|---|
| A. SHOULD_EXPOSE | อ่านข้อมูลสาธารณะ เช่น “รายชื่อบริการ”, “จังหวัดที่ให้บริการ”, “ขั้นตอนการขาย” (Imperative read-only) | ปลอดภัยถ้าไม่มี side effect |
| B. OPTIONAL | ค้นหาบทความ / กรองหมวดบริการแบบ client-only | ประโยชน์ปานกลาง |
| C. SHOULD_NOT_EXPOSE | ประเมินราคาที่ส่งรูป+ข้อมูลติดต่อ, นัดรับ, อัปโหลด, ยืนยันขาย, ส่งข้อความหาลูกค้า | ต้องมี human confirmation; ไม่เปิด Agent ทำธุรกรรมเอง |
| D. NOT_A_REAL_FORM | hamburger checkbox | ไม่ทำ WebMCP |

---

## Step 4 — Form coverage verdict

**Status: NOT_APPLICABLE**

- ไม่มี Form กลุ่ม `SHOULD_EXPOSE`  
- จึงไม่มีรายการที่ “ขาด `toolname`/`tooldescription`”  
- **อย่าตีความว่าขาด WebMCP เพียงเพราะไม่มี attribute** — เพราะไม่มี form ให้ annotate

---

## Step 5 — Registered tools verdict

**Status: NO_TOOLS_REGISTERED** ในระดับ source/build/production HTML  
**Runtime DevTools panel: UNVERIFIABLE** (ไม่ได้เปิด Chrome DevTools Application → WebMCP ด้วยมือ)  
**Lighthouse gatherer: NOT_APPLICABLE**

| Tool name | Type | Route | Description | Schema status | Invocation status |
|---|---|---|---|---|---|
| *(none)* | — | — | — | — | — |

สรุปรวมสำหรับรายการนี้ตามเกณฑ์โจทย์: **NOT_APPLICABLE** (สอดคล้อง LH) โดยระบุเพิ่มว่าไซต์ **ยังไม่ได้ติดตั้ง WebMCP**

---

## Step 6 — Schema validity verdict

**Status: NOT_APPLICABLE**

| Tool | Severity | Problem | Source file/line | Runtime evidence | Recommended fix |
|---|---|---|---|---|---|
| — | — | ไม่มี Tool | — | LH `webmcp-schema-validity` = N/A | ไม่ต้องแก้ schema |

---

## Build & static verification

| Check | Result |
|---|---|
| `npm run test:google-reviews` | 21/21 pass |
| `npx astro check` | 0 errors |
| `dist/client` form count | **0** |
| form with `toolname` | **0** |
| form with `tooldescription` | **0** |
| both attributes | **0** |
| required fields missing name | **0** |
| Imperative WebMCP in JS bundles (string scan) | **ไม่พบ** ใน HTML dist; ไม่พบใน source |

Source vs Build: ตรงกัน — ไม่มี form ทั้งสองฝั่ง

---

## Production verification

| Page | HTTP | forms | toolname | tooldesc | WebMCP signals | LINE CTA |
|---|---|---|---|---|---|---|
| `/` | 200 | 0 | 0 | 0 | false | yes |
| `/contact` | 200 | 0 | 0 | 0 | false | yes |
| `/บริการ/รับซื้อโน๊ตบุ๊ค` | 200 | 0 | 0 | 0 | false | yes |
| `/บริการ/รับซื้อคอมพิวเตอร์` | 200 | 0 | 0 | 0 | false | yes |
| `/บริการ/รับซื้อ-macbook` | 200 | 0 | 0 | 0 | false | yes |
| `/รับซื้อสินค้าไอที` | 200 | 0 | 0 | 0 | false | yes |

- Raw HTML: ไม่มี `<form>`, ไม่มี `toolname` / `modelContext`  
- Runtime DOM หลัง JS: ไม่มีหลักฐานว่ามีการสร้าง form แบบ dynamic จาก source ที่ scan  
- Console / Tool registration errors: ไม่ได้เก็บ Chrome DevTools console ในรอบนี้ (UNVERIFIABLE สำหรับ panel)  
- **ไม่ได้** ส่งแบบฟอร์มจริง / สร้าง lead / อัปโหลด / นัดหมาย

---

## Lighthouse Agentic Browsing — Production

| Field | Value |
|---|---|
| Lighthouse version | 13.4.1 |
| Chrome | HeadlessChrome/151.0.0.0 |
| Category | `agentic-browsing` (audit weights ของ WebMCP ทั้งสาม = **0**) |

| Audit ID | Title | Score | Display mode | Details items |
|---|---|---|---|---|
| `webmcp-form-coverage` | WebMCP form coverage | `null` | `notApplicable` | none |
| `webmcp-registered-tools` | WebMCP tools registered | `null` | `notApplicable` | none |
| `webmcp-schema-validity` | WebMCP schemas are valid | `null` | `notApplicable` | none |

หมายเหตุ CLI:

- Audit ID `forms-missing-declarative-webmcp` **ไม่มี** ใน Lighthouse 13.4.1 — ใช้ `webmcp-form-coverage` ตาม `--list-all-audits`  
- บางรอบก่อนหน้าติด `EPERM` บน Chrome temp; รอบนี้รันสำเร็จด้วย `--user-data-dir` ใน workspace

---

## Detailed findings

### P0 Critical
ไม่มี

### P1 High
ไม่มี (ไม่มี schema ที่พัง / ไม่มี tool ที่ expose ธุรกรรมโดยไม่ยืนยัน)

### P2 Medium
ไม่มีสำหรับ WebMCP compliance ปัจจุบัน

### P3 Low
1. **ยังไม่มี WebMCP ใด ๆ** — หากอนาคตต้องการ Agentic browsing readiness ควรเริ่มจาก Imperative read-only tools ไม่ใช่ form ส่งขาย  
2. Docs/Lighthouse ยังอ้าง declarative form attributes — เมื่อมี form จริงในอนาคตต้องออกแบบ class C ให้มี human confirmation

### Informational
1. Conversion path เป็น **off-site messaging (LINE)** ซึ่ง Agent ไม่ควร auto-submit ข้อมูลลูกค้า  
2. WebMCP audits เป็น **informational / N/A** — **ห้ามสร้างความเร่งด่วนเกินจริง** หรือผูกกับ SEO ranking โดยตรง  
3. `Header.astro` checkbox ไม่ใช่ form และไม่ควรถูกนับใน form coverage  
4. API ปัจจุบันที่ควรใช้หาก implement คือ **`document.modelContext`** ไม่ใช่ `navigator.modelContext` (legacy / deprecated)

---

## Evidence checklist

| Evidence type | Status |
|---|---|
| Source grep WebMCP keywords | 0 matches |
| Source `<form>` count | 0 |
| `Header.astro:32` checkbox | documented |
| Dist HTML form count | 0 |
| Production HTML scan (6 URLs) | 0 forms |
| Lighthouse 13.4.1 JSON (`webmcp-lighthouse.json`) | N/A × 3 |
| DevTools WebMCP panel | UNVERIFIABLE (manual not run) |

---

## Recommended implementation plan (แผนเท่านั้น — ห้ามลงมือในรอบนี้)

### 1. Minimum safe implementation
- **ไม่บังคับ** ติดตั้ง WebMCP ตอนนี้  
- ถ้าต้องการ readiness: เพิ่ม Imperative tools แบบ read-only บน `document.modelContext` เช่น  
  - `list_buyback_categories`  
  - `get_contact_channels` (คืน URL LINE / เบอร์ — ไม่ส่งข้อความแทนผู้ใช้)  
  - `get_service_area_summary`  
- มี feature detection + no-op เมื่อ browser ไม่รองรับ  
- ไม่ใช้ `navigator.modelContext` เป็น path หลัก

### 2. Optional improvements
- Annotate declarative WebMCP **เมื่อมี HTML form ที่เป็น search/filter เท่านั้น**  
- เพิ่มหน้า “Agent tools” หรือเอกสาร `llms.txt` / tool catalog สำหรับ discoverability (แยกจาก WebMCP)

### 3. Forms that must not become tools (ถ้าสร้างในอนาคต)
- ประเมินราคาที่รับรูป + เบอร์โทร + ที่อยู่  
- นัดรับสินค้า / นัดหมาย  
- อัปโหลดไฟล์  
- ยืนยันขาย / ตกลงราคา  
- Admin / login / ลบ-แก้ไขข้อมูล  
- ชำระเงิน  

หลัก: Agent ช่วย **เตรียมข้อมูล** ได้ แต่ **การส่งจริงต้องมีผู้ใช้ยืนยัน**

### 4. Testing requirements (เมื่อ implement)
- Unit: register/unregister, schema validation  
- E2E: Chrome ที่รองรับ WebMCP + DevTools panel inventory  
- Lighthouse: `webmcp-registered-tools`, `webmcp-schema-validity` ต้องไม่ fail  
- Regression: headless ที่ไม่รองรับต้องไม่ throw

### 5. Security and privacy safeguards
- ห้าม tool ส่ง PII โดยอัตโนมัติ  
- ห้าม mirror ข้อความลูกค้าไป LINE โดยไม่มี confirmation  
- ไม่ใส่ API keys / Place secrets ใน tool output  
- Rate limit / abuse controls หากมี endpoint สำหรับ agent

---

## Conclusion

amphon.co.th **ไม่ได้ “fail” WebMCP** และ **ไม่ได้ขาด declarative attributes บน form ที่ควรมี** เพราะโมเดลธุรกิจบนเว็บใช้ CTA ภายนอก (LINE/โทร) แทน HTML forms  

| Question | Answer |
|---|---|
| ขาด form coverage จริงหรือไม่? | ไม่ — ไม่มี form ที่ควร annotate |
| ยังไม่ได้ติดตั้ง WebMCP หรือไม่? | ใช่ |
| เหมาะเปิด tool ธุรกรรมหรือไม่? | ไม่ |
| Lighthouse รองรับและรันได้หรือไม่? | ใช่ (13.4.1) แต่ผลเป็น N/A |
| DevTools panel | UNVERIFIABLE ในรอบนี้ |

**Final verdict: NOT_APPLICABLE**
