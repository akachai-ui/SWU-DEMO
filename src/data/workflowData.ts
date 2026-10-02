export interface WorkflowStep {
  title: string;
  role: string;
  action: string;
  output: string;
  regulationRef: string;
}

export interface SystemWorkflow {
  id: string;
  title: string;
  badge: string;
  description: string;
  color: string;
  steps: WorkflowStep[];
}

export const SYSTEM_WORKFLOWS: SystemWorkflow[] = [
  {
    id: "procurement_receive",
    title: "1. กระบวนการตรวจรับและขึ้นทะเบียนพัสดุ/ครุภัณฑ์",
    badge: "การรับเข้า (Acquisition)",
    description: "ขั้นตอนการนำพัสดุและครุภัณฑ์ที่ผ่านการจัดซื้อจัดจ้างหรือรับบริจาคเข้าสู่ระบบสารสนเทศ",
    color: "blue",
    steps: [
      {
        title: "คณะกรรมการตรวจรับพัสดุ",
        role: "กรรมการตรวจรับ",
        action: "ตรวจสอบความถูกต้องของพัสดุ/ครุภัณฑ์ตามใบสั่งซื้อ (PO) หรือสัญญาจัดซื้อจัดจ้าง",
        output: "ใบตรวจรับพัสดุ (ลงนามรับของ)",
        regulationRef: "ระเบียบฯ 2560 ข้อ 175-181"
      },
      {
        title: "บันทึกข้อมูลเข้าระบบ",
        role: "เจ้าหน้าที่พัสดุ",
        action: "กรอกข้อมูลใบตรวจรับ รหัสพัสดุ ราคา แหล่งเงินงบประมาณ และแนบไฟล์เอกสารประกอบ",
        output: "ข้อมูลรับเข้าในฐานข้อมูล (Status: Received)",
        regulationRef: "ระเบียบฯ 2560 ข้อ 203"
      },
      {
        title: "ออกรหัสครุภัณฑ์ & พิมพ์ QR Code",
        role: "เจ้าหน้าที่พัสดุ",
        action: "ระบบ Generate รหัสครุภัณฑ์ตามหมวดหมู่ พร้อมพิมพ์ป้าย QR Code ทนความร้อนเพื่อติดที่ตัวครุภัณฑ์",
        output: "ป้าย QR Code / บันทึกในทะเบียนคุมทรัพย์สิน",
        regulationRef: "มาตรฐาน สตง. & กรมบัญชีกลาง"
      },
      {
        title: "ส่งมอบให้ผู้ถือครอง / หน่วยงาน",
        role: "ผู้รับผิดชอบ / หัวหน้าสาขา",
        action: "ส่งมอบครุภัณฑ์ไปยังสถานที่ติดตั้งจริง พร้อมผู้รับผิดชอบกดยืนยันรับมอบผ่านระบบ",
        output: "สถานะ: พร้อมใช้งาน (IN_USE)",
        regulationRef: "ระเบียบฯ 2560 ข้อ 204"
      }
    ]
  },
  {
    id: "consumable_requisition",
    title: "2. กระบวนการขอเบิกและตัดจ่ายวัสดุสิ้นเปลือง",
    badge: "การเบิกจ่าย (Requisition)",
    description: "ระบบขอเบิกวัสดุสำนักงาน/คอมพิวเตอร์ Online พร้อมการอนุมัติและตัดสต็อกอัตโนมัติ",
    color: "emerald",
    steps: [
      {
        title: "ยื่นใบขอเบิก Online",
        role: "บุคลากร / อาจารย์ / เจ้าหน้าที่",
        action: "เลือกรายการวัสดุ ระบุจำนวน และเหตุผลความจำเป็นในการขอเบิกใช้งาน",
        output: "ใบขอเบิกพัสดุ (Status: Pending Approval)",
        regulationRef: "ระเบียบฯ 2560 ข้อ 205"
      },
      {
        title: "พิจารณาอนุมัติคำขอ",
        role: "หัวหน้างาน / ผู้อนุมัติ",
        action: "ตรวจสอบความเหมาะสมและกดอนุมัติคำขอเบิกผ่านระบบ (มีแจ้งเตือนทาง Email/Line)",
        output: "ใบขอเบิกอนุมัติแล้ว (Status: Approved)",
        regulationRef: "ตามอำนาจสั่งการของหัวหน้าหน่วยงาน"
      },
      {
        title: "จ่ายพัสดุและตัดสต็อก",
        role: "เจ้าหน้าที่พัสดุ",
        action: "จัดเตรียมพัสดุ ตรวจนับมอบให้ผู้เบิก และกดยืนยันจ่ายของในระบบ",
        output: "ตัดยอดสต็อกคงเหลืออัตโนมัติ (Stock-out transaction)",
        regulationRef: "ระเบียบฯ 2560 ข้อ 206"
      }
    ]
  },
  {
    id: "asset_loan",
    title: "3. กระบวนการยืม-คืนครุภัณฑ์",
    badge: "การยืม-คืน (Borrow/Return)",
    description: "การขอยืมครุภัณฑ์เพื่อการเรียนการสอน กิจกรรม หรืองานวิจัยภายนอกสถานที่",
    color: "amber",
    steps: [
      {
        title: "ยื่นคำขอยืมครุภัณฑ์",
        role: "ผู้ขอยืม",
        action: "เลือกรายการครุภัณฑ์ ระบุวัตถุประสงค์ และกำหนดวันส่งคืน",
        output: "คำขอยืมครุภัณฑ์",
        regulationRef: "ระเบียบฯ 2560 ข้อ 208-212"
      },
      {
        title: "ตรวจสอบสภาพก่อนส่งมอบ",
        role: "เจ้าหน้าที่พัสดุ & ผู้ยืม",
        action: "ตรวจเช็กสภาพการทำงาน ถ่ายภาพบันทึกเข้าระบบ และส่งมอบ",
        output: "สถานะครุภัณฑ์: ถูกยืม (BORROWED)",
        regulationRef: "ระเบียบฯ 2560 ข้อ 210"
      },
      {
        title: "ตรวจรับคืนและเช็กสภาพ",
        role: "เจ้าหน้าที่พัสดุ",
        action: "สแกน QR Code รับคืน ตรวจสอบความสมบูรณ์ หากชำรุดบันทึกรายการซ่อมทันที",
        output: "ปิดใบยืม / คืนสถานะ: พร้อมใช้งาน (IN_USE)",
        regulationRef: "ระเบียบฯ 2560 ข้อ 212"
      }
    ]
  },
  {
    id: "annual_audit",
    title: "4. การตรวจสอบพัสดุประจำปี (Annual Audit)",
    badge: "การตรวจนับ (Physical Audit)",
    description: "กระบวนการตรวจนับพัสดุและครุภัณฑ์ประจำปีงบประมาณด้วยระบบสแกน QR Code ผ่านมือถือ",
    color: "purple",
    steps: [
      {
        title: "แต่งตั้งคณะกรรมการตรวจนับ",
        role: "หัวหน้าหน่วยงาน",
        action: "ออกคำสั่งแต่งตั้งกรรมการตรวจนับพัสดุประจำปีก่อนสิ้นปีงบประมาณ",
        output: "คำสั่งแต่งตั้งกรรมการตรวจนับ",
        regulationRef: "ระเบียบฯ 2560 ข้อ 213"
      },
      {
        title: "สแกน QR Code ตรวจนับภาคสนาม",
        role: "คณะกรรมการตรวจนับ",
        action: "ใช้สมาร์ตโฟนเปิดระบบ สแกน QR Code ติดตัวครุภัณฑ์ ระบบจะบันทึกพิกัดห้องและสภาพทันที",
        output: "Audit Log รายชิ้น (Found / Damaged / Missing)",
        regulationRef: "ระเบียบฯ 2560 ข้อ 213 วรรคสอง"
      },
      {
        title: "สรุปรายงานผลการตรวจนับ",
        role: "คณะกรรมการตรวจนับ & พัสดุ",
        action: "ระบบประมวลผลอัตโนมัติ ออกรายงานเปรียบเทียบระหว่างยอดบัญชีกับของจริงที่ตรวจพบ",
        output: "รายงานผลการตรวจสอบพัสดุประจำปี (Export PDF)",
        regulationRef: "ระเบียบฯ 2560 ข้อ 214"
      }
    ]
  },
  {
    id: "disposal_writeoff",
    title: "5. กระบวนการจำหน่ายพัสดุ (Disposal / Write-off)",
    badge: "การแทงจำหน่าย (Disposal)",
    description: "การตัดจำหน่ายพัสดุที่ชำรุด เสื่อมสภาพ หรือหมดความจำเป็นออกจากบัญชีทรัพย์สิน",
    color: "rose",
    steps: [
      {
        title: "เสนอขอแทงจำหน่าย",
        role: "เจ้าหน้าที่พัสดุ",
        action: "รวบรวมรายการพัสดุชำรุด/เสื่อมสภาพจากรายงานตรวจนับ เสนอวิธีจำหน่าย (ขายทอดตลาด / โอน / ทำลาย)",
        output: "รายงานเสนอขออนุมัติจำหน่าย",
        regulationRef: "ระเบียบฯ 2560 ข้อ 215"
      },
      {
        title: "อนุมัติการจำหน่าย",
        role: "หัวหน้าหน่วยงาน / อธิการบดี",
        action: "พิจารณาและลงนามอนุมัติคำสั่งจำหน่ายพัสดุตามอำนาจวงเงิน",
        output: "คำสั่งอนุมัติจำหน่ายพัสดุ",
        regulationRef: "ระเบียบฯ 2560 ข้อ 216"
      },
      {
        title: "ดำเนินการจำหน่ายและตัดบัญชี",
        role: "เจ้าหน้าที่พัสดุ",
        action: "บันทึกผลการขาย/ทำลาย นำส่งเงินรายได้ (ถ้ามี) และระบบตัดยอดออกจากทะเบียนคุมทรัพย์สินถาวร",
        output: "สถานะ: จำหน่ายแล้ว (DISPOSED) / ปรับยอดบัญชี",
        regulationRef: "ระเบียบฯ 2560 ข้อ 217-219"
      }
    ]
  }
];

export const CENTRAL_IT_API_SPECS = [
  {
    endpoint: "GET /api/v1/sync/assets/summary",
    title: "1. ดึงสรุปยอดและมูลค่าสินทรัพย์รวม",
    description: "สำหรับให้สำนักคอมพ์ดึงข้อมูลไปแสดงผลบน Executive Dashboard ของมหาวิทยาลัย",
    auth: "Bearer Token / API Key",
    responseExample: `{
  "success": true,
  "department": "คณะวิทยาศาสตร์ มศว",
  "fiscal_year": 2567,
  "total_assets_count": 1420,
  "total_cost_value": 45850000.00,
  "total_net_book_value": 28400000.00,
  "status_breakdown": {
    "IN_USE": 1380,
    "DAMAGED": 15,
    "REPAIRING": 5,
    "DISPOSAL_PENDING": 20
  }
}`
  },
  {
    endpoint: "POST /api/v1/sync/backup/nightly-dump",
    title: "2. ส่ง Snapshot ข้อมูลสำรองเข้าสู่ Data Center มหาวิทยาลัย",
    description: "ระบบ Cloud ส่งไฟล์สำรองฐานข้อมูล PostgreSQL เข้ารหัส SHA-256 มาเก็บที่ On-Premise ทุกเที่ยงคืน",
    auth: "Mutual TLS + Payload Signing",
    responseExample: `{
  "status": "SUCCESS",
  "backup_file": "backup_swu_inv_2567_10_01.sql.gz",
  "checksum_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "stored_location": "/data/backups/inventory/2567/10/",
  "timestamp": "2026-10-01T23:59:59Z"
}`
  },
  {
    endpoint: "POST /api/v1/sync/webhooks/asset-event",
    title: "3. Real-time Event Webhook",
    description: "ยิงแจ้งเตือนทันทีเมื่อมีการเปลี่ยนแปลงสถานะสำคัญ เช่น การแทงจำหน่าย หรือรับเข้าพัสดุมูลค่าเกิน 500,000 บาท",
    auth: "HMAC Signature",
    responseExample: `{
  "event": "ASSET_ACQUISITION",
  "asset_code": "วท.คอม.67-001/2567",
  "name": "เครื่องคอมพิวเตอร์แม่ข่าย (Server Node 1)",
  "cost": 185000.00,
  "location": "อาคาร 19 ชั้น 5 ห้อง 19-502",
  "timestamp": "2026-10-01T14:30:00Z"
}`
  }
];
