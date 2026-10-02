"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DATABASE_TABLES,
  SQL_SCHEMA_SCRIPT,
  DatabaseTable
} from "@/data/schemaData";
import {
  SYSTEM_WORKFLOWS,
  CENTRAL_IT_API_SPECS,
  SystemWorkflow
} from "@/data/workflowData";
import CoreWorkflowFlowchart from "@/components/CoreWorkflowFlowchart";
import SWULogo from "@/components/SWULogo";
import ProtectedRoute from "@/components/ProtectedRoute";
import DataExplorerTab from "@/components/DataExplorerTab";
import MaterialShop from "@/components/MaterialShop";
import PermissionManager from "@/components/PermissionManager";
import {
  Server,
  Database,
  ShieldCheck,
  FileText,
  Layers,
  ArrowRight,
  Copy,
  Check,
  Search,
  Cpu,
  Cloud,
  HardDrive,
  RefreshCw,
  Lock,
  Users,
  CheckCircle2,
  BookOpen,
  Building,
  Shield,
  Flame,
  CheckCircle,
  LayoutDashboard,
  ExternalLink,
  Download,
  Table,
  FileSpreadsheet,
  Package
} from "lucide-react";

export default function DevDocsPage() {
  const [activeTab, setActiveTab] = useState<
    "architecture" | "database" | "data_explorer" | "shop" | "workflows" | "security" | "api" | "handover"
  >("data_explorer");

  // Database Tab States
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchTableQuery, setSearchTableQuery] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<DatabaseTable>(DATABASE_TABLES[0]);
  const [tableViewMode, setTableViewMode] = useState<"columns" | "data">("columns");
  const [copiedSql, setCopiedSql] = useState(false);

  const handleDownloadCsv = (table: DatabaseTable) => {
    if (!table.sampleRows || table.sampleRows.length === 0) return;
    const headers = Object.keys(table.sampleRows[0]);
    const csvContent = [
      headers.join(","),
      ...table.sampleRows.map(row => headers.map(h => `"${(row[h] || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${table.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Workflow Tab States
  const [selectedWorkflow, setSelectedWorkflow] = useState<SystemWorkflow>(SYSTEM_WORKFLOWS[0]);

  const categories = [
    "ALL",
    "1. ทะเบียนครุภัณฑ์หลัก (Core Assets)",
    "2. หมวดหมู่ & บัญชีทรัพย์สิน (Categories)",
    "3. สถานที่ตั้ง & อาคาร (Locations)",
    "4. การตรวจนับ & จำหน่าย (Audits & Disposals)"
  ];

  const filteredTables = DATABASE_TABLES.filter((t) => {
    const matchesCategory = selectedCategory === "ALL" || t.category === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchTableQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTableQuery.toLowerCase()) ||
      t.columns.some((c) => c.name.toLowerCase().includes(searchTableQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#121315] text-gray-100 flex flex-col selection:bg-[#DA2128] selection:text-white font-sans">
      {/* Top Banner with SWU Red Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#DA2128] via-[#FF3B44] to-[#DA2128]"></div>

      {/* Top Banner & Header - SWU Official Red & Gray Theme */}
      <header className="border-b border-[#2D2F33] bg-[#1B1C1E]/95 backdrop-blur sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Identity */}
            <div className="flex items-center space-x-3.5">
              <SWULogo size="md" />
              <div className="border-l border-[#37383A] pl-3">
                <div className="flex items-center space-x-2.5">
                  <h1 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                    ระบบบริหารจัดการพัสดุและครุภัณฑ์
                  </h1>
                  <span className="text-[11px] bg-[#DA2128]/20 text-[#FF4D55] border border-[#DA2128]/40 px-2.5 py-0.5 rounded-full font-bold">
                    Dev Portal (/dev)
                  </span>
                </div>
                <p className="text-xs text-[#9E9FA3] font-medium">
                  ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ (พิมพ์เขียวระบบและคู่มือส่งมอบงาน)
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="flex items-center space-x-2 text-xs font-bold bg-[#DA2128] hover:bg-[#B81B22] text-white px-3.5 py-2 rounded-lg transition-all shadow-md shadow-red-950/40"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>กลับหน้าหลัก (Home)</span>
              </Link>

              <button
                onClick={handleCopySql}
                className="hidden sm:flex items-center space-x-2 text-xs font-semibold bg-[#26272B] hover:bg-[#323438] text-gray-200 border border-[#3D3F43] px-3 py-2 rounded-lg transition-all shadow-sm"
              >
                {copiedSql ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-[#9E9FA3]" />
                )}
                <span>{copiedSql ? "คัดลอก SQL แล้ว" : "คัดลอก SQL"}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs (SWU Official Red & Gray) */}
          <div className="flex space-x-1 overflow-x-auto pb-1.5 scrollbar-none text-sm font-semibold border-t border-[#2D2F33] pt-1.5">
            <button
              onClick={() => setActiveTab("architecture")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === "architecture"
                  ? "bg-[#DA2128] text-white shadow-lg shadow-red-950/50"
                  : "text-[#9E9FA3] hover:text-white hover:bg-[#26272B]"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>1. สถาปัตยกรรมระบบ (Architecture)</span>
            </button>

            <button
              onClick={() => setActiveTab("database")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === "database"
                  ? "bg-[#DA2128] text-white shadow-lg shadow-red-950/50"
                  : "text-[#9E9FA3] hover:text-white hover:bg-[#26272B]"
              }`}
            >
              <Database className="w-4 h-4" />
              <span>2. โครงสร้างฐานข้อมูล (Database Schema)</span>
            </button>

            <button
              onClick={() => setActiveTab("data_explorer")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === "data_explorer"
                  ? "bg-[#DA2128] text-white shadow-lg shadow-red-950/50"
                  : "text-[#9E9FA3] hover:text-white hover:bg-[#26272B]"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>3. ทะเบียนครุภัณฑ์ (Asset Explorer)</span>
            </button>

            <button
              onClick={() => setActiveTab("shop")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === "shop"
                  ? "bg-[#DA2128] text-white shadow-lg shadow-red-950/50"
                  : "text-[#9E9FA3] hover:text-white hover:bg-[#26272B]"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>4. ร้านเบิกจ่ายวัสดุ & เพิ่มเข้า Firestore (Material Shop)</span>
            </button>

            <button
              onClick={() => setActiveTab("workflows")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === "workflows"
                  ? "bg-[#DA2128] text-white shadow-lg shadow-red-950/50"
                  : "text-[#9E9FA3] hover:text-white hover:bg-[#26272B]"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>5. กระบวนการทำงาน & ระเบียบฯ (Workflows)</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === "security"
                  ? "bg-[#DA2128] text-white shadow-lg shadow-red-950/50"
                  : "text-[#9E9FA3] hover:text-white hover:bg-[#26272B]"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>6. ความปลอดภัย & สิทธิ์ RBAC (Security)</span>
            </button>

            <button
              onClick={() => setActiveTab("api")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === "api"
                  ? "bg-[#DA2128] text-white shadow-lg shadow-red-950/50"
                  : "text-[#9E9FA3] hover:text-white hover:bg-[#26272B]"
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>7. สำรองข้อมูล & เชื่อมสำนักคอมพ์ (API)</span>
            </button>

            <button
              onClick={() => setActiveTab("handover")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === "handover"
                  ? "bg-[#DA2128] text-white shadow-lg shadow-red-950/50"
                  : "text-[#9E9FA3] hover:text-white hover:bg-[#26272B]"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>8. คู่มือส่งมอบงาน (Handover Manual)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ========================================================= */}
        {/* TAB 1: ARCHITECTURE (สถาปัตยกรรมระบบ) */}
        {/* ========================================================= */}
        {activeTab === "architecture" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Executive Hero Banner */}
            <div className="bg-[#1B1C1E] border border-[#2D2F33] rounded-2xl p-6 sm:p-9 relative overflow-hidden shadow-2xl">
              <div className="absolute right-0 top-0 w-96 h-96 bg-[#DA2128]/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center space-x-2 bg-[#DA2128]/15 border border-[#DA2128]/30 text-[#FF4D55] text-xs px-3.5 py-1 rounded-full font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>SWU Official Red & Gray Architecture (#DA2128 / #636466)</span>
                </div>
                
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  สถาปัตยกรรมระบบบริหารพัสดุภาครัฐ (Zero Single Point of Failure)
                </h2>
                
                <p className="text-[#C0C1C4] text-sm sm:text-base leading-relaxed">
                  พัฒนาระบบหลักบนสถาปัตยกรรมคลาวด์มาตรฐานให้ส่วนงานใช้งานได้อย่างคล่องตัว รวดเร็ว และรองรับมือถือ พร้อมวางระบบส่งต่อข้อมูลและสำรองฐานข้อมูลอัตโนมัติ (Automated Backup Sync) เข้าสู่ <strong>Data Center ของสำนักคอมพิวเตอร์</strong> เพื่อให้ศูนย์คอมพิวเตอร์มีข้อมูลพร้อมใช้และรองรับการเชื่อมต่อกับระบบ ERP กลาง
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-3">
                  <div className="bg-[#232428] border border-[#37383A] rounded-xl p-3.5 shadow-sm">
                    <p className="text-xs text-[#9E9FA3] font-medium">แกนฐานข้อมูล</p>
                    <p className="text-base font-bold text-white mt-0.5">PostgreSQL 15+</p>
                  </div>
                  <div className="bg-[#232428] border border-[#37383A] rounded-xl p-3.5 shadow-sm">
                    <p className="text-xs text-[#9E9FA3] font-medium">ความปลอดภัย</p>
                    <p className="text-base font-bold text-[#FF4D55] mt-0.5">RLS + PDPA</p>
                  </div>
                  <div className="bg-[#232428] border border-[#37383A] rounded-xl p-3.5 shadow-sm">
                    <p className="text-xs text-[#9E9FA3] font-medium">ความพร้อมใช้งาน</p>
                    <p className="text-base font-bold text-gray-100 mt-0.5">99.9% Uptime</p>
                  </div>
                  <div className="bg-[#232428] border border-[#37383A] rounded-xl p-3.5 shadow-sm">
                    <p className="text-xs text-[#9E9FA3] font-medium">การเชื่อมต่อกลาง</p>
                    <p className="text-base font-bold text-amber-400 mt-0.5">RESTful API</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Visual Diagram */}
            <div className="bg-[#1B1C1E] border border-[#2D2F33] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#2D2F33] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2.5">
                    <Server className="w-5 h-5 text-[#DA2128]" />
                    <span>แผนผังการทำงานร่วมกันระหว่างส่วนงานและสำนักคอมพิวเตอร์ (Dual-Site HA)</span>
                  </h3>
                  <p className="text-xs text-[#9E9FA3] mt-0.5">โมเดลแยกอิสระเพื่อความคล่องตัว แต่รวมศูนย์ข้อมูลเพื่อความปลอดภัย</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Site 1: Production Cloud */}
                <div className="lg:col-span-5 bg-[#212226] border border-[#DA2128]/50 rounded-xl p-5 space-y-4 shadow-lg shadow-red-950/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 bg-[#DA2128]/15 text-[#FF4D55] border border-[#DA2128]/40 rounded-md flex items-center space-x-1.5">
                      <Cloud className="w-3.5 h-3.5" />
                      <span>1. ฝั่งระบบใช้งานหลัก (Production Cloud)</span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>Primary Site</span>
                    </span>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div className="bg-[#18191B] rounded-lg p-3.5 border border-[#37383A]">
                      <p className="text-xs font-bold text-white">Next.js Web Application + Mobile QR</p>
                      <p className="text-xs text-[#9E9FA3] mt-0.5">หน้าจอเบิกจ่าย ครุภัณฑ์ สแกนตรวจนับ Dashboard</p>
                    </div>
                    <div className="bg-[#18191B] rounded-lg p-3.5 border border-[#37383A] flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">PostgreSQL / Supabase Database</p>
                        <p className="text-xs text-[#9E9FA3] mt-0.5">Row Level Security (RLS) + ACID Transaction</p>
                      </div>
                      <Database className="w-5 h-5 text-[#FF4D55]" />
                    </div>
                  </div>

                  <div className="text-xs text-[#9E9FA3] bg-[#121315] p-3 rounded-lg border border-[#2D2F33] space-y-1">
                    <p className="text-gray-200 font-bold">🎯 ประโยชน์ต่อส่วนงาน:</p>
                    <p>• ทำงานรวดเร็ว ปรับปรุงระบบได้ทันทีโดยไม่ต้องรอเปิดพอร์ต</p>
                    <p>• บุคลากรและกรรมการสแกนตรวจนับผ่านมือถือได้สะดวก</p>
                  </div>
                </div>

                {/* Middleware / Sync Pipe */}
                <div className="lg:col-span-2 flex flex-col items-center justify-center space-y-3 py-4 lg:py-0">
                  <div className="w-full flex items-center justify-center space-x-2 text-xs font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-800/60 py-2.5 px-3 rounded-lg text-center shadow-md">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Data Sync Pipe</span>
                  </div>
                  <div className="hidden lg:flex flex-col items-center space-y-1 text-gray-500 font-medium">
                    <span className="text-[10px] text-[#9E9FA3]">Real-time Webhook</span>
                    <ArrowRight className="w-4 h-4 text-[#DA2128]" />
                    <span className="text-[10px] text-[#9E9FA3]">Nightly DB Snapshot</span>
                  </div>
                </div>

                {/* Site 2: On-Premise Central IT */}
                <div className="lg:col-span-5 bg-[#212226] border border-[#3D3F43] rounded-xl p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 bg-[#26272B] text-gray-200 border border-[#37383A] rounded-md flex items-center space-x-1.5">
                      <Building className="w-3.5 h-3.5 text-[#9E9FA3]" />
                      <span>2. ฝั่งสำนักคอมพิวเตอร์ (On-Premise)</span>
                    </span>
                    <span className="text-xs font-semibold text-gray-400 flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      <span>Disaster Recovery</span>
                    </span>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div className="bg-[#18191B] rounded-lg p-3.5 border border-[#37383A]">
                      <p className="text-xs font-bold text-white">Local Standby Instance (Docker Container)</p>
                      <p className="text-xs text-[#9E9FA3] mt-0.5">พร้อมเปิดใช้งานได้ทันทีหากเกิดเหตุฉุกเฉิน</p>
                    </div>
                    <div className="bg-[#18191B] rounded-lg p-3.5 border border-[#37383A] flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">Data Center PostgreSQL Mirror</p>
                        <p className="text-xs text-[#9E9FA3] mt-0.5">เก็บไฟล์สำรองเข้ารหัส SHA-256 รายวัน</p>
                      </div>
                      <HardDrive className="w-5 h-5 text-[#9E9FA3]" />
                    </div>
                  </div>

                  <div className="text-xs text-[#9E9FA3] bg-[#121315] p-3 rounded-lg border border-[#2D2F33] space-y-1">
                    <p className="text-gray-200 font-bold">🎯 ประโยชน์ต่อสำนักคอมพิวเตอร์:</p>
                    <p>• ข้อมูลทุกอย่างถูกคัดลอกมาอยู่ในศูนย์ข้อมูลสถาบัน</p>
                    <p>• มี RESTful API พร้อมให้ ERP กลางดึงรายงานทันที</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#1B1C1E] border border-[#2D2F33] rounded-xl p-5 space-y-3">
                <div className="w-9 h-9 rounded-lg bg-[#DA2128]/20 border border-[#DA2128]/40 flex items-center justify-center text-[#FF4D55] font-black">
                  1
                </div>
                <h4 className="font-bold text-white text-base">ไร้จุดบกพร่องเดี่ยว (No SPOF)</h4>
                <p className="text-xs text-[#9E9FA3] leading-relaxed">
                  หากเซิร์ฟเวอร์ใดที่หนึ่งขัดข้อง ข้อมูลยังคงอยู่อย่างสมบูรณ์ 100% บนอีกฝั่งหนึ่ง และสามารถสลับการทำงานได้ทันที
                </p>
              </div>

              <div className="bg-[#1B1C1E] border border-[#2D2F33] rounded-xl p-5 space-y-3">
                <div className="w-9 h-9 rounded-lg bg-[#26272B] border border-[#3D3F43] flex items-center justify-center text-gray-200 font-black">
                  2
                </div>
                <h4 className="font-bold text-white text-base">สอดคล้องระเบียบ พ.ร.บ. ไซเบอร์ & PDPA</h4>
                <p className="text-xs text-[#9E9FA3] leading-relaxed">
                  ฐานข้อมูล PostgreSQL รองรับ Row-Level Security (RLS) เข้ารหัสข้อมูลและบันทึก Audit Logs ทุกรายการ
                </p>
              </div>

              <div className="bg-[#1B1C1E] border border-[#2D2F33] rounded-xl p-5 space-y-3">
                <div className="w-9 h-9 rounded-lg bg-[#DA2128]/20 border border-[#DA2128]/40 flex items-center justify-center text-[#FF4D55] font-black">
                  3
                </div>
                <h4 className="font-bold text-white text-base">พร้อมเชื่อมต่อระบบสารสนเทศกลาง</h4>
                <p className="text-xs text-[#9E9FA3] leading-relaxed">
                  มี RESTful API มาตรฐานพร้อมส่งข้อมูลให้ระบบบริหารจัดการมหาวิทยาลัย หรือระบบ SSO/LDAP ได้ทันที
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: DATABASE SCHEMA (โครงสร้างฐานข้อมูล) */}
        {/* ========================================================= */}
        {activeTab === "database" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header / Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1B1C1E] border border-[#2D2F33] p-5 rounded-2xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Database className="w-5 h-5 text-[#DA2128]" />
                  <span>พจนานุกรมข้อมูลและโครงสร้างตาราง (Data Dictionary)</span>
                </h2>
                <p className="text-xs text-[#9E9FA3] mt-0.5">
                  ออกแบบตามมาตรฐานระเบียบพัสดุภาครัฐ พ.ศ. 2560 และมาตรฐานบัญชีภาครัฐ
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#9E9FA3] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อตารางหรือฟิลด์..."
                    value={searchTableQuery}
                    onChange={(e) => setSearchTableQuery(e.target.value)}
                    className="bg-[#121315] border border-[#37383A] text-xs text-white rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-[#DA2128] w-60"
                  />
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-[#DA2128] text-white border-[#DA2128] shadow-md shadow-red-950/40"
                      : "bg-[#1B1C1E] text-[#9E9FA3] border-[#2D2F33] hover:border-[#37383A] hover:text-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Layout: Table List (Left) + Table Details (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Tables Navigation */}
              <div className="lg:col-span-4 space-y-2">
                <div className="text-xs font-bold text-[#9E9FA3] px-1 uppercase tracking-wider flex justify-between">
                  <span>ตารางในระบบ ({filteredTables.length})</span>
                  <span>Category</span>
                </div>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {filteredTables.map((tbl) => (
                    <button
                      key={tbl.id}
                      onClick={() => setSelectedTable(tbl)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between ${
                        selectedTable.id === tbl.id
                          ? "bg-[#212226] border-[#DA2128] shadow-lg text-white"
                          : "bg-[#1B1C1E] border-[#2D2F33] hover:bg-[#232428] text-gray-300 hover:border-[#37383A]"
                      }`}
                    >
                      <div className="space-y-1 pr-2">
                        <span className="font-mono text-xs font-bold text-[#FF4D55] block">
                          {tbl.name.split(" ")[0]}
                        </span>
                        <p className="text-xs text-[#9E9FA3] line-clamp-1">{tbl.description}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#26272B] text-gray-300 whitespace-nowrap border border-[#37383A]">
                        {tbl.columns.length} ฟิลด์
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Active Table Specification */}
              <div className="lg:col-span-8 bg-[#1B1C1E] border border-[#2D2F33] rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
                <div className="border-b border-[#2D2F33] pb-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 bg-[#DA2128]/15 text-[#FF4D55] border border-[#DA2128]/30 rounded-lg text-xs font-mono font-bold">
                        TABLE
                      </span>
                      <h3 className="text-xl font-bold text-white font-mono">{selectedTable.name}</h3>
                    </div>
                    <span className="text-xs bg-[#26272B] text-gray-300 px-3 py-1 rounded-full border border-[#37383A] font-medium">
                      {selectedTable.category}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center space-x-1.5 bg-[#121315] p-1 rounded-xl border border-[#2D2F33]">
                      <button
                        onClick={() => setTableViewMode("columns")}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          tableViewMode === "columns"
                            ? "bg-[#DA2128] text-white shadow-sm"
                            : "text-[#9E9FA3] hover:text-white"
                        }`}
                      >
                        <Table className="w-3.5 h-3.5" />
                        <span>1. พจนานุกรมฟิลด์ ({selectedTable.columns.length})</span>
                      </button>
                      <button
                        onClick={() => setTableViewMode("data")}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          tableViewMode === "data"
                            ? "bg-[#DA2128] text-white shadow-sm"
                            : "text-[#9E9FA3] hover:text-white"
                        }`}
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>2. ตัวอย่างข้อมูลจริง ({selectedTable.sampleRows?.length || 0} รายการ)</span>
                      </button>
                    </div>

                    {selectedTable.sampleRows && selectedTable.sampleRows.length > 0 && (
                      <button
                        onClick={() => handleDownloadCsv(selectedTable)}
                        className="flex items-center space-x-1.5 text-xs font-semibold bg-[#26272B] hover:bg-[#323438] text-gray-200 border border-[#3D3F43] px-3 py-1.5 rounded-lg transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-[#DA2128]" />
                        <span>ส่งออก CSV ({selectedTable.id}.csv)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* View Mode 1: Columns Table */}
                {tableViewMode === "columns" && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#2D2F33] text-[#9E9FA3] font-semibold bg-[#121315]">
                          <th className="py-2.5 px-3">ชื่อฟิลด์ (Column)</th>
                          <th className="py-2.5 px-3">ประเภทข้อมูล (Type)</th>
                          <th className="py-2.5 px-3">คีย์ / ข้อจำกัด</th>
                          <th className="py-2.5 px-3">คำอธิบายการใช้งาน</th>
                          <th className="py-2.5 px-3">ตัวอย่างข้อมูล</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2D2F33]/60 font-mono">
                        {selectedTable.columns.map((col) => (
                          <tr key={col.name} className="hover:bg-[#232428] transition-colors">
                            <td className="py-3 px-3 font-bold text-white">
                              {col.name}
                            </td>
                            <td className="py-3 px-3 text-[#FF4D55]">
                              {col.type}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center space-x-1">
                                {col.isPrimary && (
                                  <span className="bg-amber-950 text-amber-400 border border-amber-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                    PK
                                  </span>
                                )}
                                {col.isForeign && (
                                  <span className="bg-[#26272B] text-gray-300 border border-[#3D3F43] px-1.5 py-0.5 rounded text-[10px] font-bold" title={col.foreignRef}>
                                    FK → {col.foreignRef}
                                  </span>
                                )}
                                {!col.nullable && (
                                  <span className="text-[10px] text-[#9E9FA3]">NOT NULL</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 font-sans text-gray-300">
                              {col.description}
                            </td>
                            <td className="py-3 px-3 text-[#9E9FA3]">
                              {col.example ? (
                                <code className="bg-[#121315] px-1.5 py-0.5 rounded text-[11px] text-gray-300">
                                  {col.example}
                                </code>
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* View Mode 2: Sample Rows Table */}
                {tableViewMode === "data" && (
                  <div className="overflow-x-auto">
                    {selectedTable.sampleRows && selectedTable.sampleRows.length > 0 ? (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#2D2F33] text-[#9E9FA3] font-semibold bg-[#121315]">
                            {Object.keys(selectedTable.sampleRows[0]).map((key) => (
                              <th key={key} className="py-2.5 px-3 whitespace-nowrap font-mono text-gray-300">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2D2F33]/60 font-mono">
                          {selectedTable.sampleRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-[#232428] transition-colors">
                              {Object.keys(selectedTable.sampleRows![0]).map((key) => (
                                <td key={key} className="py-2.5 px-3 whitespace-nowrap text-gray-200">
                                  {row[key] || "-"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-xs text-[#9E9FA3] py-4 text-center">ไม่มีตัวอย่างข้อมูล</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SQL DDL Code Box */}
            <div className="bg-[#1B1C1E] border border-[#2D2F33] rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#2D2F33] pb-3">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-[#DA2128]" />
                  <h3 className="text-base font-bold text-white">
                    PostgreSQL / Supabase Ready DDL Script (สคริปต์สร้างตารางพร้อมใช้งาน)
                  </h3>
                </div>
                <button
                  onClick={handleCopySql}
                  className="flex items-center space-x-1.5 text-xs font-semibold bg-[#26272B] hover:bg-[#323438] text-white px-3.5 py-1.5 rounded-lg border border-[#3D3F43]"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#9E9FA3]" />}
                  <span>{copiedSql ? "คัดลอกสำเร็จ!" : "คัดลอกโค้ด SQL ทั้งหมด"}</span>
                </button>
              </div>

              <div className="bg-[#121315] p-4 rounded-xl border border-[#2D2F33] font-mono text-xs text-gray-300 max-h-64 overflow-y-auto">
                <pre>{SQL_SCHEMA_SCRIPT}</pre>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ASSET DATA EXPLORER (ทะเบียนครุภัณฑ์) */}
        {/* ========================================================= */}
        {activeTab === "data_explorer" && (
          <DataExplorerTab />
        )}

        {/* ========================================================= */}
        {/* TAB 4: MATERIAL SHOP & FIRESTORE FORM (ร้านเบิกจ่ายวัสดุ & ฟอร์มกรอก) */}
        {/* ========================================================= */}
        {activeTab === "shop" && (
          <MaterialShop />
        )}

        {/* ========================================================= */}
        {/* TAB 5: WORKFLOWS & REGULATIONS (กระบวนการทำงาน) */}
        {/* ========================================================= */}
        {activeTab === "workflows" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="bg-[#1B1C1E] border border-[#2D2F33] p-6 rounded-2xl space-y-2 shadow-xl">
              <div className="inline-flex items-center space-x-2 bg-[#DA2128]/15 border border-[#DA2128]/30 text-[#FF4D55] text-xs px-3.5 py-1 rounded-full font-bold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>ระเบียบกระทรวงการคลังว่าด้วยการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560</span>
              </div>
              <h2 className="text-2xl font-bold text-white">ผังขั้นตอนการปฏิบัติงานพัสดุราชการ (Standard Operating Procedure)</h2>
              <p className="text-sm text-[#9E9FA3] max-w-3xl">
                ระบบถูกออกแบบให้รองรับทุกกระบวนการตามกฎหมาย ตั้งแต่การรับพัสดุเข้าคลัง ออกรหัส QR Code การเบิกจ่าย ยืมคืน การตรวจนับประจำปี ตลอดจนการแทงจำหน่ายพัสดุ
              </p>
            </div>

            {/* Core Workflow Flowchart matching official diagram */}
            <div className="bg-[#1B1C1E] border border-[#2D2F33] rounded-2xl p-6 sm:p-8 shadow-xl">
              <CoreWorkflowFlowchart />
            </div>

            {/* Workflow Navigation */}
            <div className="space-y-4">
              <div className="border-b border-[#2D2F33] pb-2">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#DA2128]" />
                  <span>รายละเอียดขั้นตอนและข้อกฎหมายอ้างอิงรายกระบวนการ</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {SYSTEM_WORKFLOWS.map((wf, idx) => (
                  <button
                    key={wf.id}
                    onClick={() => setSelectedWorkflow(wf)}
                    className={`p-4 rounded-xl border text-left transition-all space-y-2 ${
                      selectedWorkflow.id === wf.id
                        ? "bg-[#212226] border-[#DA2128] shadow-lg text-white"
                        : "bg-[#1B1C1E] border-[#2D2F33] hover:bg-[#232428] text-[#9E9FA3] hover:text-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#FF4D55]">ขั้นตอนที่ {idx + 1}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#26272B] text-gray-300 font-medium">
                        {wf.badge}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold leading-snug line-clamp-2">{wf.title.split(". ")[1]}</h4>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Workflow Detail Card */}
            <div className="bg-[#1B1C1E] border border-[#2D2F33] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-[#2D2F33] pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{selectedWorkflow.title}</h3>
                  <span className="text-xs px-3 py-1 bg-[#DA2128]/15 text-[#FF4D55] border border-[#DA2128]/30 rounded-full font-bold">
                    {selectedWorkflow.badge}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{selectedWorkflow.description}</p>
              </div>

              {/* Step by Step Timeline */}
              <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#2D2F33]">
                {selectedWorkflow.steps.map((step, sIdx) => (
                  <div key={sIdx} className="relative group">
                    <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-[#1B1C1E] border-2 border-[#DA2128] group-hover:bg-[#DA2128] transition-colors"></div>
                    
                    <div className="bg-[#212226] border border-[#2D2F33] rounded-xl p-5 space-y-3 hover:border-[#37383A] transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-[#DA2128]/20 text-[#FF4D55] text-xs font-bold flex items-center justify-center border border-[#DA2128]/40">
                            {sIdx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-white">{step.title}</h4>
                        </div>
                        <span className="text-xs bg-[#26272B] text-amber-400 border border-[#37383A] px-2.5 py-0.5 rounded-md font-medium">
                          👤 ผู้รับผิดชอบ: {step.role}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-[#9E9FA3] font-medium">การปฏิบัติงานในระบบ:</span>
                          <p className="text-gray-200">{step.action}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[#9E9FA3] font-medium">ผลลัพธ์ / เอกสารที่ได้:</span>
                          <p className="text-emerald-400 font-medium">{step.output}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#2D2F33] flex items-center space-x-1.5 text-[11px] text-[#9E9FA3]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4D55]" />
                        <span><strong>ฐานกฎหมายอ้างอิง:</strong> {step.regulationRef}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SECURITY & COMPLIANCE (ความมั่นคงปลอดภัย) */}
        {/* ========================================================= */}
        {activeTab === "security" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-[#1B1C1E] border border-[#2D2F33] p-6 sm:p-8 rounded-2xl space-y-3 shadow-xl">
              <div className="inline-flex items-center space-x-2 bg-[#DA2128]/15 border border-[#DA2128]/30 text-[#FF4D55] text-xs px-3.5 py-1 rounded-full font-bold">
                <Shield className="w-3.5 h-3.5" />
                <span>Cybersecurity & PDPA Compliance</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                มาตรฐานความมั่นคงปลอดภัยและสิทธิ์การเข้าถึงข้อมูล (RBAC & RLS)
              </h2>
              <p className="text-sm text-gray-300 max-w-3xl leading-relaxed">
                ระบบจัดการความปลอดภัยหลายชั้น (Defense in Depth) ตั้งแต่ระดับ Network, Application ไปจนถึงระดับ Row-Level Security ในฐานข้อมูล เพื่อป้องกันการรั่วไหลของข้อมูลและปฏิบัติตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
              </p>
            </div>

            {/* 5 User Roles Matrix */}
            <div className="bg-[#1B1C1E] border border-[#2D2F33] rounded-2xl p-6 space-y-6 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#DA2128]" />
                <span>ตารางกำหนดสิทธิ์ผู้ใช้งาน (Role-Based Access Control - RBAC)</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#2D2F33] text-[#9E9FA3] bg-[#121315]">
                      <th className="py-3 px-4">บทบาท (Role)</th>
                      <th className="py-3 px-4">กลุ่มผู้ใช้งาน</th>
                      <th className="py-3 px-4">สิทธิ์การดูข้อมูล (Read)</th>
                      <th className="py-3 px-4">สิทธิ์การบันทึก/แก้ไข (Write)</th>
                      <th className="py-3 px-4">สิทธิ์การอนุมัติ (Approve)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2D2F33] font-sans">
                    <tr className="hover:bg-[#232428]">
                      <td className="py-3 px-4 font-bold text-[#FF4D55] font-mono">1. Super Admin</td>
                      <td className="py-3 px-4 text-gray-300">ผู้ดูแลระบบสารสนเทศ / สำนักคอมพ์</td>
                      <td className="py-3 px-4 text-emerald-400">ดูได้ทุกส่วนงานทั่วทั้งระบบ</td>
                      <td className="py-3 px-4 text-emerald-400">จัดการสิทธิ์, โครงสร้าง, Backup</td>
                      <td className="py-3 px-4 text-emerald-400">อนุมัติระดับระบบ</td>
                    </tr>
                    <tr className="hover:bg-[#232428]">
                      <td className="py-3 px-4 font-bold text-gray-200 font-mono">2. Inventory Officer</td>
                      <td className="py-3 px-4 text-gray-300">เจ้าหน้าที่พัสดุส่วนงาน/คณะ</td>
                      <td className="py-3 px-4 text-emerald-400">ดูพัสดุและครุภัณฑ์ทั้งหมดของส่วนงาน</td>
                      <td className="py-3 px-4 text-emerald-400">รับเข้า, พิมพ์ QR, จ่ายพัสดุ, แทงจำหน่าย</td>
                      <td className="py-3 px-4 text-[#9E9FA3]">-</td>
                    </tr>
                    <tr className="hover:bg-[#232428]">
                      <td className="py-3 px-4 font-bold text-amber-400 font-mono">3. Approver / Supervisor</td>
                      <td className="py-3 px-4 text-gray-300">หัวหน้าภาควิชา / คณบดี / ผอ.กอง</td>
                      <td className="py-3 px-4 text-emerald-400">ดูรายงานสรุปและคำขอในสังกัด</td>
                      <td className="py-3 px-4 text-[#9E9FA3]">-</td>
                      <td className="py-3 px-4 text-emerald-400">อนุมัติการเบิก, การยืม, การแทงจำหน่าย</td>
                    </tr>
                    <tr className="hover:bg-[#232428]">
                      <td className="py-3 px-4 font-bold text-purple-400 font-mono">4. Auditor</td>
                      <td className="py-3 px-4 text-gray-300">คณะกรรมการตรวจนับพัสดุประจำปี</td>
                      <td className="py-3 px-4 text-emerald-400">ดูรายการครุภัณฑ์ที่ต้องตรวจนับ</td>
                      <td className="py-3 px-4 text-emerald-400">บันทึกผลการสแกน QR Code ตรวจนับ</td>
                      <td className="py-3 px-4 text-emerald-400">ลงนามรับรองผลการตรวจนับ</td>
                    </tr>
                    <tr className="hover:bg-[#232428]">
                      <td className="py-3 px-4 font-bold text-[#9E9FA3] font-mono">5. Staff / Requester</td>
                      <td className="py-3 px-4 text-gray-300">อาจารย์ / เจ้าหน้าที่ทั่วไป</td>
                      <td className="py-3 px-4 text-gray-300">ดูเฉพาะทรัพย์สินที่ตนถือครอง / รายการที่ขอเบิก</td>
                      <td className="py-3 px-4 text-gray-300">ยื่นคำขอเบิกวัสดุ / ขอยืมครุภัณฑ์</td>
                      <td className="py-3 px-4 text-[#9E9FA3]">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Firestore User Permissions Manager */}
            <div className="bg-[#1B1C1E] border border-[#2D2F33] rounded-2xl p-6 shadow-xl">
              <PermissionManager />
            </div>

            {/* Security Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#1B1C1E] border border-[#2D2F33] rounded-xl p-5 space-y-2">
                <div className="flex items-center space-x-2 text-[#FF4D55] font-bold text-sm">
                  <Lock className="w-4 h-4" />
                  <span>Row-Level Security (RLS)</span>
                </div>
                <p className="text-xs text-[#9E9FA3] leading-relaxed">
                  ฐานข้อมูล PostgreSQL จะกรองแถวข้อมูลอัตโนมัติตามสิทธิ์ User Session แม้แฮกเกอร์จะพยายามยิง Query ตรงก็ไม่สามารถดูข้อมูลของส่วนงานอื่นได้
                </p>
              </div>

              <div className="bg-[#1B1C1E] border border-[#2D2F33] rounded-xl p-5 space-y-2">
                <div className="flex items-center space-x-2 text-gray-200 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Audit Trail Logs</span>
                </div>
                <p className="text-xs text-[#9E9FA3] leading-relaxed">
                  บันทึก Log การเข้าถึง การแก้ไข การลบ และการส่งออกข้อมูลทุกครั้ง พร้อมระบุ IP Address และ Timestamp ตามมาตรฐาน พ.ร.บ. ไซเบอร์
                </p>
              </div>

              <div className="bg-[#1B1C1E] border border-[#2D2F33] rounded-xl p-5 space-y-2">
                <div className="flex items-center space-x-2 text-[#FF4D55] font-bold text-sm">
                  <HardDrive className="w-4 h-4" />
                  <span>Data Encryption</span>
                </div>
                <p className="text-xs text-[#9E9FA3] leading-relaxed">
                  เข้ารหัสข้อมูลทั้งขณะส่งผ่านเครือข่าย (TLS 1.3 in-transit) และขณะจัดเก็บบนดิสก์ (AES-256 at-rest)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: CENTRAL IT INTEGRATION & API (เชื่อมสำนักคอมพ์) */}
        {/* ========================================================= */}
        {activeTab === "api" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#1B1C1E] border border-[#2D2F33] p-6 sm:p-8 rounded-2xl space-y-3 shadow-xl">
              <div className="inline-flex items-center space-x-2 bg-amber-950/60 border border-amber-800/60 text-amber-400 text-xs px-3.5 py-1 rounded-full font-bold">
                <Cpu className="w-3.5 h-3.5" />
                <span>Central IT Data Exchange & Backup Pipeline</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                ข้อกำหนดและช่องทางเชื่อมต่อข้อมูลกับสำนักคอมพิวเตอร์ (API Specifications)
              </h2>
              <p className="text-sm text-gray-300 max-w-3xl leading-relaxed">
                จัดเตรียม RESTful Open APIs และระบบ Webhook มาตรฐาน เพื่อให้ศูนย์คอมพิวเตอร์สามารถดึงรายงานภาพรวม นำข้อมูลไปรวมที่ระบบ ERP สถาบัน หรือรับไฟล์ Backup ทุกเที่ยงคืนได้โดยอัตโนมัติ
              </p>
            </div>

            <div className="space-y-4">
              {CENTRAL_IT_API_SPECS.map((api, idx) => (
                <div key={idx} className="bg-[#1B1C1E] border border-[#2D2F33] rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2D2F33] pb-3">
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white">{api.title}</h4>
                      <p className="text-xs text-[#9E9FA3]">{api.description}</p>
                    </div>
                    <span className="text-xs font-mono bg-amber-950 text-amber-400 border border-amber-800 px-3 py-1 rounded-lg">
                      🔒 Auth: {api.auth}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-[#DA2128]/15 text-[#FF4D55] border border-[#DA2128]/30 rounded text-xs font-mono font-bold">
                        ENDPOINT
                      </span>
                      <code className="text-xs font-mono text-white bg-[#121315] px-3 py-1 rounded-lg border border-[#2D2F33]">
                        {api.endpoint}
                      </code>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-[#9E9FA3] font-semibold uppercase">ตัวอย่าง JSON Response:</span>
                      <div className="bg-[#121315] border border-[#2D2F33] rounded-xl p-4 font-mono text-xs text-gray-200 overflow-x-auto">
                        <pre>{api.responseExample}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: HANDOVER MANUAL (คู่มือส่งมอบงาน) */}
        {/* ========================================================= */}
        {activeTab === "handover" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#1B1C1E] border border-[#2D2F33] p-6 sm:p-8 rounded-2xl space-y-3 shadow-xl">
              <div className="inline-flex items-center space-x-2 bg-[#DA2128]/15 border border-[#DA2128]/30 text-[#FF4D55] text-xs px-3.5 py-1 rounded-full font-bold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Project Handover & Governance Document</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                คู่มือการส่งมอบงานและแผนการนำไปใช้งานจริง (System Handover Manual)
              </h2>
              <p className="text-sm text-gray-300 max-w-3xl leading-relaxed">
                เอกสารสรุปความพร้อมสำหรับการส่งมอบโครงการแก่คณะกรรมการตรวจรับพัสดุ พร้อมรายการเอกสารส่งมอบ แผนการฝึกอบรมบุคลากร และแนวทางการบำรุงรักษาระยะยาว
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Deliverables Checklist */}
              <div className="bg-[#1B1C1E] border border-[#2D2F33] rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-[#FF4D55]" />
                  <span>รายการสิ่งส่งมอบโครงการ (Deliverables)</span>
                </h3>
                
                <ul className="space-y-2.5 text-xs text-gray-300">
                  <li className="flex items-start space-x-2 bg-[#212226] p-3 rounded-lg border border-[#2D2F33]">
                    <Check className="w-4 h-4 text-[#FF4D55] flex-shrink-0 mt-0.5" />
                    <span><strong>ซอร์สโค้ดระบบทั้งหมด (Full Source Code):</strong> พร้อมสิทธิ์ขาดเป็นของหน่วยงาน</span>
                  </li>
                  <li className="flex items-start space-x-2 bg-[#212226] p-3 rounded-lg border border-[#2D2F33]">
                    <Check className="w-4 h-4 text-[#FF4D55] flex-shrink-0 mt-0.5" />
                    <span><strong>ฐานข้อมูลและโครงสร้าง DDL:</strong> รองรับ PostgreSQL / Supabase พร้อมคำอธิบายฟิลด์ครบถ้วน</span>
                  </li>
                  <li className="flex items-start space-x-2 bg-[#212226] p-3 rounded-lg border border-[#2D2F33]">
                    <Check className="w-4 h-4 text-[#FF4D55] flex-shrink-0 mt-0.5" />
                    <span><strong>คู่มือการใช้งานระบบ (User Manual):</strong> สำหรับบุคลากรทั่วไป และเจ้าหน้าที่พัสดุ</span>
                  </li>
                  <li className="flex items-start space-x-2 bg-[#212226] p-3 rounded-lg border border-[#2D2F33]">
                    <Check className="w-4 h-4 text-[#FF4D55] flex-shrink-0 mt-0.5" />
                    <span><strong>คู่มือผู้ดูแลระบบและ API (Admin & API Manual):</strong> สำหรับสำนักคอมพิวเตอร์</span>
                  </li>
                  <li className="flex items-start space-x-2 bg-[#212226] p-3 rounded-lg border border-[#2D2F33]">
                    <Check className="w-4 h-4 text-[#FF4D55] flex-shrink-0 mt-0.5" />
                    <span><strong>ไฟล์สคริปต์ Docker / Deployment Config:</strong> สำหรับรันบนเซิร์ฟเวอร์ On-Premise หรือ Cloud</span>
                  </li>
                </ul>
              </div>

              {/* Maintenance & Training Plan */}
              <div className="bg-[#1B1C1E] border border-[#2D2F33] rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-300" />
                  <span>แผนการอบรมและสนับสนุนผู้ใช้ (Training & Support)</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="bg-[#212226] p-3.5 rounded-lg border border-[#2D2F33] space-y-1">
                    <div className="flex justify-between text-white font-bold">
                      <span>หลักสูตรที่ 1: การปฏิบัติงานพัสดุและตรวจนับ</span>
                      <span className="text-amber-400">3 ชั่วโมง</span>
                    </div>
                    <p className="text-[#9E9FA3]">
                      สำหรับเจ้าหน้าที่พัสดุและกรรมการตรวจนับ (การรับเข้า, ออกรหัส QR, คำนวณค่าเสื่อมราคา, การสแกนผ่านมือถือ)
                    </p>
                  </div>

                  <div className="bg-[#212226] p-3.5 rounded-lg border border-[#2D2F33] space-y-1">
                    <div className="flex justify-between text-white font-bold">
                      <span>หลักสูตรที่ 2: การขอเบิกและยืมคืนพัสดุ Online</span>
                      <span className="text-amber-400">1.5 ชั่วโมง</span>
                    </div>
                    <p className="text-[#9E9FA3]">
                      สำหรับคณาจารย์และบุคลากรทั่วไป (การยื่นคำขอเบิก, ขอยืม, ตรวจเช็กสถานะ)
                    </p>
                  </div>

                  <div className="bg-[#212226] p-3.5 rounded-lg border border-[#2D2F33] space-y-1">
                    <div className="flex justify-between text-white font-bold">
                      <span>หลักสูตรที่ 3: ผู้ดูแลระบบและการเชื่อมต่อ API</span>
                      <span className="text-amber-400">2 ชั่วโมง</span>
                    </div>
                    <p className="text-[#9E9FA3]">
                      สำหรับทีม IT สำนักคอมพิวเตอร์ (การจัดการสิทธิ์, ตรวจสอบ Log, ตั้งค่า Backup และเชื่อมต่อ API)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#2D2F33] bg-[#161718] py-6 text-center text-xs text-[#9E9FA3]">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-gray-200">© 2026 Srinakharinwirot University (SWU). All Rights Reserved.</p>
          <p className="text-gray-400">
            Physical Development Division • Government Asset & Inventory Management System (มศว สีเทา-แดง)
          </p>
        </div>
      </footer>
    </div>
    </ProtectedRoute>
  );
}
