const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, '..', 'content', 'services');

function processFiles() {
  try {
    const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.md'));
    let processedCount = 0;

    for (const file of files) {
      const filePath = path.join(servicesDir, file);
      let content = fs.readFileSync(filePath, 'utf-8');
      
      let changed = false;

      // Fix phone numbers
      if (content.includes('08X-XXX-XXXX')) {
        content = content.replace(/08X-XXX-XXXX/g, '064-257-9353');
        changed = true;
      }

      // Fix Line IDs (case insensitive replace for @amphontrading)
      if (content.match(/@amphontrading/i)) {
        content = content.replace(/@amphontrading/gi, '@webuy');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(filePath, content, 'utf-8');
        processedCount++;
        console.log(`Fixed contacts in ${file}`);
      }
    }

    console.log(`Successfully fixed contacts in ${processedCount} money pages.`);
  } catch (error) {
    console.error('Error processing files:', error);
  }
}

processFiles();
