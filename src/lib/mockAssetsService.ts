export interface AssetItem {
  index: string;
  category: string;
  mainAssetCode: string;
  subAssetCode: string;
  name: string;
  inventoryNo: string;
  acquisitionMethod: string;
  acquisitionDate: string;
  fundingSource: string;
  quantity: string;
  amountPosted: string;
  amountNumeric: number;
  lastAuditYear: string;
  holderCode: string;
  holderName: string;
  deptCode: string;
  deptName: string;
  plantId: string;
  plantName: string;
  locationCode: string;
  locationName: string;
  statusCode: string;
  statusName: string;
  auditResultYear: string;
  auditResult: string;
  divisions: string[];
  divisionLabel: string;
}

const CATEGORY_TEMPLATES: {
  category: string;
  division: "ENV" | "MAINT" | "CENTRAL";
  divisionLabel: string;
  priceRange: [number, number];
  items: string[];
}[] = [
  {
    category: "ครุภัณฑ์สำนักงาน",
    division: "ENV",
    divisionLabel: "งานกายภาพและสิ่งแวดล้อม",
    priceRange: [1500, 45000],
    items: [
      "โต๊ะทำงานระดับ 1-2 พร้อมตู้ลิ้นชัก",
      "เก้าอี้สำนักงานพนักพิงสูง หุ้มผ้าตาข่าย",
      "ตู้เอกสารเหล็ก 4 ลิ้นชัก รางลูกปืน",
      "ชุดโต๊ะประชุมไม้สัก 12 ที่นั่ง",
      "ตู้บานเลื่อนกระจกเก็บเอกสารสำคัญ",
      "ชั้นวางเอกสารเหล็ก 5 ชั้น",
      "เก้าอี้แถวพักคอยสแตนเลส 4 ที่นั่ง",
      "ตู้เซฟนิรภัยกันไฟ 2 กุญแจ 1 รหัส",
      "กระดานไวท์บอร์ดกระจกนิรภัย 120x240 ซม.",
      "โต๊ะพับอเนกประสงค์ขาชุบโครเมียม"
    ]
  },
  {
    category: "ครุภัณฑ์คอมพิวเตอร์",
    division: "ENV",
    divisionLabel: "งานกายภาพและสิ่งแวดล้อม",
    priceRange: [8000, 120000],
    items: [
      "เครื่องคอมพิวเตอร์ประมวลผล Intel Core i7 RAM 32GB",
      "เครื่องคอมพิวเตอร์ All-in-One 24 นิ้ว",
      "จอภาพ LED Backlight 27 นิ้ว 4K",
      "เครื่องพิมพ์เลเซอร์มัลติฟังก์ชัน สีและขาวดำ",
      "เครื่องสำรองไฟฟ้าฉุกเฉิน (UPS) 1500VA/900W",
      "อุปกรณ์กระจายสัญญาณเครือข่าย Cisco Switch 48-Port PoE+",
      "อุปกรณ์เครือข่ายไร้สาย Wi-Fi 6 Access Point",
      "เครื่องบันทึกภาพกล้องวงจรปิด NVR 32 Channels",
      "แท็บเล็ต iPad Air สำหรับตรวจนับพัสดุ",
      "เครื่องอ่านบาร์โค้ดและ QR Code ไร้สาย 2D"
    ]
  },
  {
    category: "ครุภัณฑ์ไฟฟ้าและวิทยุ",
    division: "MAINT",
    divisionLabel: "งานพัฒนาและบำรุงรักษา",
    priceRange: [3500, 250000],
    items: [
      "เครื่องปรับอากาศแบบติดผนัง Inverter 24,000 BTU",
      "เครื่องปรับอากาศแบบตั้งแขวน 36,000 BTU",
      "เครื่องกำเนิดไฟฟ้าสำรองดีเซล 50 kVA",
      "ตู้ควบคุมระบบไฟฟ้าหลัก (MDB) 3 เฟส 400A",
      "หม้อแปลงไฟฟ้าระบบจำหน่าย 250 kVA",
      "ระบบเครื่องขยายเสียงห้องประชุม 1000W",
      "ชุดไมโครโฟนไร้สาย UHF แบบคู่",
      "เครื่องวัดคุณภาพไฟฟ้าและพลังงานดิจิทัล",
      "ระบบไฟฉุกเฉินและป้ายทางออก LED อัตโนมัติ",
      "พัดลมระบายอากาศอุตสาหกรรม 24 นิ้ว"
    ]
  },
  {
    category: "ครุภัณฑ์โรงงาน",
    division: "MAINT",
    divisionLabel: "งานพัฒนาและบำรุงรักษา",
    priceRange: [5000, 180000],
    items: [
      "เครื่องเชื่อมอาร์กอน TIG/MMA 300A",
      "แท่นกลึงโลหะตั้งโต๊ะความแม่นยำสูง",
      "เครื่องตัดเหล็กไฮดรอลิก 14 นิ้ว",
      "ปั๊มลมลูกสูบขับสายพาน 5.5 HP ถัง 300 ลิตร",
      "ชุดเครื่องมือช่างซ่อมบำรุงประจำอาคาร 128 ชิ้น",
      "สว่านแท่นแม่เหล็กเจาะเหล็กขนาด 50 มม.",
      "เครื่องฉีดน้ำแรงดันสูงอุตสาหกรรม 200 บาร์",
      "บันไดอลูมิเนียมเลื่อนยืดหดได้ 24 ฟุต",
      "รถเข็นไฮดรอลิกยกของหนัก 500 กก.",
      "รอกสลิงไฟฟ้าขนาด 1 ตัน พร้อมรีโมท"
    ]
  },
  {
    category: "ครุภัณฑ์ยานพาหนะและขนส่ง",
    division: "MAINT",
    divisionLabel: "งานพัฒนาและบำรุงรักษา",
    priceRange: [45000, 1850000],
    items: [
      "รถกระบะดับเบิ้ลแค็บ 4 ประตู งานบำรุงรักษาอาคาร",
      "รถยนต์ตู้โดยสาร 14 ที่นั่ง สำหรับภารกิจส่วนกลาง",
      "รถบรรทุก 6 ล้อ ติดเครนไฮดรอลิก 3 ตัน",
      "รถจักรยานยนต์สายตรวจกายภาพ 125 ซีซี",
      "รถกอล์ฟไฟฟ้า 6 ที่นั่ง บริการรับส่งภายในมหาวิทยาลัย",
      "รถตัดหญ้าแบบนั่งขับ 18 แรงม้า",
      "รถดูดกวาดขยะและทำความสะอาดถนน",
      "รถโฟล์คลิฟท์ไฟฟ้าขนาด 2.5 ตัน"
    ]
  },
  {
    category: "ครุภัณฑ์งานบ้านงานครัว",
    division: "ENV",
    divisionLabel: "งานกายภาพและสิ่งแวดล้อม",
    priceRange: [3000, 85000],
    items: [
      "ตู้เย็น 2 ประตู No Frost 14.5 คิว",
      "ตู้น้ำดื่มทำความเย็น-ร้อน 2 หัวจ่าย สแตนเลส",
      "เครื่องทำน้ำแข็งอัตโนมัติ 100 กก./วัน",
      "เตาไมโครเวฟดิจิทัล 30 ลิตร",
      "เครื่องขัดพื้นอัตโนมัติแบบเดินตาม 20 นิ้ว",
      "เครื่องดูดฝุ่น-ดูดน้ำอุตสาหกรรม 80 ลิตร",
      "ถังดักไขมันสแตนเลสขนาด 200 ลิตร",
      "ตู้แช่เย็นสแตนเลส 4 ประตู สำหรับจัดเลี้ยง"
    ]
  },
  {
    category: "อาคารและสิ่งปลูกสร้าง",
    division: "CENTRAL",
    divisionLabel: "ทรัพย์สินส่วนกลาง/ที่ดิน-อาคาร",
    priceRange: [500000, 150000000],
    items: [
      "อาคาร 14 (อาคารเรียนและปฏิบัติการรวม)",
      "อาคาร 19 (อาคารบริการวิชาการ)",
      "อาคารหอประชุมใหญ่ มศว ประสานมิตร",
      "อาคารสำนักงานอธิการบดี (อาคาร 9)",
      "อาคารโรงประลองวิศวกรรมศาสตร์และโรงซ่อมบำรุง",
      "ลานจอดรถและระบบโซลาร์รูฟท็อป 500 kW",
      "ระบบสถานีสูบจ่ายน้ำประปาส่วนกลาง",
      "ระบบบำบัดน้ำเสียรวมมหาวิทยาลัย"
    ]
  }
];

const LOCATIONS = [
  "อาคาร 14 ชั้น 1 ล็อก A-101",
  "อาคาร 14 ชั้น 2 ห้องประชุมใหญ่",
  "อาคาร 19 ชั้น 3 ฝ่ายอาคารสถานที่",
  "อาคารสำนักงานอธิการบดี ชั้น 4",
  "อาคารโรงซ่อมบำรุงกลาง ส่วนพัฒนากายภาพ",
  "หอประชุมใหญ่ประสานมิตร",
  "อาคาร 36 ศูนย์กีฬาและนันทนาการ",
  "อาคารนวัตกรรม ศ.ดร.สาโรช บัวศรี",
  "ศูนย์การแพทย์ มศว องครักษ์ (พื้นที่ส่วนกลาง)",
  "ลานอเนกประสงค์กลาง มศว"
];

const HOLDERS = [
  { code: "SWU-H-001", name: "นายสมชาย ใจภักดี (หัวหน้างานอาคารสถานที่)" },
  { code: "SWU-H-002", name: "นางสาวกาญจนา สุขเกษม (เจ้าหน้าที่บริหารงานทั่วไป)" },
  { code: "SWU-H-003", name: "นายวิชัย รุ่งเรือง (หัวหน้างานซ่อมบำรุงระบบไฟฟ้า)" },
  { code: "SWU-H-004", name: "นายณัฐพล ปรีชา (วิศวกรเครื่องกล)" },
  { code: "SWU-H-005", name: "นางสาวพิมลพรรณ วงศ์สว่าง (นักวิชาการพัสดุชำนาญการ)" },
  { code: "SWU-H-006", name: "นายอนุชา มณีรัตน์ (ช่างเทคนิคอาวุโส)" },
  { code: "SWU-H-007", name: "นายธนกร สุวรรณเวช (หัวหน้างานภูมิทัศน์)" }
];

const STATUS_OPTIONS = [
  { code: "ACT", name: "ใช้งานได้ปกติ", weight: 85 },
  { code: "REP", name: "ชำรุดรอซ่อม", weight: 8 },
  { code: "DIS", name: "รอจำหน่าย", weight: 5 },
  { code: "EXP", name: "จำหน่ายแล้ว", weight: 2 }
];

// Pseudo-random deterministic generator for 12,396 items
export function generateMockAssets(totalCount = 12396): AssetItem[] {
  const assets: AssetItem[] = [];
  
  for (let i = 1; i <= totalCount; i++) {
    const templateIdx = (i * 7) % CATEGORY_TEMPLATES.length;
    const template = CATEGORY_TEMPLATES[templateIdx];
    const itemSubIdx = (i * 13) % template.items.length;
    const baseName = template.items[itemSubIdx];

    const priceSeed = ((i * 9301 + 49297) % 233280) / 233280;
    const price = Math.round(template.priceRange[0] + priceSeed * (template.priceRange[1] - template.priceRange[0]));

    const locIdx = (i * 17) % LOCATIONS.length;
    const holderIdx = (i * 11) % HOLDERS.length;
    const holder = HOLDERS[holderIdx];

    // Status distribution
    const statusSeed = (i * 31) % 100;
    let status = STATUS_OPTIONS[0];
    if (statusSeed >= 85 && statusSeed < 93) status = STATUS_OPTIONS[1];
    else if (statusSeed >= 93 && statusSeed < 98) status = STATUS_OPTIONS[2];
    else if (statusSeed >= 98) status = STATUS_OPTIONS[3];

    const yearSeed = 2555 + ((i * 3) % 12);
    const mainAssetCode = `คภ-${template.division}-${(yearSeed % 100).toString().padStart(2, "0")}-${(i * 10).toString().padStart(6, "0")}`;
    const subAssetCode = `000${(i % 5) + 1}`;
    const inventoryNo = `INV-SWU-${yearSeed}-${i.toString().padStart(5, "0")}`;

    assets.push({
      index: i.toString(),
      category: template.category,
      mainAssetCode,
      subAssetCode,
      name: `${baseName} (รหัส ${i.toString().padStart(5, "0")})`,
      inventoryNo,
      acquisitionMethod: i % 3 === 0 ? "ตกลงราคา" : i % 3 === 1 ? "ประกวดราคาอิเล็กทรอนิกส์ (e-Bidding)" : "รับบริจาค/จัดสรร",
      acquisitionDate: `${((i % 28) + 1).toString().padStart(2, "0")}/${(((i % 12) + 1)).toString().padStart(2, "0")}/${yearSeed}`,
      fundingSource: i % 2 === 0 ? "งบประมาณแผ่นดิน" : "งบประมาณเงินรายได้มหาวิทยาลัย",
      quantity: "1",
      amountPosted: price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      amountNumeric: price,
      lastAuditYear: "2567",
      holderCode: holder.code,
      holderName: holder.name,
      deptCode: "SWU-PHYSDO",
      deptName: "ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ",
      plantId: i % 2 === 0 ? "1001" : "1002",
      plantName: i % 2 === 0 ? "มศว ประสานมิตร" : "มศว องครักษ์",
      locationCode: `LOC-${locIdx + 100}`,
      locationName: LOCATIONS[locIdx],
      statusCode: status.code,
      statusName: status.name,
      auditResultYear: "2567",
      auditResult: status.name === "ใช้งานได้ปกติ" ? "มีสภาพพร้อมใช้งาน" : "ตรวจพบชำรุด/ส่งซ่อมบำรุง",
      divisions: [template.division],
      divisionLabel: template.divisionLabel
    });
  }

  return assets;
}

let cachedMockAssets: AssetItem[] | null = null;

export function getCachedMockAssets(): AssetItem[] {
  if (!cachedMockAssets) {
    cachedMockAssets = generateMockAssets(12396);
  }
  return cachedMockAssets;
}
