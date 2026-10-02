import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

export interface RealAssetItem {
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

export interface DivisionStat {
  key: string;
  name: string;
  count: number;
  valMillion: number;
}

interface LoadedDataCache {
  assets: RealAssetItem[];
  stats: {
    totalCount: number;
    totalValuation: number;
    categories: { name: string; count: number }[];
    statuses: { name: string; count: number }[];
    divisions: DivisionStat[];
  };
}

let cachedRealData: LoadedDataCache | null = null;

function loadRealAssets(): LoadedDataCache {
  if (cachedRealData) return cachedRealData;

  const fileName = "assets_swu_67.csv";
  const filePath = path.join(process.cwd(), "data", fileName);

  if (!fs.existsSync(filePath)) {
    return {
      assets: [],
      stats: { totalCount: 0, totalValuation: 0, categories: [], statuses: [], divisions: [] }
    };
  }

  // Load sub-division datasets for cross-file unified mapping
  const envFilePath = path.join(process.cwd(), "data", "assets_physical_env_67.csv");
  const maintFilePath = path.join(process.cwd(), "data", "assets_dev_maintenance_67.csv");

  const envKeys = new Set<string>();
  if (fs.existsSync(envFilePath)) {
    const envContent = fs.readFileSync(envFilePath, "utf-8");
    const parsedEnv = Papa.parse<Record<string, string>>(envContent, { header: true, skipEmptyLines: true });
    parsedEnv.data.forEach(r => {
      const k = `${r["Inventory No."]}||${r["หมายเลขครุภัณฑ์หลัก"]}||${r["หมายเลขครุภัณฑ์ย่อย"]}||${r["รายการ คภ."]}`;
      envKeys.add(k);
    });
  }

  const maintKeys = new Set<string>();
  if (fs.existsSync(maintFilePath)) {
    const maintContent = fs.readFileSync(maintFilePath, "utf-8");
    const parsedMaint = Papa.parse<Record<string, string>>(maintContent, { header: true, skipEmptyLines: true });
    parsedMaint.data.forEach(r => {
      const k = `${r["Inventory No."]}||${r["หมายเลขครุภัณฑ์หลัก"]}||${r["หมายเลขครุภัณฑ์ย่อย"]}||${r["รายการ คภ."]}`;
      maintKeys.add(k);
    });
  }

  const csvContent = fs.readFileSync(filePath, "utf-8");
  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  const catMap: Record<string, number> = {};
  const statMap: Record<string, number> = {};
  let totalVal = 0;
  let envVal = 0;
  let maintVal = 0;
  let centralVal = 0;
  let envCount = 0;
  let maintCount = 0;
  let centralCount = 0;

  const items: RealAssetItem[] = parsed.data.map((row) => {
    const category = row["หมวดครุภัณฑ์"] || "ไม่ระบุ";
    const status = row["สถานะ คภ."] || "ไม่ระบุ";
    const amtStr = (row["Amount Posted"] || "0").replace(/,/g, "").trim();
    const amtNum = parseFloat(amtStr) || 0;

    catMap[category] = (catMap[category] || 0) + 1;
    statMap[status] = (statMap[status] || 0) + 1;
    totalVal += amtNum;

    const compKey = `${row["Inventory No."]}||${row["หมายเลขครุภัณฑ์หลัก"]}||${row["หมายเลขครุภัณฑ์ย่อย"]}||${row["รายการ คภ."]}`;
    const inEnv = envKeys.has(compKey);
    const inMaint = maintKeys.has(compKey);

    const divisions: string[] = [];
    let divisionLabel = "ส่วนกลาง/ที่ดิน-อาคาร";

    if (inEnv && inMaint) {
      divisions.push("ENV", "MAINT");
      divisionLabel = "งานกายภาพฯ / ซ่อมบำรุง (ร่วม)";
      envVal += amtNum;
      maintVal += amtNum;
      envCount++;
      maintCount++;
    } else if (inEnv) {
      divisions.push("ENV");
      divisionLabel = "งานกายภาพและสิ่งแวดล้อม";
      envVal += amtNum;
      envCount++;
    } else if (inMaint) {
      divisions.push("MAINT");
      divisionLabel = "งานพัฒนาและบำรุงรักษา";
      maintVal += amtNum;
      maintCount++;
    } else {
      divisions.push("CENTRAL");
      divisionLabel = "ทรัพย์สินส่วนกลาง/ที่ดิน-อาคาร";
      centralVal += amtNum;
      centralCount++;
    }

    return {
      index: row["ลำดับ"] || "",
      category,
      mainAssetCode: row["หมายเลขครุภัณฑ์หลัก"] || "",
      subAssetCode: row["หมายเลขครุภัณฑ์ย่อย"] || "",
      name: row["รายการ คภ."] || "",
      inventoryNo: row["Inventory No."] || "",
      acquisitionMethod: row["วิธีการได้มา"] || "",
      acquisitionDate: row["วันที่ได้มา"] || "",
      fundingSource: row["แหล่งเงิน"] || "",
      quantity: row["จำนวน"] || "1",
      amountPosted: row["Amount Posted"] || "0.00",
      amountNumeric: amtNum,
      lastAuditYear: row["ปีที่ตรวจนับล่าสุด"] || "",
      holderCode: row["รหัสผู้ถือครอง คภ."] || "",
      holderName: row["ผู้ถือครอง คภ."] || "",
      deptCode: row["รหัสหน่วยงานผู้ถือครอง"] || "",
      deptName: row["หน่วยงานผู้ถือครอง"] || "ส่วนพัฒนากายภาพ",
      plantId: row["Plant ID"] || "",
      plantName: row["Plant"] || "",
      locationCode: row["รหัสสถานที่ตั้ง"] || "",
      locationName: row["สถานที่ตั้ง"] || "",
      statusCode: row["รหัสสถานะ คภ."] || "",
      statusName: status,
      auditResultYear: row["ผลการตรวจนับ(ปี)"] || "",
      auditResult: row["ผลการตรวจนับ"] || "",
      divisions,
      divisionLabel,
    };
  });

  const categories = Object.entries(catMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const statuses = Object.entries(statMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const divisions: DivisionStat[] = [
    { key: "ALL", name: "ส่วนพัฒนากายภาพ (ทั้งหมด)", count: items.length, valMillion: totalVal / 1000000 },
    { key: "ENV", name: "งานกายภาพและสิ่งแวดล้อม", count: envCount, valMillion: envVal / 1000000 },
    { key: "MAINT", name: "งานพัฒนาและบำรุงรักษา", count: maintCount, valMillion: maintVal / 1000000 },
    { key: "CENTRAL", name: "ทรัพย์สินส่วนกลาง & ที่ดิน-อาคาร", count: centralCount, valMillion: centralVal / 1000000 }
  ];

  const result: LoadedDataCache = {
    assets: items,
    stats: {
      totalCount: items.length,
      totalValuation: totalVal,
      categories,
      statuses,
      divisions,
    }
  };

  cachedRealData = result;
  return result;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const status = searchParams.get("status") || "ALL";
  const division = searchParams.get("division") || "ALL";
  const download = searchParams.get("download") === "true";

  const { assets, stats } = loadRealAssets();

  if (download) {
    const fileType = searchParams.get("file");
    let targetFile = "assets_swu_67.csv";
    let downloadName = "SWU_Assets_2567_All.csv";

    if (fileType === "ENV") {
      targetFile = "assets_physical_env_67.csv";
      downloadName = "SWU_Assets_2567_Physical_Env.csv";
    } else if (fileType === "MAINT") {
      targetFile = "assets_dev_maintenance_67.csv";
      downloadName = "SWU_Assets_2567_Dev_Maintenance.csv";
    }

    const filePath = path.join(process.cwd(), "data", targetFile);
    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${downloadName}"`,
      },
    });
  }

  // Filter
  let filtered = assets;

  // Filter by Division
  if (division !== "ALL") {
    filtered = filtered.filter((item) => item.divisions.includes(division));
  }

  // Filter by Category
  const categoriesParam = searchParams.get("categories");
  const categoryParam = searchParams.get("category");

  if (categoriesParam && categoriesParam !== "ALL") {
    const allowedCats = categoriesParam.split(",").map((c) => c.trim()).filter(Boolean);
    if (allowedCats.length > 0) {
      filtered = filtered.filter((item) => allowedCats.includes(item.category));
    }
  } else if (categoryParam && categoryParam !== "ALL") {
    filtered = filtered.filter((item) => item.category === categoryParam);
  }

  // Filter by Status
  if (status !== "ALL") {
    filtered = filtered.filter((item) => item.statusName === status);
  }

  // Filter by Search Query
  if (search) {
    filtered = filtered.filter((item) =>
      item.name.toLowerCase().includes(search) ||
      item.inventoryNo.toLowerCase().includes(search) ||
      item.mainAssetCode.toLowerCase().includes(search) ||
      item.locationName.toLowerCase().includes(search) ||
      item.holderName.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search) ||
      item.divisionLabel.toLowerCase().includes(search)
    );
  }

  const totalFiltered = filtered.length;
  const totalPages = Math.ceil(totalFiltered / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedItems = filtered.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    success: true,
    stats,
    pagination: {
      page,
      limit,
      totalFiltered,
      totalPages,
    },
    data: paginatedItems,
  });
}
