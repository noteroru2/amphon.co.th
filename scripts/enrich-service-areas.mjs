import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROVINCES_PATH = path.join(__dirname, 'data', 'province-districts.json');
const BLOCKS_PATH = path.join(__dirname, 'data', 'service-content-blocks.json');
const SERVICE_AREAS_DIR = path.join(__dirname, '..', 'src', 'content', 'serviceAreas');

// Load data
const provinces = JSON.parse(fs.readFileSync(PROVINCES_PATH, 'utf-8'));
const blocks = JSON.parse(fs.readFileSync(BLOCKS_PATH, 'utf-8'));

function getServiceType(serviceSlug) {
  for (const [type, data] of Object.entries(blocks)) {
    if (type === 'default') continue;
    if (data.keywords.some(kw => serviceSlug.toLowerCase().includes(kw.toLowerCase()))) {
      return type;
    }
  }
  return 'default';
}

function processFiles() {
  const files = fs.readdirSync(SERVICE_AREAS_DIR).filter(file => file.endsWith('.md'));
  let updatedCount = 0;

  for (const file of files) {
    const filePath = path.join(SERVICE_AREAS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if already enriched
    if (content.includes('## ขั้นตอนการเตรียมตัวก่อนขาย')) {
      continue;
    }

    // Extract frontmatter using regex
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) {
      console.log(`No match for ${file}`);
      continue;
    }
    
    const fm = match[1];
    
    // Extract variables
    const getMatch = (regex) => {
        const m = fm.match(regex);
        return m ? m[1].replace(/["']/g, '') : null;
    };
    
    const province = getMatch(/province:\s*(.+)/);
    const serviceSlug = getMatch(/serviceSlug:\s*(.+)/) || getMatch(/service:\s*(.+)/) || file.replace('.md', '');
    const mainKeyword = getMatch(/mainKeyword:\s*(.+)/);
    
    if (!province) continue;

    let serviceName = mainKeyword || serviceSlug.replace(/-/g, ' ');
    if (mainKeyword) {
        serviceName = mainKeyword.replace(new RegExp(`\\s*${province}\\s*`), '');
    }

    const districts = provinces[province] || [];
    const districtsText = districts.length > 0 ? districts.join(', ') : 'ทุกอำเภอ';
    
    const serviceType = getServiceType(serviceSlug);
    const blockData = blocks[serviceType] || blocks['default'];
    const defaultData = blocks['default'];

    const prepList = (blockData.preparation || defaultData.preparation).map(item => `- ${item.replace(/\{serviceName\}/g, serviceName).replace(/\{province\}/g, province)}`).join('\n');
    
    const faqs = (blockData.faq || defaultData.faq).map(item => `
### ${item.question.replace(/\{serviceName\}/g, serviceName).replace(/\{province\}/g, province).replace(/\{districts\}/g, districtsText)}
${item.answer.replace(/\{serviceName\}/g, serviceName).replace(/\{province\}/g, province).replace(/\{districts\}/g, districtsText)}
`).join('\n');

    const enrichment = `

## พื้นที่ให้บริการในจังหวัด${province}
ทีมงานของเราพร้อมให้บริการประเมินราคาและรับซื้อในพื้นที่จังหวัด${province} โดยครอบคลุมอำเภอต่างๆ ดังนี้:
**${districtsText}** และพื้นที่ใกล้เคียง หากคุณไม่ได้อยู่ในอำเภอเหล่านี้ สามารถสอบถามเพิ่มเติมได้ เรามีบริการขนส่งและรับพัสดุทั่วประเทศ

## ขั้นตอนการเตรียมตัวก่อนขาย ${serviceName}
เพื่อให้การประเมินราคาเป็นไปอย่างรวดเร็วและได้ราคาดีที่สุด ขอแนะนำให้เตรียมตัวดังนี้:
${prepList}

> [!TIP]
> **เคล็ดลับได้ราคาดี:** ยิ่งอุปกรณ์ครบ มีกล่อง และสภาพสวย จะยิ่งทำให้ ${serviceName} ของคุณมีมูลค่าสูงขึ้น ส่งรูปมาให้เราช่วยประเมินได้เลยครับ!

## ทำไมต้องขาย ${serviceName} กับ อำพล เทรดดิ้ง ในพื้นที่${province}?
1. **ให้ราคายุติธรรม อิงตามราคาตลาดจริง:** เรามีทีมงานผู้เชี่ยวชาญที่คอยติดตามราคาตลาดอย่างใกล้ชิด
2. **ประเมินราคาไว ได้เงินสดทันที:** เพียงส่งรูปมาให้เราดู ใช้เวลาไม่นานก็รู้ราคา หากนัดรับในพื้นที่${province} โอนเงินให้ทันทีหน้างาน
3. **ปลอดภัย เชื่อถือได้ 100%:** มีหน้าร้านชัดเจน ดำเนินธุรกิจมาอย่างยาวนาน หมดห่วงเรื่องโดนกดราคา
4. **สะดวกสบาย ไม่ต้องเดินทาง:** มีบริการคุยจบในแชท และมีตัวเลือกรับส่งสินค้าหลากหลายรูปแบบ

## คำถามที่พบบ่อย (FAQ) สำหรับพื้นที่${province}
${faqs}

---

**สนใจขาย ${serviceName} หรือสอบถามราคา?**
อย่ารอช้า! แอดไลน์มาคุยกันก่อนได้ที่ **[Line: @webuy](https://line.me/ti/p/~@webuy)** หรือโทร **[064-257-9353](tel:0642579353)** เรายินดีให้คำปรึกษาฟรี!
`;

    // Append to file
    const newContent = content.trimEnd() + '\n' + enrichment;
    fs.writeFileSync(filePath, newContent, 'utf-8');
    updatedCount++;
  }

  console.log(`Successfully enriched ${updatedCount} serviceArea files.`);
}

processFiles();
