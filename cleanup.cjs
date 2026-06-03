const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/User/Desktop/project ทั้งหมด/amphon.co.th/src/content/services';

const files = fs.readdirSync(dir);

for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const p = path.join(dir, file);
    let content = fs.readFileSync(p, 'utf8');

    // Remove the broken area links section
    content = content.replace(/\*\*พื้นที่รับซื้อหลักของเรา:\*\*[\s\S]*?(?=---|$)/g, "");

    // Fix awkward phrasing
    content = content.replace(/ภาคตะวันออกเฉียงเหนือ \(ทั่วประเทศ\)/g, "ทั่วประเทศ");
    content = content.replace(/เช่น ทั่วประเทศ, ยโสธร, อำนาจเจริญ, ร้อยเอ็ด, ทั่วประเทศ ฯลฯ/g, "ทุกพื้นที่");
    content = content.replace(/ในพื้นที่ ทั่วประเทศ/g, "ทั่วประเทศ");
    content = content.replace(/พื้นที่ ทั่วประเทศ/g, "ทั่วประเทศ");
    content = content.replace(/เขตทั่วประเทศ/g, "ทั่วประเทศ");
    content = content.replace(/ร้านรับซื้อ Apple ทั่วประเทศ/g, "ร้านรับซื้อ Apple");
    content = content.replace(/ร้านรับซื้อ Apple  /g, "ร้านรับซื้อ Apple ");
    content = content.replace(/MacBook มือสอง  /g, "MacBook มือสอง");

    fs.writeFileSync(p, content);
}
