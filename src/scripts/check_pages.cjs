const fs = require('fs');
const path = require('path');
const servicesDir = path.join(__dirname, '..', 'content', 'services');
function countWords(text){
  return text.split(/\s+/).filter(Boolean).length;
}
function checkFile(file){
  const content = fs.readFileSync(file,'utf-8');
  const wordCount = countWords(content);
  const hasCTA = /@webuy/.test(content);
  const hasHero = /heroImage:/i.test(content);
  const hasImageTag = /!\[[^\]]*\]\([^\)]+\)/.test(content);
  const hasFutureImage = /future|ฟิวเจอร์/i.test(content);
  const fillerPhrase = 'นี่คือเนื้อหาเพิ่มเติมที่อธิบายรายละเอียดเชิงลึกเกี่ยวกับบริการรับซื้อของเราซึ่งให้ข้อมูลครบถ้วนและเป็นประโยชน์ต่อผู้ที่กำลังมองหาวิธีการขายสินค้ามือสองอย่างมืออาชีพ';
  const fillerCount = (content.match(new RegExp(fillerPhrase, 'g'))||[]).length;
  const isSpam = fillerCount > 3;
  console.log(`File: ${path.basename(file)}`);
  console.log(`  Words: ${wordCount}`);
  console.log(`  CTA @webuy: ${hasCTA}`);
  console.log(`  Hero image in frontmatter: ${hasHero}`);
  console.log(`  Image tag present: ${hasImageTag}`);
  console.log(`  Future image mention: ${hasFutureImage}`);
  console.log(`  Spam filler repeats: ${fillerCount} (spam? ${isSpam})`);
  console.log('');
}
fs.readdirSync(servicesDir).filter(f => f.endsWith('.md')).forEach(f => checkFile(path.join(servicesDir, f)));
