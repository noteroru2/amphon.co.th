const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/User/Desktop/project ทั้งหมด/amphon.co.th/src/content/services';

const imageMap = {
  'รับซื้อโน๊ตบุ๊ค.md': '/images/services/rub-sue-notebook-amphon-trading-banner.webp',
  'รับซื้อ-iphone.md': '/images/services/rub-sue-iphone-amphon-trading-banner.webp',
  'รับซื้อกล้อง.md': '/images/services/rub-sue-khong-fujifilm-x-a2-amphon.webp',
  'รับซื้อคอมพิวเตอร์.md': '/images/services/rub-sue-komputer-gaming-pc-amphon.webp',
  'รับซื้อมือถือ.md': '/images/services/rub-sue-iphone-tur-ruen-rap-raka-sung.webp',
  'รับซื้อ-ipad.md': '/images/services/rub-sue-ipad-amphon-trading.webp',
  'รับซื้อ-macbook.md': '/images/services/rub-sue-macbook-amphon-trading-banner.webp',
  'รับซื้อ-playstation.md': '/images/hero/hero-amphon-trading-rub-sue-it-isan.webp',
  'รับซื้อ-jbl.md': '/images/hero/hero-amphon-trading-rub-sue-it-isan.webp',
  'รับซื้อ-marshall.md': '/images/hero/hero-amphon-trading-rub-sue-it-isan.webp',
};

for (const [file, img] of Object.entries(imageMap)) {
  const p = path.join(dir, file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/heroImage: .*/g, `heroImage: "${img}"`);
    content = content.replace(/ogImage: .*/g, `ogImage: "${img}"`);
    fs.writeFileSync(p, content);
    console.log(`Updated ${file}`);
  }
}
