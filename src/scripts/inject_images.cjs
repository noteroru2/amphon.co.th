/**
 * inject_images.cjs
 * Injects inline section images and updates hero images for service pages.
 * - Adds specific hero image per page category
 * - Injects inline images after first few H2 headings
 * - Adds CTA Line image block if missing proper CTA
 */

const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, '..', 'content', 'services');

// Map slug patterns to their specific hero images and inline images
const imageMap = [
  {
    pattern: ['รับซื้อ-server', 'รับซื้อ-storage-nas'],
    heroImage: '/images/services/rub-sue-server-datacenter-amphon.png',
    sectionImage: '/images/services/rub-sue-server-datacenter-amphon.png',
    altText: 'รับซื้อ Server และ Storage NAS มือสอง - Amphon Trading',
  },
  {
    pattern: ['รับซื้อ-ssd'],
    heroImage: '/images/services/rub-sue-ssd-hdd-amphon.png',
    sectionImage: '/images/services/rub-sue-ssd-hdd-amphon.png',
    altText: 'รับซื้อ SSD และ HDD มือสอง - Amphon Trading',
  },
  {
    pattern: ['รับซื้อ-ups'],
    heroImage: '/images/services/rub-sue-ups-nas-amphon.png',
    sectionImage: '/images/services/rub-sue-ups-nas-amphon.png',
    altText: 'รับซื้อ UPS และ NAS มือสอง - Amphon Trading',
  },
  {
    pattern: ['รับซื้ออุปกรณ์-network'],
    heroImage: '/images/services/rub-sue-network-cisco-amphon.png',
    sectionImage: '/images/services/rub-sue-network-cisco-amphon.png',
    altText: 'รับซื้ออุปกรณ์ Network Cisco Fortinet มือสอง - Amphon Trading',
  },
  {
    pattern: ['รับซื้อทีวี'],
    heroImage: '/images/services/rub-sue-tivi-amphon.png',
    sectionImage: '/images/services/rub-sue-tivi-amphon.png',
    altText: 'รับซื้อทีวี Smart TV มือสอง - Amphon Trading',
  },
  {
    pattern: ['รับซื้อเฟอร์นิเจอร์'],
    heroImage: '/images/services/rub-sue-furniture-amphon.png',
    sectionImage: '/images/services/rub-sue-furniture-amphon.png',
    altText: 'รับซื้อเฟอร์นิเจอร์มือสอง - Amphon Trading',
  },
  {
    pattern: ['รับซื้อของสะสม'],
    heroImage: '/images/services/rub-sue-collectibles-amphon.png',
    sectionImage: '/images/services/rub-sue-collectibles-amphon.png',
    altText: 'รับซื้อของสะสมและของสะสมหายาก - Amphon Trading',
  },
  {
    pattern: ['รับซื้อโดรน'],
    heroImage: '/images/services/rub-sue-drone-dji-amphon.png',
    sectionImage: '/images/services/rub-sue-drone-dji-amphon.png',
    altText: 'รับซื้อโดรน DJI มือสอง - Amphon Trading',
  },
  {
    pattern: ['รับซื้อเครื่องใช้ไฟฟ้า'],
    heroImage: '/images/services/rub-sue-appliance-amphon.png',
    sectionImage: '/images/services/rub-sue-appliance-amphon.png',
    altText: 'รับซื้อเครื่องใช้ไฟฟ้ามือสอง - Amphon Trading',
  },
  // Fallback for all others using existing images
  {
    pattern: ['รับซื้อ-macbook', 'รับซื้อ-imac', 'รับซื้อ-mac-mini', 'รับซื้อ-apple'],
    heroImage: '/images/services/rub-sue-macbook-amphon-trading-banner.webp',
    sectionImage: '/images/services/rub-sue-macbook-amphon-trading-banner.webp',
    altText: 'รับซื้อ MacBook และ Apple มือสอง - Amphon Trading',
  },
  {
    pattern: ['รับซื้อ-iphone', 'รับซื้อมือถือ'],
    heroImage: '/images/services/rub-sue-iphone-amphon-trading-banner.webp',
    sectionImage: '/images/services/rub-sue-iphone-tur-ruen-rap-raka-sung.webp',
    altText: 'รับซื้อ iPhone และมือถือมือสอง - Amphon Trading',
  },
  {
    pattern: ['รับซื้อ-ipad', 'รับซื้อแท็บเล็ต'],
    heroImage: '/images/services/rub-sue-ipad-amphon-trading.webp',
    sectionImage: '/images/services/rub-sue-ipad-amphon-trading.webp',
    altText: 'รับซื้อ iPad และแท็บเล็ตมือสอง - Amphon Trading',
  },
  {
    pattern: ['รับซื้อโน๊ตบุ๊ค', 'รับซื้อ-surface'],
    heroImage: '/images/services/rub-sue-notebook-amphon-trading-banner.webp',
    sectionImage: '/images/services/rub-sue-notebook-laptops-acer-asus.webp',
    altText: 'รับซื้อโน้ตบุ๊คมือสอง - Amphon Trading',
  },
  {
    pattern: ['รับซื้อกล้อง', 'รับซื้อ-gopro', 'รับซื้อเลนส์'],
    heroImage: '/images/services/rub-sue-khong-fujifilm-x-a2-amphon.webp',
    sectionImage: '/images/services/rub-sue-khong-fujifilm-x-a2-amphon.webp',
    altText: 'รับซื้อกล้องถ่ายรูปมือสอง - Amphon Trading',
  },
  {
    pattern: ['รับซื้อคอม', 'รับซื้อการ์ดจอ', 'รับซื้อซีพียู', 'รับซื้อแรม', 'รับซื้อเมนบอร์ด', 'รับซื้อ-ssd'],
    heroImage: '/images/services/rub-sue-komputer-gaming-pc-amphon.webp',
    sectionImage: '/images/services/rub-sue-komputer-gaming-pc-amphon.webp',
    altText: 'รับซื้อคอมพิวเตอร์และอุปกรณ์ไอที - Amphon Trading',
  },
];

// Default fallback
const defaultImage = {
  heroImage: '/images/services/cta-line-webuy-amphon.png',
  sectionImage: '/images/services/cta-line-webuy-amphon.png',
  altText: 'รับซื้ออุปกรณ์ไอทีมือสอง - Amphon Trading',
};

function getImageForFile(filename) {
  const base = path.basename(filename, '.md');
  for (const entry of imageMap) {
    for (const pat of entry.pattern) {
      if (base.includes(pat) || base === pat) {
        return entry;
      }
    }
  }
  return defaultImage;
}

// CTA Line image block
const ctaLineBlock = `
> 📲 **ติดต่อขายสินค้ากับเรา**  
> แอดไลน์ **[@webuy](https://line.me/ti/p/~@webuy)** หรือโทร **[064-257-9353](tel:0642579353)**  
> ประเมินราคาฟรี จ่ายเงินสด รับทั่วประเทศ

`;

function injectImagesIntoContent(content, imageConfig, filename) {
  const base = path.basename(filename, '.md');
  
  // Split out frontmatter
  const fmMatch = content.match(/^(---[\s\S]*?---\n)([\s\S]*)$/);
  if (!fmMatch) return content;
  
  let frontmatter = fmMatch[1];
  let body = fmMatch[2];

  // 1. Update heroImage in frontmatter if it still uses the generic hero
  const genericHero = '/images/hero/hero-amphon-trading-rub-sue-it-isan.webp';
  if (frontmatter.includes(genericHero)) {
    frontmatter = frontmatter.replace(
      /heroImage:\s*"[^"]*"/,
      `heroImage: "${imageConfig.heroImage}"`
    );
    frontmatter = frontmatter.replace(
      /ogImage:\s*"[^"]*"/,
      `ogImage: "${imageConfig.heroImage}"`
    );
    console.log(`  Updated heroImage for ${base}`);
  }

  // 2. Check if already has inline images
  if (body.includes('![')) {
    console.log(`  Already has inline images, skipping body injection for ${base}`);
    return frontmatter + body;
  }

  // 3. Find H2 headings and inject image after 1st and 3rd H2
  const lines = body.split('\n');
  const newLines = [];
  let h2Count = 0;
  let injectedCount = 0;
  const maxInjections = 3; // Inject after 1st, 2nd, and 3rd H2

  for (let i = 0; i < lines.length; i++) {
    newLines.push(lines[i]);
    
    if (lines[i].match(/^## /)) {
      h2Count++;
      // After 1st H2: add feature image
      // After 2nd H2: add CTA image block  
      // After 3rd H2: add another section image
      if (h2Count === 1 && injectedCount < maxInjections) {
        // Find the next non-empty line to place image after paragraph
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === '') j++;
        // Find end of this section's first paragraph/block
        let endOfBlock = j;
        while (endOfBlock < lines.length && 
               !lines[endOfBlock].match(/^## /) && 
               !lines[endOfBlock].match(/^#/) &&
               endOfBlock - j < 8) {
          endOfBlock++;
        }
        // We'll insert after the current H2 heading line
        newLines.push('');
        newLines.push(`![${imageConfig.altText}](${imageConfig.sectionImage})`);
        newLines.push('');
        injectedCount++;
      } else if (h2Count === 3 && injectedCount < maxInjections) {
        newLines.push('');
        newLines.push(ctaLineBlock.trim());
        newLines.push('');
        injectedCount++;
      } else if (h2Count === 5 && injectedCount < maxInjections) {
        newLines.push('');
        newLines.push(`![${imageConfig.altText} - บริการรับซื้อครบวงจร](${imageConfig.sectionImage})`);
        newLines.push('');
        injectedCount++;
      }
    }
  }

  body = newLines.join('\n');
  return frontmatter + body;
}

// Process all service files
const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.md'));
let processed = 0;
let skipped = 0;

for (const fname of files) {
  const fp = path.join(servicesDir, fname);
  const content = fs.readFileSync(fp, 'utf-8');
  const imageConfig = getImageForFile(fname);
  
  try {
    const newContent = injectImagesIntoContent(content, imageConfig, fname);
    if (newContent !== content) {
      fs.writeFileSync(fp, newContent, 'utf-8');
      console.log(`✅ Processed: ${fname}`);
      processed++;
    } else {
      console.log(`⏭️  No changes: ${fname}`);
      skipped++;
    }
  } catch (err) {
    console.error(`❌ Error processing ${fname}:`, err.message);
  }
}

console.log(`\n✅ Done! Processed: ${processed}, Skipped: ${skipped}, Total: ${files.length}`);
