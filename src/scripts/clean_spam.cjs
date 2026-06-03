const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, '..', 'content', 'services');
const filler = `นี่คือเนื้อหาเพิ่มเติมที่อธิบายรายละเอียดเชิงลึกเกี่ยวกับบริการรับซื้อของเราซึ่งให้ข้อมูลครบถ้วนและเป็นประโยชน์ต่อผู้ที่กำลังมองหาวิธีการขายสินค้ามือสองอย่างมืออาชีพ`;

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  // split by filler occurrences
  const parts = content.split(filler);
  // keep first three filler paragraphs (if exist)
  const keepCount = 3;
  let newContent = '';
  for (let i = 0; i < parts.length; i++) {
    newContent += parts[i];
    if (i < parts.length - 1) {
      // there was a filler after this part
      if (i < keepCount) {
        newContent += filler + '\n\n';
      }
      // else skip filler
    }
  }
  // ensure trailing newline
  newContent = newContent.trimEnd() + '\n';
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`Cleaned ${path.basename(filePath)}`);
}

fs.readdirSync(servicesDir).filter(f => f.endsWith('.md')).forEach(f => {
  cleanFile(path.join(servicesDir, f));
});
