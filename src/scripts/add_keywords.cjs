const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, '..', 'content', 'services');

const additions = {
  'รับซื้อ-ssd.md': [
    "SSD M.2", "Kingston", "Samsung", "WD", "Western", "SanDisk", "Crucial", "Seagate", "Intel", "Micron", "Toshiba", "Kioxia", "ADATA", "XPG", "Transcend", "Corsair", "Apacer", "Lexar", "NVMe", "Harddisk SAS", "Harddisk Seagate", "Harddisk WD", "Harddisk Toshib", "Harddisk Hitachi", "Harddisk HGST", "Harddisk Samsung", "Harddisk Dell", "Harddisk HP", "Harddisk Lenovo", "Harddisk กล้องวงจรปิด", "external harddisk", "Flash Drive"
  ],
  'รับซื้อมือถือ.md': [
    "รับซื้อมือถือ Samsung", "รับซื้อมือถือ Android", "รับซื้อมือถือ Vivo", "รับซื้อมือถือ OPPO", "รับซื้อมือถือ Xiaomi", "รับซื้อมือถือ Realme", "รับซื้อมือถือ Honor", "รับซื้อมือถือ POCO", "รับซื้อมือถือ Huawei"
  ],
  'รับซื้อคอมเกมมิ่ง.md': [
    "รับซื้อคอมร้านเกม", "รับซื้อ Gaming PC", "รับซื้อคอมเล่นเกม", "รับซื้อคอมประกอบร้านเกม", "รับซื้อคอมสตรีมเกม", "รับซื้อคอมเกมมิ่งประกอบ", "รับซื้อ PC Workstation"
  ],
  'รับซื้ออุปกรณ์คอมพิวเตอร์.md': [
    "รับซื้อ Printer", "รับซื้อปริ้นเตอร์", "รับซื้อ Print Dot Matrix", "รับซื้อเมาส์ปากกา"
  ],
  'รับซื้อโน๊ตบุ๊คเกมมิ่ง.md': [
    "รับซื้อ notebook gaming", "รับซื้อ notebook เกมมิ่ง", "รับซื้อ Laptop Gaming", "รับซื้อ Notebook Asus", "รับซื้อ Notebook Gigabyte", "รับซื้อ notebook Msi", "รับซื้อ notebook dell", "รับซื้อ notebook hp", "รับซื้อ notebook Lenovo", "รับซื้อ notebook Acer"
  ],
  'รับซื้อลำโพงบลูทูธ.md': [
    "รับซื้อเครื่องเสียง", "รับซื้อ JBL", "รับซื้อ Marshall", "รับซื้อ Bose", "รับซื้อ Harman/Kardon", "รับซื้อ Bang & Olufsen"
  ],
  'รับซื้อเครื่องเกม.md': [
    "รับซื้อโปรเจคเตอร์", "รับซื้อ Projector", "รับซื้อเครื่องเล่นดีเจ"
  ]
};

function processFiles() {
  for (const [filename, newKeywords] of Object.entries(additions)) {
    const filePath = path.join(servicesDir, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filename}`);
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Find the relatedKeywords array in frontmatter using regex
    // It looks like: relatedKeywords: ["keyword1", "keyword2"]
    const regex = /relatedKeywords:\s*\[(.*?)\]/;
    const match = content.match(regex);
    
    if (match) {
      let currentKeywordsStr = match[1];
      // Basic parsing to avoid breaking the JSON-like array
      // It might be empty or contain quoted strings
      
      let newKeywordsStr = newKeywords.map(k => `"${k}"`).join(', ');
      
      let replacement;
      if (currentKeywordsStr.trim() === '') {
        replacement = `relatedKeywords: [${newKeywordsStr}]`;
      } else {
        replacement = `relatedKeywords: [${currentKeywordsStr}, ${newKeywordsStr}]`;
      }
      
      content = content.replace(regex, replacement);
      
      // Also, append a paragraph to the end of the markdown file mentioning these keywords to help SEO further
      const footer = `\n\n## คีย์เวิร์ดที่เกี่ยวข้อง\nเรารับประเมินราคาและรับซื้อแบรนด์/ประเภทอื่นๆ ที่เกี่ยวข้อง ได้แก่: ${newKeywords.join(', ')} หากคุณมีอุปกรณ์เหล่านี้ สามารถส่งรูปมาประเมินได้เช่นเดียวกันครับ`;
      
      content += footer;
      
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Upgraded ${filename}`);
    } else {
      console.log(`Could not find relatedKeywords in ${filename}`);
    }
  }
}

processFiles();
