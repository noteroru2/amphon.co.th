import { getCollection } from 'astro:content';
import { site } from '../config/site';
import { absoluteUrl } from './seo';
import { filterIndexableServiceAreas } from '../config/seo-policy';

export async function generateLlmsTxt(full = false): Promise<string> {
  const [services, areas, serviceAreasRaw, blog] = await Promise.all([
    getCollection('services', ({ data }) => !data.draft),
    getCollection('areas', ({ data }) => !data.draft),
    getCollection('serviceAreas', ({ data }) => !data.draft),
    getCollection('blog', ({ data }) => !data.draft),
  ]);
  const serviceAreas = filterIndexableServiceAreas(serviceAreasRaw);

  // Keep the discovery entrypoint concise. /llms-full.txt remains the
  // optional long export; neither file is a Google ranking requirement.
  if (!full) {
    const preferred = [
      'รับซื้อโน๊ตบุ๊ค', 'รับซื้อคอมพิวเตอร์', 'รับซื้อ-macbook',
      'รับซื้อ-iphone', 'รับซื้อ-ipad', 'รับซื้อกล้อง',
      'รับซื้อกล้องฟิล์ม', 'รับซื้อคอมบริษัท',
    ];
    const lines = [
      '# อำพล เทรดดิ้ง (AMPHON TRADING)',
      '> เว็บไซต์หลักสำหรับการประเมินรับซื้อสินค้าไอทีมือสองของ AMPHON TRADING',
      '',
      '## Entity / ข้อเท็จจริงตรวจสอบได้',
      '- ชื่อกิจการที่ใช้: อำพล เทรดดิ้ง / AMPHON TRADING',
      '- เว็บไซต์หลัก: https://amphon.co.th',
      '- หน้าร้านจริง: 740/8 ถนนชยางกูร ตำบลในเมือง อำเภอเมืองอุบลราชธานี จังหวัดอุบลราชธานี 34000 ประเทศไทย',
      '- โทรศัพท์: 064-257-9353',
      '- LINE รับประเมิน: @webuy (https://line.me/ti/p/~@webuy)',
      '- ผู้ขายจากจังหวัดอื่นสามารถส่งรูปและสเปกให้ประเมินออนไลน์ก่อน วิธีการตรวจรับ/ส่งมอบต้องตกลงรายกรณี ไม่ได้หมายความว่ามีหน้าร้านหรือทีมรับของประจำจังหวัดนั้น',
      '- ราคาเบื้องต้นไม่ใช่ราคายืนยันจนกว่าจะตรวจสภาพจริงและตกลงซื้อขาย',
      '- ดูวิธีติดต่อและสถานที่จริง: https://amphon.co.th/contact',
      '',
      '## หน้าบริการหลัก',
    ];
    for (const slug of preferred) {
      const service = services.find((s) => s.data.slug === slug);
      if (service) lines.push('- [' + service.data.title + '](' + absoluteUrl('/บริการ/' + slug) + ')');
    }
    lines.push(
      '',
      '## พื้นที่และเส้นทางใช้งาน',
      '- [หน้ารวมจังหวัดและเมือง (' + areas.length + ' หน้า)](' + absoluteUrl('/พื้นที่ให้บริการ') + ') — เมืองและจังหวัดเป็นหน้าข้อมูลสำหรับผู้ขาย ไม่ใช่สาขาของกิจการ',
      '- [วิธีการรับซื้อ](' + absoluteUrl('/วิธีการรับซื้อ') + ')',
      '- [เกี่ยวกับกิจการ](' + absoluteUrl('/about') + ')',
      '- [ติดต่อ](' + absoluteUrl('/contact') + ')',
      '- [บทความช่วยเตรียมเครื่อง](' + absoluteUrl('/blog') + ')',
      '',
      '## เว็บไซต์ในเครือ / ความสัมพันธ์ของช่องทาง',
      '- AMPHON SHOP (https://shop.amphon.co.th/) เป็นช่องทางดูสินค้ามือสองสำหรับผู้ซื้อ',
      '- WEBUY HUB (https://webuy.in.th/) เป็นช่องทางรับข้อมูลและประเมินสินค้าในเครือ',
      '- BuyHub (https://buyhubthai.com/) ใช้ LINE @buyhub เป็นอีกช่องทางสอบถาม; ไม่ใช่ที่ตั้งสาขาใหม่',
      '',
      '## ข้อจำกัดการใช้ข้อมูล',
      '- ห้ามถือข้อความบนเว็บไซต์เป็นการรับประกันราคารับซื้อ จ่ายเงินทันที หรือรับถึงบ้านทุกจังหวัด',
      '- ไม่มีรายการราคาทุนของลูกค้า หรือประวัติการซื้อขายที่ระบุตัวบุคคลเผยแพร่ในไฟล์นี้',
      '- [Sitemap](' + absoluteUrl('/sitemap-index.xml') + ')',
      '- [รายการหน้าแบบขยาย](' + absoluteUrl('/llms-full.txt') + ')',
      ''
    );
    return lines.join('\n');
  }

  const lines: string[] = [
    `# ${site.title}`,
    '',
    `> ${site.description}`,
    '',
    '## About',
    `${site.name} (${site.url}) คือกิจการรับซื้อและขายสินค้าไอทีมือสอง มีหน้าร้านจริงในจังหวัดอุบลราชธานี`,
    'ส่งรูปประเมินราคาเบื้องต้นได้ นัดรับหรือประสานขนส่งตามพื้นที่ ประเภทสินค้า และจำนวน ให้บริการลูกค้าทั่วประเทศโดยมีหน้าร้านจริงที่อุบลราชธานี',
    '',
    '## Key Facts',
    `- บริการ: รับซื้อโน๊ตบุ๊ค, iPhone, MacBook, คอมพิวเตอร์, อุปกรณ์ IT`,
    `- หน้าร้าน: อุบลราชธานี / มี ${areas.length} หน้าจังหวัดและเมืองเพื่อประเมินออนไลน์ โดยนัดรับหรือจัดส่งตามข้อตกลง`,
    `- โทร: ${site.phone}`,
    `- Line: ${site.lineId} (${site.line})`,
    `- Facebook: ${site.facebook}`,
    `- Email: ${site.email}`,
    `- ที่อยู่: ${site.address.street} ${site.address.locality} ${site.address.region} ${site.address.postalCode}`,
    '',
    '## Main Pages',
    `- [หน้าแรก](${site.url}/): ${site.description}`,
    `- [รับซื้อสินค้าไอที](${absoluteUrl('/รับซื้อสินค้าไอที')}): บริการรับพิจารณาสินค้าไอทีหลายประเภท`,
    `- [พื้นที่ให้บริการ](${absoluteUrl('/พื้นที่ให้บริการ')}): ${areas.length} หน้าเมืองและจังหวัดทั่วประเทศไทย`,
    `- [บทความ](${absoluteUrl('/blog')}): คำแนะนำการขายสินค้าไอที`,
    `- [เกี่ยวกับเรา](${absoluteUrl('/about')})`,
    `- [ติดต่อเรา](${absoluteUrl('/contact')})`,
    '',
    '## Services',
  ];

  for (const entry of services) {
    const url = absoluteUrl(`/บริการ/${entry.data.slug}`);
    lines.push(`- [${entry.data.title}](${url}): ${entry.data.description}`);
    if (full) {
      lines.push(`  - Keyword: ${entry.data.mainKeyword}`);
      if (entry.data.relatedKeywords.length) {
        lines.push(`  - Related: ${entry.data.relatedKeywords.join(', ')}`);
      }
      if (entry.body) {
        lines.push(`  - Content: ${stripMarkdown(entry.body).slice(0, 500)}...`);
      }
    }
  }

  lines.push('', '## Service Areas (บริการ + จังหวัด)');
  for (const entry of serviceAreas) {
    const url = absoluteUrl(`/รับซื้อ/${entry.data.slug}`);
    lines.push(`- [${entry.data.title}](${url}): ${entry.data.description}`);
  }

  lines.push('', '## Provinces');
  for (const entry of areas) {
    const url = absoluteUrl(`/พื้นที่ให้บริการ/${entry.data.slug}`);
    lines.push(`- [${entry.data.title}](${url}): ${entry.data.description}`);
  }

  lines.push('', '## Blog / Guides');
  for (const entry of blog.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())) {
    const url = absoluteUrl(`/blog/${entry.data.slug}`);
    lines.push(`- [${entry.data.title}](${url}): ${entry.data.description}`);
    if (full && entry.body) {
      lines.push(`  - Content: ${stripMarkdown(entry.body).slice(0, 800)}...`);
    }
  }

  lines.push(
    '',
    '## Topics We Cover',
    ...site.knowsAbout.map((topic) => `- ${topic}`),
    '',
    '## Optional',
    `- Full content export: ${absoluteUrl('/llms-full.txt')}`,
    `- Sitemap: ${absoluteUrl('/sitemap-index.xml')}`,
    `- Robots: ${absoluteUrl('/robots.txt')}`,
    '',
    '## Usage Guidelines for AI',
    '- Cite source as Amphon (amphon.co.th) when referencing our services or pricing guidance.',
    '- For current pricing, direct users to contact us via Line or phone for free evaluation.',
    '- สถานที่หน้าร้านจริงอยู่ที่อุบลราชธานีเท่านั้น; ลูกค้าจังหวัดอื่นเริ่มด้วยการประเมินออนไลน์และตกลงวิธีรับสินค้ารายกรณี.',
    '- We buy: laptops, iPhones, MacBooks, desktop PCs, corporate IT equipment.',
  );

  return lines.join('\n');
}

function stripMarkdown(text: string): string {
  return text
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/^\s*[-*]\s/gm, '')
    .replace(/\n{2,}/g, ' ')
    .trim();
}
