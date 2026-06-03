const fs = require('fs');
const path = require('path');

const serviceAreasDir = path.join(__dirname, '..', 'content', 'serviceAreas');

// Map of provinces to their main districts in Isan
const provinceDistricts = {
  "ขอนแก่น": "เมืองขอนแก่น, บ้านไผ่, ชุมแพ, น้ำพอง, พล, กระนวน, มัญจาคีรี, หนองเรือ, ภูเวียง, เขาสวนกวาง",
  "กาฬสินธุ์": "เมืองกาฬสินธุ์, ยางตลาด, กมลาไสย, สมเด็จ, กุฉินารายณ์, สหัสขันธ์, เขาวง, ห้วยเม็ก, คำม่วง",
  "อุดรธานี": "เมืองอุดรธานี, กุมภวาปี, บ้านดุง, หนองหาน, บ้านผือ, เพ็ญ, นากลาง, น้ำโสม",
  "นครราชสีมา": "เมืองนครราชสีมา, ปากช่อง, สีคิ้ว, โชคชัย, ปักธงชัย, พิมาย, ครบุรี, บัวใหญ่, สูงเนิน, ขามทะเลสอ",
  "อุบลราชธานี": "เมืองอุบลราชธานี, วารินชำราบ, เดชอุดม, พิบูลมังสาหาร, ตระการพืชผล, ม่วงสามสิบ, เขมราฐ",
  "ร้อยเอ็ด": "เมืองร้อยเอ็ด, เสลภูมิ, สุวรรณภูมิ, ปทุมรัตต์, เกษตรวิสัย, โพนทอง, ธวัชบุรี",
  "บุรีรัมย์": "เมืองบุรีรัมย์, นางรอง, ประโคนชัย, สตึก, ลำปลายมาศ, กระสัง, พุทไธสง",
  "สุรินทร์": "เมืองสุรินทร์, ปราสาท, ท่าตูม, ศีขรภูมิ, รัตนบุรี, สังขะ, จอมพระ",
  "มหาสารคาม": "เมืองมหาสารคาม, โกสุมพิสัย, บรบือ, วาปีปทุม, พยัคฆภูมิพิสัย, เชียงยืน",
  "หนองคาย": "เมืองหนองคาย, ท่าบ่อ, โพนพิสัย, ศรีเชียงใหม่, สังคม",
  "สกลนคร": "เมืองสกลนคร, พรรณานิคม, สว่างแดนดิน, พังโคน, วานรนิวาส, กุสุมาลย์",
  "ชัยภูมิ": "เมืองชัยภูมิ, ภูเขียว, แก้งคร้อ, เกษตรสมบูรณ์, คอนสวรรค์, จัตุรัส, บำเหน็จณรงค์",
  "ยโสธร": "เมืองยโสธร, คำเขื่อนแก้ว, มหาชนะชัย, เลิงนกทา, กุดชุม, ป่าติ้ว",
  "ศรีสะเกษ": "เมืองศรีสะเกษ, กันทรลักษ์, ขุขันธ์, ขุนหาญ, อุทุมพรพิสัย, ราษีไศล",
  "หนองบัวลำภู": "เมืองหนองบัวลำภู, นากลาง, โนนสัง, ศรีบุญเรือง, สุวรรณคูหา",
  "อำนาจเจริญ": "เมืองอำนาจเจริญ, ชานุมาน, ปทุมราชวงศา, พนา, เสนางคนิคม, หัวตะพาน",
  "นครพนม": "เมืองนครพนม, ธาตุพนม, เรณูนคร, ศรีสงคราม, ท่าอุเทน, นาแก",
  "มุกดาหาร": "เมืองมุกดาหาร, นิคมคำสร้อย, ดอนตาล, คำชะอี, หว้านใหญ่, หนองสูง",
  "เลย": "เมืองเลย, เชียงคาน, ด่านซ้าย, วังสะพุง, ภูเรือ, ท่าลี่, ภูกระดึง",
  "บึงกาฬ": "เมืองบึงกาฬ, พรเจริญ, โซ่พิสัย, เซกา, ปากคาด, บึงโขงหลง, ศรีวิไล"
};

// Default districts if province not found (fallback)
const defaultDistricts = "อำเภอเมือง และพื้นที่ใกล้เคียง";

async function processFiles() {
  try {
    const files = fs.readdirSync(serviceAreasDir).filter(f => f.endsWith('.md'));
    console.log(`Found ${files.length} markdown files in serviceAreas.`);

    let processedCount = 0;

    for (const file of files) {
      const filePath = path.join(serviceAreasDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Match the frontmatter (allowing for potential BOM or leading whitespace)
      const frontmatterMatch = content.match(/---\r?\n([\s\S]*?)\r?\n---/);
      if (!frontmatterMatch) {
        console.warn(`Could not parse frontmatter in ${file}. Skipping.`);
        continue;
      }

      const frontmatter = frontmatterMatch[0];
      const frontmatterContent = frontmatterMatch[1];

      // Extract metadata needed for the template
      // title, slug, serviceSlug, areaSlug, province, service
      const extractValue = (key) => {
        const regex = new RegExp(`^${key}:\\s*"([^"]+)"`, 'm');
        const match = frontmatterContent.match(regex);
        return match ? match[1] : null;
      };

      const province = extractValue('province') || "พื้นที่ของคุณ";
      const serviceSlug = extractValue('serviceSlug'); // e.g. รับซื้อ-airpods
      const areaSlug = extractValue('areaSlug');
      
      // Derive service name from serviceSlug. Example: 'รับซื้อ-airpods' -> 'รับซื้อ AirPods'
      // This is a rough derivation, but good enough for local SEO pages
      // Try to get title, e.g. "รับซื้อ AirPods ขอนแก่น ..."
      let title = extractValue('title');
      let serviceName = "สินค้าไอที";
      
      if (title) {
        // Simple extraction: Take words before the province name
        // e.g. "รับซื้อ AirPods ขอนแก่น ประเมินฟรี จ่ายไว" -> "รับซื้อ AirPods"
        const titleParts = title.split(province);
        if (titleParts.length > 0 && titleParts[0].trim().length > 0) {
            serviceName = titleParts[0].trim();
        } else {
            // fallback
            serviceName = title.split(' ')[0] + (title.split(' ')[1] ? ' ' + title.split(' ')[1] : '');
        }
      }

      // Look up districts
      const districts = provinceDistricts[province] || defaultDistricts;

      // Construct the new Feeder Page Body
      const newBody = `
## ${serviceName} ${province} บริการถึงที่

อำพล เทรดดิ้ง มีบริการ **${serviceName}** ในพื้นที่ **จังหวัด${province}** และจังหวัดใกล้เคียง เราอำนวยความสะดวกให้ลูกค้าที่ต้องการขายอุปกรณ์ไอทีด้วยบริการนัดรับถึงหน้าบ้าน หรือส่งพัสดุมาประเมินราคาตามตกลง เพื่อให้คุณขายของได้อย่างปลอดภัยและรวดเร็วที่สุด

> 🔥 **ต้องการดูราคาประเมิน และขั้นตอนการขายใช่ไหม?**
> 👉 **[คลิกที่นี่เพื่อดูตารางราคาประเมิน พร้อมขั้นตอนการส่งรูปเช็คราคา](/บริการ/${serviceSlug})**

### พื้นที่ให้บริการในจังหวัด${province}

ลูกค้าในพื้นที่สามารถทัก Line [@webuy](https://line.me/ti/p/~@webuy) เพื่อส่งรูปและสเปกมาให้ทีมงานประเมินราคาเบื้องต้นได้ฟรี ไม่ว่าคุณจะอยู่ในตัวเมือง หรืออำเภออื่นๆ หากราคาเป็นที่น่าพอใจ สามารถนัดหมายรับของหรือส่งพัสดุได้ทันที

**รายชื่ออำเภอที่รองรับ:**
${districts} และพื้นที่ใกล้เคียง

- **เช็คราคาทั่วประเทศ:** [คลิกดูรายละเอียดที่นี่](/บริการ/${serviceSlug})
- **ดูพื้นที่รับซื้ออื่นๆ ในภาคอีสาน:** [พื้นที่ให้บริการ ${province}](/พื้นที่ให้บริการ/${areaSlug})

หากมีข้อสงสัยหรือต้องการประเมินราคาด่วน โทรติดต่อ **064-257-9353** หรือทักไลน์ **@webuy** ได้ตลอดเวลาครับ
`;

      const newContent = `${frontmatter}\n${newBody}`;
      fs.writeFileSync(filePath, newContent, 'utf-8');
      processedCount++;
    }

    console.log(`Successfully upgraded ${processedCount} serviceArea pages into Hub & Spoke Feeder Pages.`);
  } catch (error) {
    console.error('Error processing files:', error);
  }
}

processFiles();
