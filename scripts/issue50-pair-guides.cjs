const RULES={"รับซื้อกล้อง":["Shutter เซนเซอร์ โฟกัส AF ระบบกันสั่นและผลภาพตัวอย่าง","Body กับเลนส์ ฝาปิด แบต การ์ดและแท่นชาร์จที่รวม"],"รับซื้อกล้อง-canon":["Canon RF/EF Shutter Error และ AF/IS","เลนส์ Canon RF/EF ฝุ่นรา แบต กล่องและฝาปิด"],"รับซื้อกล้อง-fujifilm":["Fujifilm X Mount เซนเซอร์ ปุ่ม Dial ชัตเตอร์และ Hot Pixel","เลนส์ XF/XC วงแหวนโฟกัส ฝุ่นราและแฟลช"],"รับซื้อกล้อง-sony":["Sony Alpha E Mount เซนเซอร์ IBIS Shutter และพอร์ตการ์ด","Sony FE/E OSS AF เลนส์แท่นชาร์จและอุปกรณ์"],"รับซื้อการ์ดจอ":["GPU รุ่นจริง VRAM Artifact และความร้อนเมื่อใช้งาน","การ์ดจอ PCIe Power HDMI/DP กล่องและประกัน"],"รับซื้อของไอทีเสีย":["เครื่องเสีย เปิดไม่ติด จอเสีย บอร์ดเสียและอาการที่ยืนยันได้","อะไหล่เก็บไว้ แบตบวม SSD มีข้อมูลและชิ้นส่วนใช้งานได้"],"รับซื้อคอมเกมมิ่ง":["CPU GPU VRAM PSU และ Stress Test ที่ทดสอบจริง","เคส กระจก พัดลม SSD สายไฟและของที่รวมชุด"],"รับซื้อคอมบริษัท":["CPU Generation RAM HDD/SSD และ Domain/MDM","ผู้มีสิทธิ์ขาย Asset List เครื่องเช่า/Leasing และการส่งมอบ"],"รับซื้อคอมพิวเตอร์":["Desktop CPU RAM SSD PSU Mainboard และอาการ POST","PC จอ คีย์บอร์ดสายไฟ OS license และกล่อง"],"รับซื้อเครื่องเกม":["คอนโซล Disc Drive HDMI Controller Drift และพัดลม","เกมคอนโซล Dock Joy-Con สายและการปลดบัญชี"],"รับซื้อจอเกมมิ่ง":["Monitor Refresh Rate Hz Resolution Dead Pixel และ Backlight","Gaming Monitor Stand HDMI/DP Adapter กล่องโฟม"],"รับซื้อจอคอม":["จอ IPS VA TN สี เส้นจอ Dead Pixel และพอร์ต","จอพร้อมฐาน Adapter Power Cable และแพ็กขนส่ง"],"รับซื้อซีพียู":["CPU Socket Pins Contacts รุ่น Intel/AMD และผล Boot","CPU Tray/Box พัดลม Socket Guard และรุ่นที่เข้ากัน"],"รับซื้อแท็บเล็ต":["Tablet รุ่น Wi-Fi/Cellular Touchscreen Battery และ Port","Tablet Pencil Keyboard SIM Tray ชาร์จและบัญชี"],"รับซื้อโน๊ตบุ๊ค":["Notebook CPU Gen Battery Health Screen RAM/SSD และพอร์ต","Notebook Adapter BIOS/MDM Lock Keyboard Hinge และกล่อง"],"รับซื้อโน๊ตบุ๊คเกมมิ่ง":["Gaming Notebook GPU VRAM Hz Cooling Fan และ Artifact","Gaming Notebook Charger Watt Cooling Battery Warranty"],"รับซื้อโน๊ตบุ๊คเสีย":["Notebook ไม่เปิด จอมืด บอร์ดซ่อม SSD และแบต","Notebook Parts จอ บานพับ Keyboard สายและข้อมูลส่วนตัว"],"รับซื้อเมนบอร์ด":["Motherboard Socket Chipset DIMM Slot BIOS/POST","Mainboard I/O Shield M.2 Screw Antenna Socket Guard"],"รับซื้อแรม":["RAM DDR3 DDR4 DDR5 UDIMM SODIMM ECC และ MemTest","RAM Kit คู่ Part Number XMP/EXPO และกล่อง"],"รับซื้อลำโพงบลูทูธ":["Speaker Bluetooth Driver เสียงแตก ไมค์และ Battery","Speaker Charger Port ฝาปิดกันน้ำ Adapter และกล่อง"],"รับซื้อสินค้าไอที":["ล็อต IT แยก CPU GPU Notebook Camera รุ่นและอาการ","ล็อตหลายประเภท Inventory List Storage ที่รวมและสิทธิ์ขาย"],"รับซื้อหูฟัง":["Headphones ANC Microphone Bluetooth Driver L/R","Headphones Ear Pads Charging Case สายและสภาพสะอาด"],"รับซื้ออุปกรณ์คอมพิวเตอร์":["PC Parts CPU GPU RAM SSD Bus Socket และผลทดสอบ","Parts PSU Cable Connector กล่อง Warranty และชุดที่ขาด"],"รับซื้ออุปกรณ์ไอที":["Network NAS UPS Server รุ่นเต็มและสถานะ Cloud Account","IT องค์กร Storage Battery Asset List และเอกสาร"],"รับซื้อ-airpods":["AirPods เสียงซ้ายขวา ANC Mic แบตและการจับคู่","AirPods Find My Case Ear Tip พอร์ตและกล่อง"],"รับซื้อ-apple":["Apple รุ่น Chip Storage Battery และ Find My","Apple อุปกรณ์ Charger iCloud Activation Lock และกล่อง"],"รับซื้อ-apple-watch":["Watch Series Size GPS/Cellular Battery Crown","Watch Band Charger Activation Lock กระจกและกล่อง"],"รับซื้อ-imac":["iMac Intel/M-series จอ 4K/5K Fan Storage","iMac Keyboard Mouse Power Cable Stand และโฟม"],"รับซื้อ-ipad":["iPad Model Generation Wi-Fi/Cellular Battery Touchscreen","iPad Pencil Keyboard SIM eSIM Charger และ Lock"],"รับซื้อ-iphone":["iPhone Battery Health Face ID True Tone Parts History","iPhone Find My SIM Lock Camera กล่องและ Adapter"],"รับซื้อ-jbl":["JBL Flip Charge PartyBox เสียง Driver Bluetooth และแบต","JBL Power Cable Mic Port Charger กล่องและน้ำหนัก"],"รับซื้อ-macbook":["MacBook M-Series/Intel Battery Cycle SSD Keyboard Screen","MacBook Charger Watt MDM/iCloud กล่องและรอย"],"รับซื้อ-mac-mini":["Mac mini Intel/M-Series RAM SSD Thunderbolt และ Boot","Mac mini AC Cable Wi-Fi/Ethernet กล่องและ Lock"],"รับซื้อ-marshall":["Marshall Acton Stanmore Emberton เสียง Bluetooth Knob","Marshall AC Cable Battery Controls กล่องและ Adapter"],"รับซื้อ-nintendo-switch":["Switch OLED Lite V1/V2 Joy-Con Drift Screen Fan","Switch Dock Adapter Game Card Slot กล่องและบัญชี"],"รับซื้อ-playstation":["PS4/PS5 Disc/Digital HDMI Fan Storage และ Controller","PlayStation DualSense Power Cable Disc Drive กล่องและบัญชี"],"รับซื้อ-ssd":["SSD SATA NVMe SMART TBW Bad Block และ Capacity","SSD PCIe Gen M.2 Form Factor Secure Erase โดยเจ้าของ"],"รับซื้อ-surface":["Surface Pro/Laptop/Go CPU Battery Touchscreen Port","Surface Type Cover Pen Charger UEFI/MDM Lock และกล่อง"]};
(function proposal(){
 const fs=require("fs"),path=require("path");
 const root="src/content/serviceAreas",changes=[],areas=["นครราชสีมา","อุดรธานี"];
 for(const [service,focus]of Object.entries(RULES))for(const [i,area]of areas.entries()){
  const slug=service+"-"+area,file=path.join(root,slug+".md");
  if(!fs.existsSync(file))throw Error("Missing "+file);
  const raw=fs.readFileSync(file,"utf8");if(raw.includes("ISSUE50_PAIR_PROOF_V1"))continue;
  const fm=raw.match(/^---\r?\n[\s\S]*?\r?\n---/);if(!fm)throw Error("No FM "+slug);
  const main=service.replace(/^รับซื้อ-?/,"");
  const lead=i===0?`ผู้ขายจากนครราชสีมาควรเริ่มจากอาการเครื่องและรุ่นจริง โดยเน้น **${focus[0]}** อย่าเหมารวมเครื่องที่เปิดติดกับเครื่องที่ทดสอบครบทุกระบบ และหากไม่มีข้อมูลอาการให้แจ้งตามตรงว่าไม่ได้ทดสอบ`:`ผู้ขายจากอุดรธานีควรเริ่มจากความครบชุดและสิทธิ์ในสินค้า โดยเน้น **${focus[1]}** ก่อนส่งมอบต้องระบุอุปกรณ์ที่ขาดและบัญชีที่เจ้าของยังต้องปลด ไม่ใช้คำว่าครบกล่องกับรายการที่ตรวจไม่ครบ`;
  const process=i===0?`### วิธีจัดหลักฐานสภาพสินค้าเพื่อป้องกันการประเมินผิด
1. แสดงภาพป้าย Model/Part Number และสภาพตัวเครื่องหลายมุม โดยไม่ส่งเลขบัญชีหรือข้อมูลส่วนบุคคล
2. แยกอาการยืนยันแล้วกับสิ่งที่ยังสงสัย เช่น เปิดติดแต่ยังไม่ทดสอบพอร์ตหรือมีเสียงผิดปกติตามการใช้งานครั้งล่าสุด
3. ระบุจุดที่เคยซ่อม ดัดแปลงหรือเปลี่ยนอะไหล่เท่าที่ทราบ เพื่อไม่ให้ราคาเบื้องต้นอิงสภาพผิด
4. เครื่องที่มีแบตบวม สายไฟฉีกหรือกลิ่นไหม้ควรหยุดใช้งาน ไม่ต้องทดสอบซ้ำเพื่อถ่ายรูป
5. หากมีหลายเครื่อง ให้แยกจำนวนเครื่องที่ใช้งานได้/เสีย/ไม่ทราบสภาพก่อนรวมราคา`:`### วิธีจัดรายการอุปกรณ์และสิทธิ์ก่อนการเคลื่อนย้าย
1. ถ่ายภาพสินค้าทั้งชุดและอุปกรณ์เสริมที่ให้มาจริง พร้อมจำนวน ไม่กล่าวว่าอุปกรณ์ครบหากชิ้นส่วนหายไป
2. ตรวจว่าหัวชาร์จ สายพ่วง ฐานยึด และชิ้นส่วนเฉพาะรุ่นยังอยู่และเข้ากันจริงตามที่ทราบ
3. ออกจากบัญชีและจัดการข้อมูลโดยเจ้าของสิทธิ์ก่อนขาย ไม่ต้องส่งรหัสผ่าน, OTP หรือข้อมูลของบริษัทให้ร้าน
4. สำหรับหน้าจอเปราะบางหรือแบตเตอรี่ให้สอบถามวิธีแพ็กและข้อจำกัดผู้ขนส่ง ไม่เสียค่าส่งโดยยังไม่มีข้อตกลง
5. หากต้องขายสินค้าหลายประเภท ให้ทำรายการแยกรุ่น จำนวน อาการและอุปกรณ์ ไม่รวมเครื่องเสียกับเครื่องพร้อมใช้`;
  const result=i===0?`การตรวจรุ่นและอาการสำคัญกว่าการเดาราคาจากภาพเพียงมุมเดียว คำถามที่พบบ่อยคือ “เปิดติดแต่ยังไม่ได้ลองใช้งานครบ ขอราคาได้หรือไม่” ส่งขอประเมินเบื้องต้นได้ แต่ต้องแจ้งว่าไม่ได้ทดสอบครบ “เคยเปลี่ยนอะไหล่แล้วต้องแจ้งไหม” ควรแจ้งประวัติตามที่ทราบเพื่อให้ประเมินความเสี่ยงได้ถูกต้อง`:`การขายของไม่ครบชุดและสินค้าเชื่อมบัญชีมีเงื่อนไขต่างจากเครื่องพร้อมใช้ คำถามที่พบบ่อยคือ “ไม่มีกล่องยังขอราคาได้ไหม” สามารถส่งข้อมูลก่อน แต่ต้องแจ้งอุปกรณ์ที่ขาด “ต้องจัดส่งทันทีหรือไม่” ไม่ควรเสียค่าส่งก่อนร้านยืนยันว่าพิจารณาประเภทสินค้านี้และตกลงวิธีตรวจรับจริง`;
  const guide=`<!-- ISSUE50_PAIR_PROOF_V1 -->
## ${i===0?"แนวทางตรวจสภาพ":"แนวทางตรวจชุดอุปกรณ์"} ${main} สำหรับผู้ขายจาก${area}

${lead}

${process}

## ข้อมูลที่มีผลต่อราคาซื้อขายจริง

${result} ราคาสุดท้ายเป็นไปตามการตรวจสภาพและความต้องการตลาดในวันนั้น ไม่รับประกันว่าทุกเครื่องหรือรุ่นอยู่ในขอบเขตรับซื้อ และข้อความนี้ไม่ใช่หลักฐานการรับซื้อจริงจากจังหวัดดังกล่าว

## หน้าร้านที่ยืนยันแล้วและช่องทางส่งรายละเอียด

**บริษัท อำพล เทรดดิ้ง จำกัด** มีหน้าร้านที่ **740/8 ถนนชยางกูร อำเภอเมืองอุบลราชธานี** ติดปากซอยชยางกูร 32 เปิด 09:00–19:00 น. ลูกค้าจาก${area}ส่งข้อมูลผ่าน [LINE @webuy](https://line.me/ti/p/~@webuy) ได้ 24 ชั่วโมง เจ้าหน้าที่ตอบตามคิว ไม่มีหน้าร้านหรือทีมรับสินค้าประจำจังหวัด${area} การจัดส่งหรือนัดรับต้องยืนยันเงื่อนไขรายกรณีก่อน

`;
  let rest=raw.slice(fm[0].length);
  rest=rest.replaceAll("เรามีบริการขนส่งและรับพัสดุทั่วประเทศ","การรับมอบและขนส่งขึ้นกับประเภทสินค้าและข้อตกลงจริง");
  rest=rest.replace(/ทีมงานของเราพร้อมให้บริการประเมินราคาและรับซื้อในพื้นที่จังหวัด[^ \n]+ โดยครอบคลุมอำเภอต่างๆ ดังนี้:/g,"ลูกค้าทั่วจังหวัดสามารถส่งภาพขอประเมินออนไลน์ได้ ไม่ได้หมายความว่ามีทีมรับสินค้าประจำพื้นที่:");
  const out=fm[0].replace(/^updated:.*$/m,'updated: "2026-11-11"')+"\n\n"+guide+rest;
  for(const k of ["title","description","slug","serviceSlug","areaSlug"]){const regex=new RegExp("^"+k+":.*$","m");if(raw.match(regex)?.[0]!==out.match(regex)?.[0])throw Error("Protected metadata changed "+slug+" "+k);}
  fs.writeFileSync(file,out);
  changes.push({path:file,content:out});
 }
 console.log("ISSUE50_PAIR_PROPOSAL "+JSON.stringify({changed:changes.length,categories:Object.keys(RULES).length}));
 if(process.argv.includes("--export")){
  const encoded=Buffer.from(JSON.stringify(changes),"utf8").toString("base64");
  for(let i=0;i<encoded.length;i+=11000)console.log("ISSUE50_EXPORT_PART "+(i/11000)+" "+encoded.slice(i,i+11000));
  console.log("ISSUE50_EXPORT_END "+Math.ceil(encoded.length/11000));
 }
})();
