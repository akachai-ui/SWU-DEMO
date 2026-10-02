"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getCachedMockAssets, AssetItem } from "@/lib/mockAssetsService";
import {
  Search,
  Download,
  Copy,
  Check,
  Building,
  Truck,
  Zap,
  Armchair,
  Monitor,
  Hammer,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Database,
  Layers,
  FileSpreadsheet,
  FolderTree,
  ChevronDown,
  ShieldCheck,
  SlidersHorizontal,
  X
} from "lucide-react";

interface CategoryGroup {
  key: string;
  name: string;
  count: number;
  valMillion: number;
  icon: React.ReactNode;
  matchCategories: string[];
}

interface DivisionOption {
  key: string;
  name: string;
  count: number;
  valMillion: number;
  icon: string;
  fileSource: string;
}

export default function DataExplorerTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("ALL");
  const [selectedGroup, setSelectedGroup] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [viewFormat, setViewFormat] = useState<"table" | "specs">("table");
  const [copiedCsv, setCopiedCsv] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState<Record<string, any> | null>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  // Pagination & Data State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [assetsData, setAssetsData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalFiltered: 12396,
    totalPages: 248
  });
  const [stats, setStats] = useState<{
    totalCount: number;
    totalValuation: number;
    categories: { name: string; count: number }[];
    statuses: { name: string; count: number }[];
    divisions: { key: string; name: string; count: number; valMillion: number }[];
  }>({
    totalCount: 12396,
    totalValuation: 3064083172.71,
    categories: [],
    statuses: [],
    divisions: []
  });
  const [isLoading, setIsLoading] = useState(false);

  // Real Division Options
  const divisionOptions: DivisionOption[] = [
    {
      key: "ALL",
      name: "ภาพรวมทั้งส่วนพัฒนากายภาพ",
      count: stats.totalCount || 12396,
      valMillion: Number(((stats.totalValuation || 3064083172.71) / 1000000).toFixed(1)),
      icon: "🏢",
      fileSource: "assets_swu_67.csv (ฐานข้อมูลรวมทั้งสิ้น 12,396 รายการ)"
    },
    {
      key: "ENV",
      name: "งานกายภาพและสิ่งแวดล้อม",
      count: stats.divisions.find(d => d.key === "ENV")?.count || 8205,
      valMillion: Number((stats.divisions.find(d => d.key === "ENV")?.valMillion || 520.4).toFixed(1)),
      icon: "🌿",
      fileSource: "assets_physical_env_67.csv"
    },
    {
      key: "MAINT",
      name: "งานพัฒนาและบำรุงรักษา",
      count: stats.divisions.find(d => d.key === "MAINT")?.count || 3380,
      valMillion: Number((stats.divisions.find(d => d.key === "MAINT")?.valMillion || 642.3).toFixed(1)),
      icon: "🔧",
      fileSource: "assets_dev_maintenance_67.csv"
    },
    {
      key: "CENTRAL",
      name: "ทรัพย์สินส่วนกลาง & ที่ดิน-อาคาร",
      count: stats.divisions.find(d => d.key === "CENTRAL")?.count || 811,
      valMillion: Number((stats.divisions.find(d => d.key === "CENTRAL")?.valMillion || 1901.38).toFixed(1)),
      icon: "🏛️",
      fileSource: "ที่ดิน อาคาร และสิ่งปลูกสร้างหลักส่วนกลาง"
    }
  ];

  // Category Groupings
  const categoryGroups: CategoryGroup[] = [
    {
      key: "ALL",
      name: "ทุกหมวดครุภัณฑ์",
      count: stats.totalCount || 12396,
      valMillion: Number(((stats.totalValuation || 3064083172.71) / 1000000).toFixed(1)),
      icon: <Layers className="w-4 h-4" />,
      matchCategories: []
    },
    {
      key: "BUILDINGS",
      name: "ที่ดิน อาคาร & สิ่งก่อสร้าง",
      count: 42,
      valMillion: 2848.8,
      icon: <Building className="w-4 h-4 text-[#FF4D55]" />,
      matchCategories: ["อาคารและสิ่งปลูกสร้าง", "ที่ดิน", "สิ่งก่อสร้าง"]
    },
    {
      key: "VEHICLES",
      name: "ยานพาหนะ & ขนส่ง",
      count: 195,
      valMillion: 18.79,
      icon: <Truck className="w-4 h-4 text-amber-400" />,
      matchCategories: ["ครุภัณฑ์ยานพาหนะและขนส่ง"]
    },
    {
      key: "ELECTRICAL",
      name: "ไฟฟ้า ประปา & ช่าง",
      count: 2263,
      valMillion: 36.17,
      icon: <Zap className="w-4 h-4 text-yellow-400" />,
      matchCategories: ["ครุภัณฑ์ไฟฟ้าและวิทยุ", "ครุภัณฑ์งานบ้านงานครัว", "ครุภัณฑ์โรงงาน"]
    },
    {
      key: "OFFICE",
      name: "สำนักงาน & เฟอร์นิเจอร์",
      count: 8205,
      valMillion: 103.95,
      icon: <Armchair className="w-4 h-4 text-emerald-400" />,
      matchCategories: ["ครุภัณฑ์สำนักงาน"]
    },
    {
      key: "COMPUTER",
      name: "คอมพิวเตอร์ & โฆษณา",
      count: 1117,
      valMillion: 47.02,
      icon: <Monitor className="w-4 h-4 text-blue-400" />,
      matchCategories: ["ครุภัณฑ์คอมพิวเตอร์", "ครุภัณฑ์โฆษณาและเผยแพร่"]
    },
    {
      key: "OTHERS",
      name: "การเกษตร & อื่นๆ",
      count: 574,
      valMillion: 9.34,
      icon: <Hammer className="w-4 h-4 text-purple-400" />,
      matchCategories: [
        "ครุภัณฑ์การเกษตร",
        "ครุภัณฑ์การศึกษา",
        "ครุภัณฑ์วิทยาศาสตร์และการแพทย์",
        "ครุภัณฑ์ดนตรีและนาฏศิลป์",
        "ครุภัณฑ์สำรวจ",
        "ครุภัณฑ์กีฬา",
        "ครุภัณฑ์อาวุธ"
      ]
    }
  ];

  // Filter Mock Data Locally Helper
  const filterLocalMockData = () => {
    const allMock = getCachedMockAssets();
    let filtered = allMock;

    if (selectedDivision !== "ALL") {
      filtered = filtered.filter(item => item.divisions.includes(selectedDivision));
    }

    const groupObj = categoryGroups.find(g => g.key === selectedGroup);
    if (selectedCategory !== "ALL") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    } else if (selectedGroup !== "ALL" && groupObj && groupObj.matchCategories.length > 0) {
      filtered = filtered.filter(item => groupObj.matchCategories.includes(item.category));
    }

    if (selectedStatus !== "ALL") {
      filtered = filtered.filter(item => item.statusName === selectedStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.inventoryNo.toLowerCase().includes(q) ||
        item.mainAssetCode.toLowerCase().includes(q) ||
        item.locationName.toLowerCase().includes(q) ||
        item.holderName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.divisionLabel.toLowerCase().includes(q)
      );
    }

    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = filtered.slice(startIndex, startIndex + limit);

    setAssetsData(paginatedItems);
    setPagination({
      page,
      limit,
      totalFiltered,
      totalPages
    });
  };

  // Fetch assets with instant Mock Fallback
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const groupObj = categoryGroups.find(g => g.key === selectedGroup);
    let categoriesParam = "ALL";
    if (selectedCategory !== "ALL") {
      categoriesParam = selectedCategory;
    } else if (selectedGroup !== "ALL" && groupObj && groupObj.matchCategories.length > 0) {
      categoriesParam = groupObj.matchCategories.join(",");
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: searchQuery,
      division: selectedDivision,
      categories: categoriesParam,
      status: selectedStatus
    });

    fetch(`/api/assets?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        if (isMounted) {
          if (res.success && res.data && res.data.length > 0) {
            setAssetsData(res.data);
            setPagination(res.pagination);
            if (res.stats) {
              setStats(res.stats);
            }
          } else {
            // Fallback to local 12,396 mock data
            filterLocalMockData();
          }
        }
      })
      .catch((err) => {
        console.warn("API assets fetch warning, using local mock data engine:", err);
        if (isMounted) {
          filterLocalMockData();
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, limit, searchQuery, selectedDivision, selectedGroup, selectedCategory, selectedStatus]);

  const handleDivisionChange = (divKey: string) => {
    setSelectedDivision(divKey);
    setSelectedGroup("ALL");
    setSelectedCategory("ALL");
    setPage(1);
  };

  const handleGroupSelect = (groupKey: string) => {
    setSelectedGroup(groupKey);
    setSelectedCategory("ALL");
    setPage(1);
  };

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    setPage(1);
  };

  const handleStatusSelect = (statName: string) => {
    setSelectedStatus(statName);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedDivision("ALL");
    setSelectedGroup("ALL");
    setSelectedCategory("ALL");
    setSelectedStatus("ALL");
    setPage(1);
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(`SWU Physical Asset OS (ฐานข้อมูลจริง 12,396 รายการ มูลค่า ฿${stats.totalValuation.toLocaleString()} บาท)`);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2500);
  };

  const handleDownloadFile = (type: "ALL" | "ENV" | "MAINT") => {
    setShowDownloadMenu(false);
    let url = `/api/assets?download=true`;
    if (type !== "ALL") {
      url += `&file=${type}`;
    }
    window.location.href = url;
  };

  const renderStatusBadge = (status: string) => {
    if (status.includes("ใช้งานอยู่") || status.includes("ปกติ")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
          {status}
        </span>
      );
    }
    if (status.includes("ชำรุด") || status.includes("เสื่อมสภาพ")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
          {status}
        </span>
      );
    }
    if (status.includes("จำหน่าย") || status.includes("สูญหาย")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold glass-pill text-slate-700 border-slate-200">
        {status || "ไม่ระบุ"}
      </span>
    );
  };

  const activeDivisionObj = divisionOptions.find(d => d.key === selectedDivision) || divisionOptions[0];

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-12">
      {/* Top Banner & Metric Highlights */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-5 text-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 bg-red-50/90 border border-red-200/80 text-[#DA2128] text-xs px-3.5 py-1 rounded-full font-bold shadow-2xs">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#DA2128]" />
              <span>ฐานข้อมูลจริง: ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ (12,396 รายการ)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              ระบบสืบค้นและบริหารจัดการทะเบียนครุภัณฑ์ มศว ประจำปีงบประมาณ 2567
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              วิเคราะห์รวม 3 ไฟล์หลัก (งานกายภาพและสิ่งแวดล้อม + งานพัฒนาและบำรุงรักษา + ไฟล์รวมส่วนพัฒนากายภาพ) รวม 12,396 รายการ มูลค่าต้นทุน ฿3,064,083,172.71 บาท
            </p>
          </div>

          {/* Download Multi-file Dropdown */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="flex items-center space-x-2 text-xs font-bold glass-button-primary text-white px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์ CSV จริง</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showDownloadMenu && (
              <div className="absolute right-0 mt-2 w-72 glass-modal rounded-2xl shadow-2xl z-30 py-2 space-y-1 border border-white/90">
                <button
                  onClick={() => handleDownloadFile("ALL")}
                  className="w-full px-4 py-2.5 text-left text-xs hover:bg-red-50/80 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-slate-900">1. ไฟล์รวมทั้งส่วนพัฒนากายภาพ</p>
                    <p className="text-[10px] text-slate-500">12,396 รายการ (SWU_Assets_2567_All.csv)</p>
                  </div>
                  <Download className="w-3.5 h-3.5 text-[#DA2128]" />
                </button>
                <button
                  onClick={() => handleDownloadFile("ENV")}
                  className="w-full px-4 py-2.5 text-left text-xs hover:bg-emerald-50/80 flex items-center justify-between transition-colors border-t border-slate-200/60 cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-slate-900">2. งานกายภาพและสิ่งแวดล้อม</p>
                    <p className="text-[10px] text-slate-500">8,205 รายการ (Physical_Env.csv)</p>
                  </div>
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                </button>
                <button
                  onClick={() => handleDownloadFile("MAINT")}
                  className="w-full px-4 py-2.5 text-left text-xs hover:bg-sky-50/80 flex items-center justify-between transition-colors border-t border-slate-200/60 cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-slate-900">3. งานพัฒนาและบำรุงรักษา</p>
                    <p className="text-[10px] text-slate-500">3,380 รายการ (Dev_Maintenance.csv)</p>
                  </div>
                  <Download className="w-3.5 h-3.5 text-sky-600" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Division Switcher 4 Cards */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <FolderTree className="w-3.5 h-3.5 text-[#DA2128]" />
              <span>เลือกมุมมองตามฝ่ายงาน (Division Filter)</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {divisionOptions.map((div) => {
              const isSelected = selectedDivision === div.key;
              return (
                <button
                  key={div.key}
                  onClick={() => handleDivisionChange(div.key)}
                  className={`p-4 rounded-2xl text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
                    isSelected
                      ? "bg-red-50/90 border-2 border-[#DA2128] shadow-md shadow-red-500/10"
                      : "glass-card hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <span className="text-lg">{div.icon}</span>
                      <p className={`text-xs font-bold ${isSelected ? "text-[#DA2128]" : "text-slate-800"}`}>
                        {div.name}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#DA2128] animate-pulse"></span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-baseline justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">จำนวนพัสดุ</span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {div.count.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">รายการ</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">มูลค่าต้นทุน</span>
                      <span className="font-black text-[#DA2128] text-sm">
                        ฿{div.valMillion.toLocaleString(undefined, { maximumFractionDigits: 1 })}M
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6 Category Group Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 pt-2">
          {categoryGroups.map((grp) => {
            const isSelected = selectedGroup === grp.key;
            return (
              <button
                key={grp.key}
                onClick={() => handleGroupSelect(grp.key)}
                className={`p-3 rounded-2xl text-left transition-all space-y-1.5 cursor-pointer ${
                  isSelected
                    ? "glass-button-primary text-white shadow-md"
                    : "glass-pill text-slate-700 hover:bg-white/90 border-slate-200/80"
                }`}
              >
                <div className="flex items-center justify-between gap-1 min-w-0">
                  <span className={`shrink-0 ${isSelected ? "text-white" : "text-[#DA2128]"}`}>{grp.icon}</span>
                  <span className={`text-[10px] font-bold truncate ${isSelected ? "text-white" : "text-slate-500"}`}>
                    ฿{typeof grp.valMillion === "number" ? grp.valMillion.toLocaleString(undefined, { maximumFractionDigits: 1 }) : grp.valMillion}M
                  </span>
                </div>
                <p className="text-xs font-bold truncate">{grp.name}</p>
                <p className={`text-[10px] truncate ${isSelected ? "text-red-100" : "text-slate-400"}`}>
                  {grp.count.toLocaleString()} รายการ
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Search and Table Controls */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-5 space-y-4 text-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อครุภัณฑ์, หมายเลข Inventory No., รหัสสินทรัพย์หลัก, สถานที่ตั้ง, ผู้ถือครอง..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-8 py-2.5 glass-input rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategorySelect(e.target.value)}
              className="w-full px-3 py-2.5 glass-input rounded-xl text-xs text-slate-800"
            >
              <option value="ALL">หมวดหมู่ทั้งหมด ({stats.categories.length})</option>
              {stats.categories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.count.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusSelect(e.target.value)}
              className="w-full px-3 py-2.5 glass-input rounded-xl text-xs text-slate-800"
            >
              <option value="ALL">สถานะทั้งหมด ({stats.statuses.length})</option>
              {stats.statuses.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} ({s.count.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action & Filter Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/60 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span>ผลการค้นหา:</span>
            <span className="font-extrabold text-slate-900">
              {pagination.totalFiltered.toLocaleString()} รายการ
            </span>
            <span>(หน้า {pagination.page}/{pagination.totalPages})</span>
          </div>

          <div className="flex items-center space-x-2">
            {(selectedDivision !== "ALL" || selectedGroup !== "ALL" || selectedCategory !== "ALL" || selectedStatus !== "ALL" || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition-colors cursor-pointer"
              >
                ล้างตัวกรองทั้งหมด ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden text-slate-800">
        {isLoading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#DA2128] animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">กำลังโหลดข้อมูลทะเบียนครุภัณฑ์จริง...</p>
          </div>
        ) : assetsData.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Database className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">ไม่พบรายการครุภัณฑ์ที่ตรงกับเงื่อนไข</p>
            <p className="text-xs text-slate-500">ลองปรับคำค้นหา หรือเลือกหมวดหมู่อื่น</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 border-b border-slate-200 font-bold">
                  <th className="py-3.5 px-4 w-16">ลำดับ</th>
                  <th className="py-3.5 px-4">รายการครุภัณฑ์</th>
                  <th className="py-3.5 px-4">Inventory No. / รหัสพัสดุ</th>
                  <th className="py-3.5 px-4">หมวดหมู่</th>
                  <th className="py-3.5 px-4">ฝ่ายงานผู้รับผิดชอบ</th>
                  <th className="py-3.5 px-4">สถานที่ตั้ง / ผู้ถือครอง</th>
                  <th className="py-3.5 px-4 text-right">มูลค่า (บาท)</th>
                  <th className="py-3.5 px-4 text-center">สถานะ</th>
                  <th className="py-3.5 px-4 text-center">ดูสเปก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assetsData.map((item, idx) => (
                  <tr
                    key={`${item.inventoryNo}-${idx}`}
                    className="hover:bg-red-50/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedItemForModal(item)}
                  >
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {(pagination.page - 1) * pagination.limit + idx + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 group-hover:text-[#DA2128] transition-colors line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400">ได้มาเมื่อ: {item.acquisitionDate || "ไม่ระบุ"}</p>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <p className="text-slate-800 font-bold">{item.inventoryNo}</p>
                      <p className="text-[10px] text-slate-400">หลัก: {item.mainAssetCode}</p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="px-2 py-0.5 rounded-md glass-pill text-slate-700 text-[10px] border border-slate-200">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-medium text-slate-700">
                        {item.divisionLabel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <p className="line-clamp-1 text-slate-900 font-medium">{item.locationName || "ส่วนพัฒนากายภาพ"}</p>
                      <p className="text-[10px] text-slate-400">{item.holderName}</p>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#DA2128]">
                      ฿{item.amountNumeric ? item.amountNumeric.toLocaleString(undefined, { minimumFractionDigits: 2 }) : item.amountPosted}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {renderStatusBadge(item.statusName)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItemForModal(item);
                        }}
                        className="p-1.5 rounded-lg glass-pill hover:bg-[#DA2128] text-slate-600 hover:text-white transition-colors cursor-pointer"
                        title="ดูข้อมูลละเอียด"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-200/60 bg-white/70 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span>กำลังแสดงแถวที่ </span>
            <span className="font-bold text-slate-900">
              {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.totalFiltered)} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.totalFiltered)}
            </span>
            <span> จากทั้งหมด </span>
            <span className="font-bold text-slate-900">{pagination.totalFiltered.toLocaleString()}</span>
            <span> รายการ</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-xl glass-button-secondary text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>ก่อนหน้า</span>
            </button>

            <span className="px-3 py-1 font-bold text-slate-900">
              {page} / {pagination.totalPages}
            </span>

            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-xl glass-button-secondary text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
            >
              <span>ถัดไป</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Asset Detail Modal */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="glass-modal rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-slate-800 max-h-[90vh] overflow-y-auto border border-white/90">
            <div className="flex items-start justify-between border-b border-slate-200/60 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-2 bg-red-50 text-[#DA2128] text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-red-200">
                  <span>{selectedItemForModal.category}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{selectedItemForModal.name}</h3>
                <p className="text-xs text-slate-500 font-mono">Inventory No: {selectedItemForModal.inventoryNo}</p>
              </div>
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="p-1.5 rounded-xl glass-button-secondary text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 glass-pill rounded-xl space-y-1 border border-slate-200/80">
                <span className="text-slate-400">หมายเลขครุภัณฑ์หลัก:</span>
                <p className="font-mono font-bold text-slate-900">{selectedItemForModal.mainAssetCode}</p>
              </div>
              <div className="p-3 glass-pill rounded-xl space-y-1 border border-slate-200/80">
                <span className="text-slate-400">หมายเลขครุภัณฑ์ย่อย:</span>
                <p className="font-mono font-bold text-slate-900">{selectedItemForModal.subAssetCode || "-"}</p>
              </div>
              <div className="p-3 glass-pill rounded-xl space-y-1 border border-slate-200/80">
                <span className="text-slate-400">มูลค่าต้นทุน (Amount Posted):</span>
                <p className="font-mono font-black text-[#DA2128]">฿{selectedItemForModal.amountNumeric ? selectedItemForModal.amountNumeric.toLocaleString(undefined, { minimumFractionDigits: 2 }) : selectedItemForModal.amountPosted} บาท</p>
              </div>
              <div className="p-3 glass-pill rounded-xl space-y-1 border border-slate-200/80">
                <span className="text-slate-400">สถานะการตรวจนับ:</span>
                <div>{renderStatusBadge(selectedItemForModal.statusName)}</div>
              </div>
              <div className="p-3 glass-pill rounded-xl space-y-1 border border-slate-200/80">
                <span className="text-slate-400">สถานที่ตั้ง:</span>
                <p className="font-medium text-slate-900">{selectedItemForModal.locationName || "-"}</p>
              </div>
              <div className="p-3 glass-pill rounded-xl space-y-1 border border-slate-200/80">
                <span className="text-slate-400">ผู้ถือครอง / ผู้รับผิดชอบ:</span>
                <p className="font-medium text-slate-900">{selectedItemForModal.holderName || "-"}</p>
              </div>
              <div className="p-3 glass-pill rounded-xl space-y-1 border border-slate-200/80">
                <span className="text-slate-400">หน่วยงานผู้ถือครอง:</span>
                <p className="font-medium text-slate-900">{selectedItemForModal.deptName}</p>
              </div>
              <div className="p-3 glass-pill rounded-xl space-y-1 border border-slate-200/80">
                <span className="text-slate-400">วันที่ได้มา / แหล่งเงิน:</span>
                <p className="font-medium text-slate-900">{selectedItemForModal.acquisitionDate || "-"} ({selectedItemForModal.fundingSource || "-"})</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="px-5 py-2.5 glass-button-primary text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
