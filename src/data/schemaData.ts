export interface TableColumn {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  foreignRef?: string;
  nullable: boolean;
  description: string;
  example?: string;
}

export interface DatabaseTable {
  id: string;
  name: string;
  category: "1. ทะเบียนครุภัณฑ์หลัก (Core Assets)" | "2. หมวดหมู่ & บัญชีทรัพย์สิน (Categories)" | "3. สถานที่ตั้ง & อาคาร (Locations)" | "4. การตรวจนับ & จำหน่าย (Audits & Disposals)";
  description: string;
  govStandard: string;
  columns: TableColumn[];
  sampleRows?: Record<string, string>[];
}

export const DATABASE_TABLES: DatabaseTable[] = [
  // 1. ทะเบียนครุภัณฑ์หลัก (ตรงตามไฟล์ ครุภัณฑ์ ปี67.csv)
  {
    id: "physical_assets",
    name: "physical_assets (ทะเบียนครุภัณฑ์และสินทรัพย์ ส่วนพัฒนากายภาพ)",
    category: "1. ทะเบียนครุภัณฑ์หลัก (Core Assets)",
    description: "ตารางหลักเก็บรายการครุภัณฑ์ ที่ดิน อาคาร และยานพาหนะ ทั้งหมด 12,396 รายการ ของส่วนพัฒนากายภาพ มศว (รหัสหน่วยงาน 1100080000)",
    govStandard: "ระเบียบกระทรวงการคลังว่าด้วยการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560 & ระบบ GFMIS",
    columns: [
      { name: "id", type: "UUID / BIGSERIAL", isPrimary: true, nullable: false, description: "ลำดับรายการ (Primary Key)" },
      { name: "inventory_no", type: "VARCHAR(100)", nullable: false, description: "หมายเลข Inventory No. ประจำทรัพย์สิน", example: "100-2000000001070000-3-ZN" },
      { name: "main_asset_code", type: "VARCHAR(50)", nullable: false, description: "หมายเลขครุภัณฑ์หลัก", example: "200000000107" },
      { name: "sub_asset_code", type: "VARCHAR(20)", nullable: false, description: "หมายเลขครุภัณฑ์ย่อย", example: "0" },
      { name: "asset_name", type: "TEXT", nullable: false, description: "ชื่อรายการครุภัณฑ์ / ทรัพย์สิน (รายการ คภ.)", example: "อาคารศูนย์อำนวยการพัฒนานวัตกรรม" },
      { name: "category", type: "VARCHAR(150)", nullable: false, description: "หมวดครุภัณฑ์", example: "อาคารถาวร, ครุภัณฑ์ยานพาหนะและขนส่ง, ครุภัณฑ์ไฟฟ้าและวิทยุ" },
      { name: "acquisition_method", type: "VARCHAR(100)", nullable: true, description: "วิธีการได้มา", example: "ผลิต/ก่อสร้าง, ตกลงราคา, ซื้อ-E-Bidding" },
      { name: "acquisition_date", type: "DATE / VARCHAR(20)", nullable: true, description: "วันที่ได้มา", example: "31/3/2018" },
      { name: "funding_source", type: "VARCHAR(255)", nullable: true, description: "แหล่งเงินที่ใช้จัดซื้อ", example: "เงินรายได้ (เงินอุดหนุนจากรัฐบาล), งบประมาณรายจ่าย" },
      { name: "quantity", type: "DECIMAL(10,3)", nullable: false, description: "จำนวนหน่วย", example: "1.000" },
      { name: "amount_posted", type: "DECIMAL(16,2)", nullable: false, description: "มูลค่าต้นทุนทรัพย์สิน (บาท)", example: "406516250.00" },
      { name: "last_audit_year", type: "VARCHAR(10)", nullable: true, description: "ปีที่ตรวจนับล่าสุด", example: "2567" },
      { name: "dept_code", type: "VARCHAR(20)", nullable: false, description: "รหัสหน่วยงานผู้ถือครอง", example: "1100080000" },
      { name: "dept_name", type: "VARCHAR(150)", nullable: false, description: "ชื่อหน่วยงานผู้ถือครอง", example: "ส่วนพัฒนากายภาพ" },
      { name: "plant_id", type: "VARCHAR(20)", nullable: true, description: "Plant ID", example: "1002" },
      { name: "plant_name", type: "VARCHAR(150)", nullable: true, description: "ชื่อ Plant สังกัด", example: "สำนักงานอธิการบดี-พัฒนากายภาพ" },
      { name: "location_code", type: "VARCHAR(50)", nullable: true, description: "รหัสสถานที่ตั้ง", example: "1100080301" },
      { name: "location_name", type: "TEXT", nullable: true, description: "สถานที่ตั้ง / อาคาร / ห้อง", example: "สก-อ.สนอ. 3 ห้องสนง.พัฒนาและกายภาพ" },
      { name: "status_code", type: "VARCHAR(20)", nullable: false, description: "รหัสสถานะ คภ.", example: "0001" },
      { name: "status_name", type: "VARCHAR(50)", nullable: false, description: "สถานะ คภ. (เช่น ใช้งานได้ตามปกติ, จำหน่าย, รอจำหน่าย)", example: "ใช้งานได้ตามปกติ" },
    ],
    sampleRows: [
      { id: "1", inventory_no: "100-1000000000010000-2-ZN", asset_name: "ที่ดินด้านหลังคณะสังคมศาสตร์ ถ.อโศกมนตรี", category: "ที่ดิน", amount_posted: "230,337,378.54", status_name: "ใช้งานได้ตามปกติ", location_name: "มศว ประสานมิตร" },
      { id: "14", inventory_no: "100-2000000001070000-3-ZN", asset_name: "อาคารศูนย์อำนวยการพัฒนานวัตกรรม (อาคาร 400 ล้าน)", category: "อาคารถาวร", amount_posted: "406,516,250.00", status_name: "ใช้งานได้ตามปกติ", location_name: "สก-อ.สนอ. 3 ห้องสนง.พัฒนาและกายภาพ" },
      { id: "24", inventory_no: "100-2200000000240000-3-ZN", asset_name: "หอพระ มศว", category: "สิ่งปลูกสร้างถาวร", amount_posted: "1,818,866.00", status_name: "ใช้งานได้ตามปกติ", location_name: "มศว ประสานมิตร" },
      { id: "27", inventory_no: "100-2200000000320000-3-ZN", asset_name: "ระบบสาธารณูปการรายการระบบไฟฟ้าแรงสูง", category: "สิ่งปลูกสร้างถาวร", amount_posted: "5,463,000.00", status_name: "ใช้งานได้ตามปกติ", location_name: "ส่วนพัฒนากายภาพ" },
      { id: "43", inventory_no: "7110-024-401", asset_name: "เก้าอี้ Rock Worth", category: "ครุภัณฑ์สำนักงาน", amount_posted: "1.00", status_name: "ใช้งานได้ตามปกติ", location_name: "สก-อ.สนอ. 3 ห้องสนง.พัฒนาและกายภาพ" },
    ]
  },

  // 2. หมวดหมู่ครุภัณฑ์ตามระเบียบงบประมาณ
  {
    id: "asset_categories",
    name: "asset_categories (หมวดหมู่ครุภัณฑ์ 33 หมวดจริง)",
    category: "2. หมวดหมู่ & บัญชีทรัพย์สิน (Categories)",
    description: "โครงสร้างหมวดหมู่ครุภัณฑ์ตามที่จำแนกจริงในไฟล์ ครุภัณฑ์ ปี67.csv",
    govStandard: "มาตรฐานการจำแนกงบประมาณรายจ่ายและระบบบัญชี มศว",
    columns: [
      { name: "category_name", type: "VARCHAR(150)", isPrimary: true, nullable: false, description: "ชื่อหมวดครุภัณฑ์", example: "อาคารถาวร, ครุภัณฑ์ยานพาหนะและขนส่ง" },
      { name: "total_items", type: "INTEGER", nullable: false, description: "จำนวนรายการในหมวด", example: "20" },
      { name: "total_value_thb", type: "DECIMAL(16,2)", nullable: false, description: "มูลค่าต้นทุนรวม (บาท)", example: "2083007694.15" },
    ],
    sampleRows: [
      { category_name: "อาคารถาวร", total_items: "20", total_value_thb: "2,083,007,694.15" },
      { category_name: "ที่ดิน", total_items: "3", total_value_thb: "490,864,308.54" },
      { category_name: "สิ่งปลูกสร้างถาวร", total_items: "13", total_value_thb: "245,168,875.00" },
      { category_name: "ครุภัณฑ์สำนักงาน (รวม LVA)", total_items: "8,205", total_value_thb: "103,950,311.69" },
      { category_name: "ครุภัณฑ์ไฟฟ้าและวิทยุ (รวม LVA)", total_items: "2,263", total_value_thb: "36,165,913.08" },
      { category_name: "ครุภัณฑ์ยานพาหนะและขนส่ง (รวม LVA)", total_items: "195", total_value_thb: "18,788,496.47" },
    ]
  },

  // 3. ข้อมูลสถานที่ตั้งและอาคาร
  {
    id: "asset_locations",
    name: "asset_locations (สถานที่ตั้งและอาคารที่จัดวางครุภัณฑ์)",
    category: "3. สถานที่ตั้ง & อาคาร (Locations)",
    description: "รหัสสถานที่ตั้งและอาคารที่ครุภัณฑ์ตั้งอยู่จริง อ้างอิงตามข้อมูลในไฟล์",
    govStandard: "ฐานข้อมูลพื้นที่และสิ่งก่อสร้าง มศว",
    columns: [
      { name: "location_code", type: "VARCHAR(50)", isPrimary: true, nullable: false, description: "รหัสสถานที่ตั้ง", example: "1100080301" },
      { name: "location_name", type: "TEXT", nullable: false, description: "ชื่อสถานที่ / อาคาร / ห้อง", example: "สก-อ.สนอ. 3 ห้องสนง.พัฒนาและกายภาพ" },
      { name: "plant_id", type: "VARCHAR(20)", nullable: false, description: "Plant ID", example: "1000, 1002" },
      { name: "dept_name", type: "VARCHAR(150)", nullable: false, description: "หน่วยงานผู้ดูแล", example: "ส่วนพัฒนากายภาพ" },
    ],
    sampleRows: [
      { location_code: "1100080301", location_name: "สก-อ.สนอ. 3 ห้องสนง.พัฒนาและกายภาพ", plant_id: "1000", dept_name: "ส่วนพัฒนากายภาพ" },
      { location_code: "1100080000", location_name: "สำนักงานอธิการบดี-พัฒนากายภาพ", plant_id: "1002", dept_name: "ส่วนพัฒนากายภาพ" },
    ]
  },

  // 4. บันทึกผลการตรวจนับและการจำหน่าย
  {
    id: "asset_audit_and_disposals",
    name: "asset_audit_and_disposals (บันทึกการตรวจนับและแทงจำหน่าย)",
    category: "4. การตรวจนับ & จำหน่าย (Audits & Disposals)",
    description: "บันทึกผลการตรวจนับประจำปีงบประมาณและรายการที่แทงจำหน่ายตามระเบียบ",
    govStandard: "ระเบียบกระทรวงการคลังฯ พ.ศ. 2560 ข้อ 213 (ตรวจนับ) และหมวด 9 (แทงจำหน่าย)",
    columns: [
      { name: "inventory_no", type: "VARCHAR(100)", isPrimary: true, nullable: false, description: "Inventory No." },
      { name: "audit_year", type: "VARCHAR(10)", nullable: false, description: "ปีที่ตรวจนับ", example: "2567" },
      { name: "status_name", type: "VARCHAR(50)", nullable: false, description: "สถานะผลการตรวจนับ", example: "ใช้งานได้ตามปกติ, จำหน่าย, รอจำหน่าย" },
      { name: "audit_result", type: "TEXT", nullable: true, description: "หมายเหตุผลการตรวจนับ" },
    ],
    sampleRows: [
      { inventory_no: "100-2000000001550000-2-63", audit_year: "2567", status_name: "จำหน่าย", audit_result: "ศาลาอเนกประสงค์ (จำหน่ายออกจากบัญชี)" },
      { inventory_no: "100-2000000001070000-3-ZN", audit_year: "2567", status_name: "ใช้งานได้ตามปกติ", audit_result: "ตรวจนับพบตามปกติ สภาพพร้อมใช้งาน" },
    ]
  }
];

export const SQL_SCHEMA_SCRIPT = `-- ====================================================================
-- SWU PHYSICAL DEVELOPMENT OFFICE - OFFICIAL ASSET DATABASE DDL (2567)
-- ฐานข้อมูลทะเบียนครุภัณฑ์จริง ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ
-- อ้างอิงตามโครงสร้างไฟล์: ครุภัณฑ์ ปี67.csv (12,396 รายการ)
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ตารางหลัก: ทะเบียนครุภัณฑ์และสินทรัพย์ (Physical Assets)
CREATE TABLE IF NOT EXISTS physical_assets (
    id BIGSERIAL PRIMARY KEY,
    inventory_no VARCHAR(100) NOT NULL,
    main_asset_code VARCHAR(50) NOT NULL,
    sub_asset_code VARCHAR(20) NOT NULL DEFAULT '0',
    asset_name TEXT NOT NULL,
    category VARCHAR(150) NOT NULL,
    acquisition_method VARCHAR(100),
    acquisition_date VARCHAR(30),
    funding_source VARCHAR(255),
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1.000,
    amount_posted DECIMAL(16,2) NOT NULL DEFAULT 0.00,
    last_audit_year VARCHAR(10),
    holder_code VARCHAR(50),
    holder_name VARCHAR(150),
    dept_code VARCHAR(20) NOT NULL DEFAULT '1100080000',
    dept_name VARCHAR(150) NOT NULL DEFAULT 'ส่วนพัฒนากายภาพ',
    plant_id VARCHAR(20),
    plant_name VARCHAR(150),
    location_code VARCHAR(50),
    location_name TEXT,
    status_code VARCHAR(20) NOT NULL DEFAULT '0001',
    status_name VARCHAR(50) NOT NULL DEFAULT 'ใช้งานได้ตามปกติ',
    audit_result_year VARCHAR(10),
    audit_result TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for ultra-fast search & query
CREATE INDEX IF NOT EXISTS idx_assets_inventory_no ON physical_assets(inventory_no);
CREATE INDEX IF NOT EXISTS idx_assets_category ON physical_assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_status ON physical_assets(status_name);
CREATE INDEX IF NOT EXISTS idx_assets_location ON physical_assets(location_code);

-- Enable Row Level Security (RLS)
ALTER TABLE physical_assets ENABLE ROW LEVEL SECURITY;
`;
