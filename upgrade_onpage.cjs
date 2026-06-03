const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'src', 'content', 'services');

function processFiles() {
  const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.md'));
  
  for (const file of files) {
    const filePath = path.join(servicesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it's frontmatter
    if (content.startsWith('---')) {
      const parts = content.split('---');
      let frontmatter = parts[1];
      const body = parts.slice(2).join('---');
      
      // Update description
      const descMatch = frontmatter.match(/description:\s*"([^"]+)"/);
      if (descMatch) {
        let desc = descMatch[1];
        if (!desc.includes('ใกล้ฉัน') && !desc.includes('รับซื้อถึงบ้าน')) {
          desc = desc.replace(/\s*ติดต่อ\s*Line/, ' ใกล้ฉัน รับซื้อถึงบ้าน ติดต่อ Line');
          if (!desc.includes('ใกล้ฉัน')) {
             // fallback if 'ติดต่อ Line' is missing
             desc = desc + ' ใกล้ฉัน รับซื้อถึงบ้าน';
          }
          frontmatter = frontmatter.replace(descMatch[0], `description: "${desc}"`);
        }
      }

      // Update title for high volume keywords
      const highVolume = ['รับซื้อโน๊ตบุ๊ค.md', 'รับซื้อคอมพิวเตอร์.md', 'รับซื้อ-macbook.md', 'รับซื้อโทรศัพท์.md', 'รับซื้อ-iphone.md', 'รับซื้อ-ipad.md'];
      if (highVolume.includes(file)) {
        const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
        if (titleMatch) {
          let title = titleMatch[1];
          if (!title.includes('ใกล้ฉัน')) {
            // Replace ' |' with ' ใกล้ฉัน |'
            title = title.replace(/\s*\|/, ' ใกล้ฉัน รับซื้อถึงบ้าน |');
            frontmatter = frontmatter.replace(titleMatch[0], `title: "${title}"`);
          }
        }
      }

      const newContent = `---${frontmatter}---${body}`;
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
}

processFiles();
