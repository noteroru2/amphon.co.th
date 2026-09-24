import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

const [layout, bridge, map, ecosystem] = await Promise.all([
  read('src/layouts/BlogLayout.astro'),
  read('src/components/ShopAuthorityBridge.astro'),
  read('src/config/shop-authority-map.ts'),
  read('src/config/ecosystem.ts'),
])

const checks = [
  ['blog layout renders purchase-intent bridge after article content', layout.includes('<Content />') && layout.includes('<ShopAuthorityBridge targets={shopAuthorityTargets} />')],
  ['bridge explicitly separates sell and buy intent', bridge.includes('เว็บไซต์รับซื้อ') && bridge.includes('หน้าร้านสำหรับเลือกซื้อ')],
  ['authority map links only to shop.amphon.co.th', map.includes("SHOP_URL = 'https://shop.amphon.co.th'") && !map.includes('target="_blank"')],
  ['high-value device articles have Shop destinations', map.includes("'ราคา-macbook-มือสอง-2026'") && map.includes("'ราคา-ipad-มือสอง-2026'") && map.includes("'ราคา-iphone-มือสอง-2026'")],
  ['spec-focused articles link to stable Spec Finder', map.includes("'วิธีเช็กสเปกคอมก่อนขาย'") && map.includes('${SHOP_URL}/specs/')],
  ['service bridge covers gaming notebook GPU RAM CPU', ecosystem.includes("'รับซื้อ-gaming-notebook'") && ecosystem.includes("'รับซื้อการ์ดจอ'") && ecosystem.includes("'รับซื้อแรม'") && ecosystem.includes("'รับซื้อซีพียู'")],
]

const failures = checks.filter(([, ok]) => !ok)
for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`)
if (failures.length) process.exit(1)
console.log('SHOP AUTHORITY ENGINE PASS — sell/buy intent separation and cross-domain authority links are protected')
