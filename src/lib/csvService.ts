import Papa from "papaparse";

// โครงสร้างข้อมูลจริงจากไฟล์ ครุภัณฑ์ ปี67.csv (ส่วนพัฒนากายภาพ มศว)
export interface SWUAsset67Record {
  ลำดับ: string;
  หมวดครุภัณฑ์: string;
  หมายเลขครุภัณฑ์หลัก: string;
  หมายเลขครุภัณฑ์ย่อย: string;
  "รายการ คภ.": string;
  "Inventory No.": string;
  วิธีการได้มา: string;
  วันที่ได้มา: string;
  แหล่งเงิน: string;
  จำนวน: string;
  "Amount Posted": string;
  ปีที่ตรวจนับล่าสุด: string;
  "รหัสผู้ถือครอง คภ.": string;
  "ผู้ถือครอง คภ.": string;
  รหัสหน่วยงานผู้ถือครอง: string;
  หน่วยงานผู้ถือครอง: string;
  "Plant ID": string;
  Plant: string;
  รหัสสถานที่ตั้ง: string;
  สถานที่ตั้ง: string;
  "รหัสสถานะ คภ.": string;
  "สถานะ คภ.": string;
  "ผลการตรวจนับ(ปี)": string;
  ผลการตรวจนับ: string;
}

export function parseCSV<T>(csvText: string): T[] {
  const result = Papa.parse<T>(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
  });
  return result.data;
}

export function exportToCSV<T>(data: T[]): string {
  return Papa.unparse(data);
}
