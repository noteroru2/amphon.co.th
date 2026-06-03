const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/User/Desktop/project ทั้งหมด/amphon.co.th/src/content/services';

function getBestImage(filename) {
    if (filename.includes('iphone') || filename.includes('มือถือ')) return '/images/services/rub-sue-iphone-amphon-trading-banner.webp';
    if (filename.includes('ipad') || filename.includes('แท็บเล็ต')) return '/images/services/rub-sue-ipad-amphon-trading.webp';
    if (filename.includes('mac') || filename.includes('apple')) return '/images/services/rub-sue-macbook-amphon-trading-banner.webp';
    if (filename.includes('โน๊ตบุ๊ค')) return '/images/services/rub-sue-notebook-amphon-trading-banner.webp';
    if (filename.includes('คอม') || filename.includes('จอ') || filename.includes('ซีพียู') || filename.includes('การ์ดจอ') || filename.includes('แรม') || filename.includes('เมนบอร์ด') || filename.includes('ssd')) return '/images/services/rub-sue-komputer-gaming-pc-amphon.webp';
    if (filename.includes('กล้อง') || filename.includes('เลนส์') || filename.includes('gopro')) return '/images/services/rub-sue-khong-fujifilm-x-a2-amphon.webp';
    return '/images/hero/hero-amphon-trading-rub-sue-it-isan.webp'; // Fallback for games, speakers, others
}

const files = fs.readdirSync(dir);

for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const p = path.join(dir, file);
    let content = fs.readFileSync(p, 'utf8');

    // 1. Update Images
    const bestImg = getBestImage(file);
    content = content.replace(/heroImage:\s*".*?"/g, `heroImage: "${bestImg}"`);
    content = content.replace(/ogImage:\s*".*?"/g, `ogImage: "${bestImg}"`);

    // 2. Remove Province Names
    const provincePattern = /อุบลราชธานี|อุบลฯ|อุบล|ขอนแก่น|นครราชสีมา|โคราช|อุดรธานี|อุดร|สุรินทร์|ศรีสะเกษ/g;
    
    // Replace in title and description headers specifically if they exist
    // Actually, just doing a global replace is safer as long as we clean up grammar
    content = content.replace(/ในจังหวัดอุบลราชธานี/g, "กับเรา");
    content = content.replace(/มีหน้าร้านจริงที่อุบลราชธานี/g, "มีหน้าร้านจริง");
    content = content.replace(/มีหน้าร้านจริงในจังหวัดอุบลราชธานี/g, "มีหน้าร้านจริง");
    content = content.replace(/มีหน้าร้านที่อุบลราชธานี/g, "มีหน้าร้านจริง");
    content = content.replace(/มีหน้าร้านอุบลราชธานี/g, "มีหน้าร้านจริง");
    content = content.replace(/หน้าร้านอุบลราชธานี/g, "หน้าร้านของเรา");
    content = content.replace(/ในพื้นที่ ขอนแก่น.*ใกล้เคียงครับ/g, "ทั่วประเทศครับ");
    content = content.replace(/ใน ขอนแก่น.*ภาคอีสาน/g, "ทั่วประเทศ");
    content = content.replace(/พื้นที่ให้บริการ \(ภาคอีสาน\)/g, "พื้นที่ให้บริการ");
    content = content.replace(/พื้นที่ให้บริการ \(อุบลราชธานี และภาคอีสาน\)/g, "พื้นที่ให้บริการ");
    content = content.replace(/ลูกค้าในอุบลราชธานี/g, "ลูกค้าทั่วไป");
    content = content.replace(/ลูกค้าในพื้นที่ อุบลราชธานี/g, "ลูกค้าที่สะดวก");
    content = content.replace(/ลูกค้าในเขต อุบลราชธานี/g, "ลูกค้าที่สะดวก");
    
    // Fallback cleanup for remaining province names
    content = content.replace(provincePattern, "ทั่วประเทศ");
    content = content.replace(/และโซนอีสานใกล้เคียง/g, "");
    content = content.replace(/และจังหวัดใกล้เคียง/g, "");
    content = content.replace(/ภาคอีสาน/g, "ทั่วประเทศ");
    content = content.replace(/ทั่วภาคอีสาน/g, "ทั่วประเทศ");
    content = content.replace(/ในอีสาน/g, "");
    content = content.replace(/อีสาน/g, "ทั่วประเทศ");

    // Clean up awkward phrasing like "ทั่วประเทศและทั่วประเทศ"
    content = content.replace(/ทั่วประเทศและทั่วประเทศ/g, "ทั่วประเทศ");
    content = content.replace(/ทั่วประเทศ ทั่วประเทศ/g, "ทั่วประเทศ");
    content = content.replace(/ทั่วประเทศ, ทั่วประเทศ/g, "ทั่วประเทศ");
    content = content.replace(/ทั่วประเทศ และ ทั่วประเทศ/g, "ทั่วประเทศ");
    content = content.replace(/ทั่วประเทศ และทั่วประเทศ/g, "ทั่วประเทศ");
    content = content.replace(/ทั่วประเทศ, ทั่วประเทศ, ทั่วประเทศ, ทั่วประเทศ/g, "ทั่วประเทศ");
    content = content.replace(/ที่ทั่วประเทศ/g, "ทั่วประเทศ");
    content = content.replace(/ในทั่วประเทศ/g, "ทั่วประเทศ");
    
    // Clean up SEO related keywords lists like "รับซื้อ iPad ทั่วประเทศ"
    content = content.replace(/รับซื้อ(.*?)ทั่วประเทศ/g, "รับซื้อ$1");
    content = content.replace(/รับซื้อ (.*?) ทั่วประเทศ/g, "รับซื้อ $1 ");

    fs.writeFileSync(p, content);
    console.log(`Processed ${file}`);
}
