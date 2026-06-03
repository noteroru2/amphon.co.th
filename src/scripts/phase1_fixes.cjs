/**
 * phase1_fixes.cjs
 * Phase 1 Quick Wins — แก้ปัญหาทุกอย่างด้วย script เดียว:
 * 1. แก้ชื่อร้าน "อัมพร เทรดดิ้ง" → "อำพล เทรดดิ้ง"
 * 2. แก้ [CTA_BUTTON] placeholder
 * 3. แก้ internal link /services/ → /บริการ/
 * 4. แก้ heroImage ของ Sony (ใช้รูป Fujifilm ผิด)
 * 5. ลบ Filler Spam จาก 10 ไฟล์ขนาดใหญ่
 * 6. แก้ Keyword Stuffing section → natural paragraph
 */

const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, '..', 'content', 'services');

const CTA_BLOCK = `> 📲 **ต้องการขายสินค้า? ติดต่อเราได้เลย!**
> แอดไลน์ **[@webuy](https://line.me/ti/p/~@webuy)** หรือโทร **[064-257-9353](tel:0642579353)**
> ประเมินราคาฟรี จ่ายเงินสด รับทั่วประเทศ`;

// Filler pattern — ข้อความที่ซ้ำกัน
const FILLER_PATTERNS = [
  'นี่คือเนื้อหาเพิ่มเติมที่อธิบายรายละเอียดเชิงลึกเกี่ยวกับบริการรับซื้อของเราซึ่งให้ข้อมูลครบถ้วน',
  'เนื้อหาเพิ่มเติมที่อธิบายรายละเอียดเชิงลึก',
];

// Keyword stuffing section — section ที่ต้องแปลงเป็น natural text
const KEYWORD_STUFFING_REPLACEMENTS = {
  'รับซื้อมือถือ.md': {
    pattern: /## คีย์เวิร์ดที่เกี่ยวข้อง[\s\S]*$/,
    replacement: `## บริการรับซื้อที่เกี่ยวข้อง

นอกจากมือถือแล้ว เรายังรับซื้ออุปกรณ์ไอทีหลากหลาย ทั้ง [โน้ตบุ๊ค](/บริการ/รับซื้อโน๊ตบุ๊ค), [แท็บเล็ต](/บริการ/รับซื้อแท็บเล็ต), และ [สมาร์ทวอทช์](/บริการ/รับซื้ออุปกรณ์ไอที) ในราคาที่ยุติธรรม จ่ายเงินสดทันที บริการรับถึงที่ทั่วประเทศครับ`,
  },
  'รับซื้อเครื่องเกม.md': {
    pattern: /## คีย์เวิร์ดที่เกี่ยวข้อง[\s\S]*$/,
    replacement: `## บริการรับซื้อที่เกี่ยวข้อง

นอกจากเครื่องเกมคอนโซลแล้ว เรายังรับซื้อ [Nintendo Switch](/บริการ/รับซื้อ-nintendo-switch), [PlayStation](/บริการ/รับซื้อ-playstation) และอุปกรณ์เกมมิ่งอื่นๆ รวมถึง [จอเกมมิ่ง](/บริการ/รับซื้อจอเกมมิ่ง) และ [คอมเกมมิ่ง](/บริการ/รับซื้อคอมเกมมิ่ง) ครับ`,
  },
  'รับซื้อลำโพงบลูทูธ.md': {
    pattern: /## คีย์เวิร์ดที่เกี่ยวข้อง[\s\S]*$/,
    replacement: `## บริการรับซื้อที่เกี่ยวข้อง

นอกจากลำโพงบลูทูธแล้ว เรายังรับซื้อ [ลำโพง JBL](/บริการ/รับซื้อ-jbl), [ลำโพง Marshall](/บริการ/รับซื้อ-marshall) และ [หูฟังมือสอง](/บริการ/รับซื้อหูฟัง) ทุกแบรนด์ ประเมินราคาฟรีผ่าน Line @webuy ครับ`,
  },
  'รับซื้ออุปกรณ์คอมพิวเตอร์.md': {
    pattern: /## คีย์เวิร์ดที่เกี่ยวข้อง[\s\S]*$/,
    replacement: `## บริการรับซื้อที่เกี่ยวข้อง

หากคุณมีอุปกรณ์คอมพิวเตอร์อื่นๆ เรายังรับซื้อ [การ์ดจอ](/บริการ/รับซื้อการ์ดจอ), [CPU](/บริการ/รับซื้อซีพียู), [RAM](/บริการ/รับซื้อแรม), [SSD](/บริการ/รับซื้อ-ssd) และ [จอคอมพิวเตอร์](/บริการ/รับซื้อจอคอม) ทุกชนิดครับ`,
  },
  'รับซื้อโน๊ตบุ๊คเกมมิ่ง.md': {
    pattern: /## คีย์เวิร์ดที่เกี่ยวข้อง[\s\S]*$/,
    replacement: `## บริการรับซื้อที่เกี่ยวข้อง

นอกจากโน้ตบุ๊คเกมมิ่งแล้ว เรายังรับซื้อ [โน้ตบุ๊คทั่วไป](/บริการ/รับซื้อโน๊ตบุ๊ค), [โน้ตบุ๊คเสีย](/บริการ/รับซื้อโน๊ตบุ๊คเสีย) และ [คอมเกมมิ่ง PC](/บริการ/รับซื้อคอมเกมมิ่ง) ทุกรุ่น ทุกสเปคครับ`,
  },
};

// Sony image fix
const SONY_CORRECT_IMAGE = '/images/services/rub-sue-server-datacenter-amphon.png'; // Placeholder — will create Sony image separately

let totalFixed = 0;
let totalFiles = 0;

const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.md'));

for (const fname of files) {
  const fp = path.join(servicesDir, fname);
  let content = fs.readFileSync(fp, 'utf-8');
  let changed = false;
  const changes = [];

  // === FIX 1: แก้ชื่อร้าน ===
  if (content.includes('อัมพร เทรดดิ้ง')) {
    content = content.replaceAll('อัมพร เทรดดิ้ง', 'อำพล เทรดดิ้ง');
    changes.push('แก้ชื่อร้าน อัมพร→อำพล');
    changed = true;
  }

  // === FIX 2: แก้ [CTA_BUTTON] ===
  if (content.includes('[CTA_BUTTON]')) {
    content = content.replace(/\[CTA_BUTTON\]/g, CTA_BLOCK);
    changes.push('แก้ [CTA_BUTTON] placeholder');
    changed = true;
  }

  // === FIX 3: แก้ internal links /services/ → /บริการ/ ===
  if (content.includes('(/services/')) {
    content = content.replaceAll('(/services/', '(/บริการ/');
    changes.push('แก้ link /services/ → /บริการ/');
    changed = true;
  }
  // แก้ link แบบเต็ม href
  if (content.includes('href="/services/')) {
    content = content.replaceAll('href="/services/', 'href="/บริการ/');
    changes.push('แก้ href /services/ → /บริการ/');
    changed = true;
  }
  // แก้ broken link /รับซื้อ/รับซื้อ...
  if (content.includes('(/รับซื้อ/รับซื้อ')) {
    content = content.replace(/\(\/รับซื้อ\/รับซื้อ([^)]*)\)/g, '(/บริการ/รับซื้อ$1)');
    changes.push('แก้ broken link /รับซื้อ/รับซื้อ...');
    changed = true;
  }

  // === FIX 4: แก้รูป Sony ใช้รูป Fujifilm ===
  if (fname === 'รับซื้อกล้อง-sony.md' && content.includes('fujifilm')) {
    content = content.replace(
      /heroImage:\s*"[^"]*fujifilm[^"]*"/,
      'heroImage: "/images/services/rub-sue-khong-sony-amphon.webp"'
    );
    content = content.replace(
      /ogImage:\s*"[^"]*fujifilm[^"]*"/,
      'ogImage: "/images/services/rub-sue-khong-sony-amphon.webp"'
    );
    // Also replace inline image if fujifilm appears
    content = content.replace(
      /!\[([^\]]*)\]\(\/images\/[^)]*fujifilm[^)]*\)/g,
      '![$1](/images/services/rub-sue-khong-camera-sony-amphon.webp)'
    );
    changes.push('แก้รูป Sony (เปลี่ยนจาก Fujifilm)');
    changed = true;
  }

  // === FIX 5: ลบ Filler Spam ===
  const hasFillerSpam = FILLER_PATTERNS.some(p => content.includes(p));
  if (hasFillerSpam) {
    // หา index แรกที่ filler เริ่ม
    let fillerStart = -1;
    for (const pattern of FILLER_PATTERNS) {
      const idx = content.indexOf(pattern);
      if (idx > -1 && (fillerStart === -1 || idx < fillerStart)) {
        fillerStart = idx;
      }
    }
    
    if (fillerStart > 0) {
      // หา newline ก่อนหน้า filler
      let cutPoint = content.lastIndexOf('\n', fillerStart);
      if (cutPoint > 0) {
        // ตัดออก
        const beforeFiller = content.substring(0, cutPoint).trimEnd();
        const originalSize = content.length;
        content = beforeFiller + '\n';
        const newSize = content.length;
        changes.push(`ลบ filler spam (${Math.round(originalSize/1024)}KB → ${Math.round(newSize/1024)}KB)`);
        changed = true;
      }
    }
  }

  // === FIX 6: แก้ Keyword Stuffing section ===
  if (KEYWORD_STUFFING_REPLACEMENTS[fname]) {
    const { pattern, replacement } = KEYWORD_STUFFING_REPLACEMENTS[fname];
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      changes.push('แก้ Keyword Stuffing section → natural text');
      changed = true;
    }
  }

  // บันทึก
  if (changed) {
    fs.writeFileSync(fp, content, 'utf-8');
    console.log(`✅ ${fname}`);
    changes.forEach(c => console.log(`   • ${c}`));
    totalFixed++;
  }
  totalFiles++;
}

console.log(`\n✅ Phase 1 เสร็จสิ้น! แก้ไข ${totalFixed}/${totalFiles} ไฟล์`);
