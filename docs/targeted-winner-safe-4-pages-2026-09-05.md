# Targeted Winner-Safe Optimization — 4 Pages

Date: 2026-09-05

Base: `f7d373a887f88244cab2558c872e6fa92cfa12ff` (`origin/main`)

Branch: `seo/targeted-winner-safe-4-pages`
Verdict: **PASS_WITH_WARNING**

The four requested routes were changed without URL, slug, canonical, layout, navigation, sitemap, redirect, or deployment changes. The warning is limited to three pre-existing repository-wide claim-risk matches; the same three matches occur on the untouched base SHA and none are in this batch's edited files.

## Resolved source files and pre-edit inventory

| Route | Source file | Current title before edit | Current description before edit | Current H1 before edit | Words | H2 | Internal links |
|---|---|---|---|---|---:|---:|---:|
| `/บริการ/รับซื้อ-apple` | `src/content/services/รับซื้อ-apple.md` | รับซื้อสินค้า Apple มือสองทั่วประเทศ ส่งรูปประเมินฟรี | รับซื้อสินค้า Apple มือสองหลายกลุ่ม เช่น iPhone, iPad, MacBook, iMac, Apple Watch และ AirPods ทั่วประเทศ ส่งรูป รุ่น สภาพ และอุปกรณ์เพื่อประเมินเบื้องต้นได้ | รับซื้อสินค้า Apple มือสอง ส่งรูปประเมินเบื้องต้นทั่วประเทศ | 300 | 9 | 13 |
| `/blog/วิธีเช็กรุ่น-ipad-ว่าเป็น-gen-ไหน` | `src/content/blog/วิธีเช็กรุ่น-ipad-ว่าเป็น-gen-ไหน.md` | วิธีดูรุ่น iPad ว่าเป็น Gen ไหน เช็กเลขโมเดล Axxxx พร้อมตาราง | วิธีดูรุ่น iPad ว่าเป็น Gen ไหนจาก Settings ฝาหลัง และเลขโมเดล Axxxx พร้อมตาราง iPad, Air, mini และ Pro แยกปี ขนาดจอ ความจุ และ Wi-Fi หรือ Cellular | Title rendered by the blog layout | 1,977 | 20 | 20 |
| `/บริการ/รับซื้อ-ipad-pro` | `src/content/services/รับซื้อ-ipad-pro.md` | รับซื้อ iPad Pro มือสอง ประเมินตามรุ่น ความจุ และสภาพจริง | รับซื้อ iPad Pro มือสอง ส่งรูป รุ่น ชิป ขนาดหน้าจอ ความจุ สภาพเครื่อง แบตเตอรี่ และอุปกรณ์ เช่น Apple Pencil หรือ Magic Keyboard เพื่อประเมินราคาเบื้องต้นได้ | รับซื้อ iPad Pro มือสอง ส่งรูปประเมินราคาเบื้องต้นได้ | 138 | 1 | 10 |
| `/บริการ/รับซื้อ-macbook` | `src/content/services/รับซื้อ-macbook.md` | รับซื้อ MacBook มือสอง Air / Pro ส่งรูปประเมินทั่วประเทศ | รับซื้อ MacBook มือสอง Air และ Pro ทั้ง Intel, M1, M2, M3, M4 ส่งรูป About This Mac, Battery Cycle สภาพจอและตัวเครื่องเพื่อประเมินเบื้องต้นทั่วประเทศ | รับซื้อ MacBook มือสอง Air และ Pro ส่งรูปประเมินเบื้องต้นได้ทั่วประเทศ | 985 | 17 | 21 |

Word counts use the same Markdown-body token method before and after. Internal-link counts include repeated links.

## Before/after summary

| Page | Role Before | Problem | GSC Evidence | Change | Role After | Title Before | Title After | H1 Before | H1 After | Words Before | Words After | Internal Links Before | Internal Links After | Risk | Verdict |
|---|---|---|---|---|---|---|---|---|---|---:|---:|---:|---:|---|---|
| Apple | Broad Apple buyback page | Competed with dedicated iPhone, iPad, and MacBook pages; exposed editorial SEO language | Apple Hub approached or exceeded child-page impressions for `รับซื้อ ipad` and `รับซื้อ iphone`; also appeared for `รับซื้อ macbook` | Reframed title, H1, description, opening, FAQ language, and body around mixed-product/multi-device lists; retained one prominent route to each child | Multi-product and uncertain-category routing page | รับซื้อสินค้า Apple มือสองทั่วประเทศ ส่งรูปประเมินฟรี | รับซื้อสินค้า Apple หลายประเภท มือสอง ส่งรายการประเมินก่อนขาย | รับซื้อสินค้า Apple มือสอง ส่งรูปประเมินเบื้องต้นทั่วประเทศ | มีสินค้า Apple หลายประเภทหรือหลายเครื่อง ส่งรายการเพื่อประเมินเบื้องต้น | 300 | 191 | 13 | 7 | Medium: commercial page-role change | PASS |
| iPad model-check blog | Informational model-identification article | High impressions with low CTR | Current 28d about 2,045 impressions, 1.37% CTR, position 7.85; latest 7d 1,109 impressions, 1.53% CTR, position 7.32 | Changed only title and meta description | Same informational article with clearer Axxxx/table promise | วิธีดูรุ่น iPad ว่าเป็น Gen ไหน เช็กเลขโมเดล Axxxx พร้อมตาราง | วิธีดูรุ่น iPad จากเลข Axxxx เช็กว่าเป็น Gen ไหน [ตารางเทียบ] | Title rendered by layout | วิธีดูรุ่น iPad จากเลข Axxxx เช็กว่าเป็น Gen ไหน [ตารางเทียบ] | 1,977 | 1,977 | 20 | 20 | Low: metadata only | PASS |
| iPad Pro | Thin Pro page with generic iPad CTA/list | Broad generic iPad language and time-sensitive “ชิปใหม่ล่าสุด” wording | Dedicated Pro page could still be selected for generic iPad queries | Made opening explicitly Pro-only, routed standard/Air/mini users to iPad hub, replaced time-sensitive wording, and focused evaluation fields | iPad Pro-only commercial page | รับซื้อ iPad Pro มือสอง ประเมินตามรุ่น ความจุ และสภาพจริง | รับซื้อ iPad Pro มือสอง ประเมินตามรุ่น ชิป ความจุ และสภาพ | รับซื้อ iPad Pro มือสอง ส่งรูปประเมินราคาเบื้องต้นได้ | รับซื้อ iPad Pro มือสอง ส่งรุ่นและรูปสภาพเพื่อประเมินก่อนขาย | 138 | 151 | 10 | 3 | Low–medium: focused role clarification | PASS |
| MacBook | Dedicated MacBook Air/Pro money page | Desktop-Mac routing was incomplete and the related block mixed Apple product families | `รับซื้อ imac` selected the MacBook page for about 26 impressions at position about 50 | Preserved core content; removed unrelated Apple-family links and added one short iMac/Mac mini routing sentence | MacBook-only page with concise desktop-Mac handoff | รับซื้อ MacBook มือสอง Air / Pro ส่งรูปประเมินทั่วประเทศ | Unchanged | รับซื้อ MacBook มือสอง Air และ Pro ส่งรูปประเมินเบื้องต้นได้ทั่วประเทศ | Unchanged | 985 | 982 | 21 | 19 | Low: surgical routing cleanup | PASS |

## Apple ownership check

- The title does not enumerate every child product.
- H1 and opening establish multiple-product/multiple-device intent.
- `รับซื้อ iPhone`, `รับซื้อ iPad`, and `รับซื้อ MacBook` each occur once, as routing anchors.
- Prominent child routes exist for iPhone, iPad, MacBook, iMac, and Mac mini; Apple Watch and AirPods routes are also retained.
- User-facing terms such as “Hub,” “แย่งคีย์,” “intent,” “SEO,” and “Google” are absent.

## iPad blog body hash check

- Source article body SHA-256 before: `abefbb82c326aee6ceed4cd66313e7091416a74b1f602c677033b1152c070570`
- Source article body SHA-256 after: `abefbb82c326aee6ceed4cd66313e7091416a74b1f602c677033b1152c070570`
- Rendered `<article class="prose">` SHA-256 on base: `12c6788e74f14a19f0ccfb7ba42e83f69ddbb0e8a30a4f09056dbcf1ae6b7af5`
- Rendered `<article class="prose">` SHA-256 after: `12c6788e74f14a19f0ccfb7ba42e83f69ddbb0e8a30a4f09056dbcf1ae6b7af5`
- Result: **IDENTICAL**. Tables, H2/H3, FAQ, anchors, model mappings, images, body links, slug, and canonical were not changed.

## iPad Pro role check

- Title and H1 both contain `iPad Pro`.
- The first paragraph says the page is specifically for iPad Pro.
- Standard iPad, iPad Air, and iPad mini users are routed to `/บริการ/รับซื้อ-ipad`.
- Removed “ชิปใหม่ล่าสุด”; no superlative price promise or fixed price was added.
- Content stays focused on generation/chip, screen size, storage, connectivity, battery, condition, accessories, ownership, and information to send.

## MacBook leakage check

- Core MacBook Air/Pro, Intel/Apple Silicon, RAM, SSD, battery, cycle count, display, keyboard, Touch ID, ports, charger, Activation Lock, Find My, condition, and evaluation content remains.
- Desktop-Mac coverage is now one sentence containing contextual links to `/บริการ/รับซื้อ-imac` and `/บริการ/รับซื้อ-mac-mini`.
- `Mac Studio` is absent. The page is not positioned as a general Mac hub.

## Winner no-touch check

- Production diff contains exactly the four requested content files.
- No homepage, protected winner, R8 page outside this batch, layout, Header, Footer, StickyCTA, internal-link map, sitemap, schema, redirect, canonical, or URL file changed.
- The only additional file is this report under `docs/`.

## Build QA

| Check | Result |
|---|---|
| Dependency install | PASS — `npm install` added 406 packages; its mechanical lockfile annotations were removed from the diff |
| Google Reviews | PASS — 21/21 |
| Astro check | PASS — 0 errors, 0 warnings, 66 pre-existing hints |
| Production build | PASS |
| Internal links | PASS — no missing targets and no links hitting redirect sources |
| Duplicate titles/H1s | PASS — 1,169 built pages checked |
| Sitemap | PASS — 1,166 canonical URLs |
| SEO/JSON-LD validation | PASS — 1,168 pages |
| Claim-risk scan | BASELINE WARNING — three matches outside this batch, identical on `origin/main` |

All four built routes exist. Each rendered page has exactly one H1, the expected title and description, a self-referencing unchanged canonical, `index, follow` robots, and working LINE and telephone links. Required Apple child links, the iPad hub handoff, and the iMac/Mac mini handoff are present in generated HTML.

## Trust QA

- The only physical storefront stated is 740/8 ถนนชยางกูร ตำบลในเมือง อำเภอเมืองอุบลราชธานี จังหวัดอุบลราชธานี 34000.
- Other provinces are described only as remote preliminary evaluation followed by case-dependent shipping, appointment, or inspection.
- No branch, office, warehouse, permanently stationed staff, guaranteed highest/best price, unconditional instant payment, or unconditional nationwide free pickup claim was added.
- No pawn/deposit targeting was added to metadata, headings, CTAs, keywords, or service type.

## Diff scope

Before adding this report, the production diff was exactly four files: 63 insertions and 66 deletions. Final scope is four production content files plus this report. `git diff --check` passes; line-ending notices are informational Windows checkout notices.

## Recommended next action

Review the two feature-branch commits and open a pull request. Do not merge or deploy until review is complete; after release, compare GSC page ownership and iPad article CTR over a finalized 28-day window.
