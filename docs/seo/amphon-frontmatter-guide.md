# Amphon Frontmatter Guide — amphon.co.th Content Rules

## Project

This repository is for amphon.co.th, the main website of **อำพล เทรดดิ้ง** — a national IT buyback service (รับซื้อสินค้าไอทีมือสองทั่วประเทศ). The physical storefront is in Ubon Ratchathani (740/8 ถนนชยางกูร) and serves as trust proof, not as a geographic service limit.

The site uses Astro content pages for service/money pages. Every new money page must follow the existing frontmatter structure exactly.

See also: `01-amphon-site-brief.md`, `02-money-page-template.md`, `03-page-writing-prompt.md`.

## Required Frontmatter for Money Pages

Every money page must include this frontmatter:

```yaml
---
title: ""
h1: ""
slug: ""
order: 1
description: ""
mainKeyword: ""
relatedKeywords: []
heroImage: "/images/about/amphon-trading-shop-interior-evaluation.webp"
ogImage: "/images/about/amphon-trading-shop-interior-evaluation.webp"
date: "2026-06-14"
draft: false
icon: "desktop"
faqs:
  - question: ""
    answer: ""
---
```

## Field Rules

### title

* Used as SEO title.
* Must include the main keyword.
* Should be clear and click-worthy.
* **National intent** — keyword หลักคือประเภทสินค้า ไม่บังคับใส่อุบลราชธานีหรือภาคอีสาน
* Avoid risky claims such as:

  * ราคาสูง
  * ให้ราคาสูงสุด
  * ดีที่สุด
  * อันดับ 1
  * รับทุกรุ่นทุกสภาพ
* Prefer safer wording:

  * ประเมินฟรี
  * ส่งรูปเช็กราคา
  * ประเมินตามสภาพจริง
  * รับยกล็อต
  * มีหน้าร้านจริง

Good example:

```yaml
title: "รับซื้อคอมสำนักงาน ส่งรูปประเมินฟรี รับยกล็อต | อำพล เทรดดิ้ง"
```

Bad example:

```yaml
title: "รับซื้อคอมสำนักงาน อุบลราชธานี ภาคอีสาน ราคาสูง"
```

### h1

* Must contain the main keyword.
* Must be natural and user-friendly.
* Page content must have only one H1.
* H1 should be slightly more descriptive than the title.
* ไม่จำเป็นต้องมีชื่อจังหวัด

Example:

```yaml
h1: "รับซื้อคอมสำนักงาน คอมออฟฟิศหลายเครื่อง ประเมินฟรี"
```

### slug

* Use Thai slug if the existing site uses Thai service slugs.
* Do not include leading or trailing slash in frontmatter.
* Must match the intended route.

Example:

```yaml
slug: "รับซื้อคอมสำนักงาน"
```

### order

* Use `1` for important money pages unless the existing collection requires another number.
* Do not change order of existing pages unless requested.

### description

* Used as meta description.
* Around 140–160 Thai characters.
* Must explain:

  * What the shop buys
  * Who the page is for (nationwide customers)
  * That customers can send photos or item lists for appraisal
  * Trust point (real storefront in Ubon Ratchathani)
  * CTA or benefit
* Avoid exaggerated claims.
* Do not frame the page as Ubon-only or Isan-only.

Example:

```yaml
description: "รับซื้อคอมสำนักงาน คอมบริษัท ยกล็อตทั่วประเทศ ส่งรูปเช็กราคาเบื้องต้นได้ มีหน้าร้านจริงที่อุบลราชธานี ประเมินตามสภาพจริง"
```

### mainKeyword

* Exact primary keyword for the page.
* Must match the page intent.

Example:

```yaml
mainKeyword: "รับซื้อคอมสำนักงาน"
```

### relatedKeywords

* 3–6 related keywords.
* Must be natural variants.
* Do not stuff too many keywords.

Example:

```yaml
relatedKeywords:
  - "รับซื้อคอมออฟฟิศ"
  - "รับซื้อคอมพิวเตอร์สำนักงาน"
  - "ขายคอมสำนักงาน"
  - "รับซื้อพีซีออฟฟิศ"
  - "รับซื้อคอมบริษัท"
```

### heroImage

* Use an existing image path only.
* Default for service pages:

```yaml
heroImage: "/images/about/amphon-trading-shop-interior-evaluation.webp"
```

### ogImage

* Use the same image as heroImage unless a specific OG image exists.

### date

* Use the current publish date or the date pattern used by existing pages.
* Format: YYYY-MM-DD.

### draft

* Use `false` for pages ready to publish.
* Use `true` only for unfinished drafts.

### icon

Use an icon name that fits the page. Examples:

* desktop = computer / office PC
* laptop = notebook
* smartphone = iPhone / mobile
* tablet = iPad
* server = server/network
* camera = camera
* monitor = monitor
* printer = printer
* hard-drive = storage / data

### faqs

* Must include 4–8 FAQ items.
* Each FAQ must have `question` and `answer`.
* Answers must be concise, honest, and safe.
* Avoid absolute claims.
* Should include at least one FAQ about nationwide appraisal or delivery options.

## Geographic Positioning Rules

Money pages use **national intent** — write for customers nationwide.

1. **Ubon Ratchathani = trust proof only** — ที่ตั้งหน้าร้านจริง นำสินค้ามาที่ร้านได้
2. **Do not write as regional-only** — หลีกเลี่ยง title/H1/intro ที่เน้น "ภาคอีสาน" หรือ "อุบลราชธานี" เป็นคำหลัก
3. **Nationwide appraisal** — ลูกค้าต่างจังหวัดส่งรูปหรือรายการประเมินทาง LINE @webuy ได้
4. **Pickup / delivery / on-site** — ขึ้นกับประเภทสินค้า จำนวน และพื้นที่
5. **Area pages** ใช้ template แยก — ไม่ใช่ framing หลักของ money page

## Claim Safety Rules

Never use these phrases:

* ดีที่สุด
* อันดับ 1
* ให้ราคาสูงสุด
* ราคาสูงสุด
* ราคาดีที่สุด
* รับทุกรุ่นทุกสภาพ
* รับทุกอย่าง
* การันตีราคาสูง

Use these instead:

* ประเมินตามสภาพจริง
* ส่งรูปเช็กราคาเบื้องต้น
* เปรียบเทียบราคาก่อนได้
* รับพิจารณาหลายรุ่น
* รับพิจารณาทั้งเครื่องดีและเครื่องมีตำหนิ
* จ่ายเงินทันทีเมื่อตกลงราคา
* มีหน้าร้านจริงที่อุบลราชธานี
* รับซื้อสินค้าไอทีมือสองทั่วประเทศ
* ลูกค้าต่างจังหวัดส่งรูปประเมินได้

## QA Checklist

After editing:

1. Run `npm run build`.
2. Check that the page has exactly one H1.
3. Check no placeholder links remain: `](#)`.
4. Check no risky claim words remain.
5. Check the page does not read as Ubon-only or Isan-only (unless it is an area page).
6. Check the new route appears correctly.
