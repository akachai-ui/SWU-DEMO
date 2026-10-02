"use client";

import React, { useState } from "react";
import Link from "next/link";
import SWULogo from "@/components/SWULogo";
import ProtectedRoute from "@/components/ProtectedRoute";
import MaterialShop from "@/components/MaterialShop";
import DataExplorerTab from "@/components/DataExplorerTab";
import RequisitionManagement from "@/components/RequisitionManagement";
import PermissionManager from "@/components/PermissionManager";
import { useAuth } from "@/lib/authContext";
import {
  Package,
  BookOpen,
  LogOut,
  User,
  ShieldCheck,
  FileSpreadsheet,
  ShoppingBag,
  FileText,
  Users
} from "lucide-react";

export default function RealPortalPage() {
  const { user, logout } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState<"shop" | "my_requests" | "approvals" | "assets" | "users">("shop");

  const canApprove = user?.permissions?.canApproveRequisitions || user?.role === "super_admin";
  const canManageUsers = user?.permissions?.canManageUsers || user?.role === "super_admin";

  return (
    <ProtectedRoute>
      <div className="min-h-dvh bg-[#F8FAFC] text-slate-800 flex flex-col justify-between selection:bg-[#DA2128] selection:text-white font-sans">
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#DA2128] via-[#FF3B44] to-[#DA2128]"></div>

        {/* Unified Premium Navbar with Structured Hierarchy */}
        <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Top Row: Brand Identity (Left) & User Profile + Tools (Right) */}
            <div className="flex items-center justify-between py-2.5 sm:py-3.5 gap-2 sm:gap-4 border-b border-slate-100/90 min-w-0">
              
              {/* Brand & Identity */}
              <div className="flex items-center space-x-2.5 sm:space-x-4 min-w-0 flex-1">
                <div className="shrink-0 flex items-center">
                  <SWULogo size="md" className="hidden sm:block" />
                  <SWULogo size="sm" className="sm:hidden" />
                </div>
                <div className="border-l border-slate-200 pl-2.5 sm:pl-4 min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center space-x-1.5">
                    <h1 className="font-black text-sm sm:text-lg md:text-xl text-slate-900 tracking-tight leading-tight truncate">
                      <span className="sm:hidden">ระบบคลังพัสดุ & ครุภัณฑ์</span>
                      <span className="hidden sm:inline">ระบบบริหารคลังพัสดุและครุภัณฑ์</span>
                    </h1>
                    <span className="hidden sm:inline-flex text-[10px] bg-red-50 text-[#DA2128] border border-red-200/80 px-2 py-0.5 rounded-full font-bold leading-none shrink-0">
                      มศว
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight truncate">
                    <span className="sm:hidden">ส่วนพัฒนากายภาพ มศว</span>
                    <span className="hidden sm:inline">ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ</span>
                  </p>
                </div>
              </div>

              {/* Right: User Profile Capsule & Navigation Tools */}
              <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
                {user && (
                  <div className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-50 border border-slate-200/80 hover:border-slate-300 p-1 sm:pl-1.5 sm:pr-2.5 sm:py-1 rounded-full transition-all shadow-xs">
                    {user.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover border border-red-200 shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      style={{ display: user.avatarUrl ? "none" : "flex" }}
                      className="w-7 h-7 rounded-full bg-red-50 border border-red-200 items-center justify-center text-[11px] font-black text-[#DA2128] shrink-0"
                    >
                      {user.name ? user.name.slice(0, 2).toUpperCase() : "SW"}
                    </div>

                    <div className="hidden md:flex items-center space-x-1.5 px-0.5">
                      <span className="text-xs font-bold text-slate-800 whitespace-nowrap max-w-[120px] truncate leading-tight" title={user.name}>
                        {user.name}
                      </span>
                      <span className="hidden lg:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 leading-none">
                        {user.role === "super_admin" ? "Admin" : user.role === "technician" ? "ช่าง" : "Staff"}
                      </span>
                    </div>

                    <button
                      onClick={logout}
                      className="p-1 hover:bg-red-50 text-slate-400 hover:text-[#DA2128] rounded-full transition-colors shrink-0"
                      title="ออกจากระบบ"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <Link
                  href="/dev"
                  className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-[#DA2128] bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-full transition-all shadow-xs shrink-0"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#DA2128]" />
                  <span>คู่มือ</span>
                </Link>
              </div>

            </div>

            {/* Bottom Row: Desktop Navigation Tabs (Segmented Controller with Full Space) */}
            <div className="hidden sm:flex py-2.5 items-center overflow-x-auto scrollbar-none">
              <div className="flex items-center space-x-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 text-xs font-bold min-w-full sm:min-w-0">
                <button
                  onClick={() => setActiveMainTab("shop")}
                  className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-none ${
                    activeMainTab === "shop"
                      ? "bg-white text-[#DA2128] shadow-sm font-black scale-100"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ร้านเบิกจ่ายวัสดุ</span>
                </button>

                <button
                  onClick={() => setActiveMainTab("my_requests")}
                  className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-none ${
                    activeMainTab === "my_requests"
                      ? "bg-white text-[#DA2128] shadow-sm font-black scale-100"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>ประวัติการเบิกของฉัน</span>
                </button>

                {canApprove && (
                  <button
                    onClick={() => setActiveMainTab("approvals")}
                    className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-none ${
                      activeMainTab === "approvals"
                        ? "bg-white text-[#DA2128] shadow-sm font-black scale-100"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>ศูนย์อนุมัติคำขอเบิก</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveMainTab("assets")}
                  className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-none ${
                    activeMainTab === "assets"
                      ? "bg-white text-[#DA2128] shadow-sm font-black scale-100"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>ทะเบียนครุภัณฑ์ (12,396 รายการ)</span>
                </button>

                {canManageUsers && (
                  <button
                    onClick={() => setActiveMainTab("users")}
                    className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-none ${
                      activeMainTab === "users"
                        ? "bg-white text-[#DA2128] shadow-sm font-black scale-100"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>จัดการผู้ใช้และสิทธิ์</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </header>

        {/* Main Operational Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-7 pb-28 sm:pb-8">
          {activeMainTab === "shop" && <MaterialShop />}
          {activeMainTab === "my_requests" && <RequisitionManagement initialViewMode="my_requests" />}
          {activeMainTab === "approvals" && <RequisitionManagement initialViewMode="approvals" />}
          {activeMainTab === "assets" && <DataExplorerTab />}
          {activeMainTab === "users" && <PermissionManager />}
        </main>

        {/* Native Smartphone App Bottom Navigation Bar (1-Thumb Navigation) */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5 px-2 print:hidden">
          <div className="flex items-center justify-around max-w-lg mx-auto">
            <button
              onClick={() => setActiveMainTab("shop")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all active:scale-95 flex-1 ${
                activeMainTab === "shop"
                  ? "text-[#DA2128] font-black"
                  : "text-slate-400 hover:text-slate-700 font-medium"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${activeMainTab === "shop" ? "bg-red-50 text-[#DA2128] scale-105" : ""}`}>
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 leading-tight font-bold">ร้านเบิก</span>
            </button>

            <button
              onClick={() => setActiveMainTab("my_requests")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all active:scale-95 flex-1 ${
                activeMainTab === "my_requests"
                  ? "text-[#DA2128] font-black"
                  : "text-slate-400 hover:text-slate-700 font-medium"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${activeMainTab === "my_requests" ? "bg-red-50 text-[#DA2128] scale-105" : ""}`}>
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 leading-tight font-bold">ประวัติฉัน</span>
            </button>

            {canApprove && (
              <button
                onClick={() => setActiveMainTab("approvals")}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all active:scale-95 flex-1 ${
                  activeMainTab === "approvals"
                    ? "text-[#DA2128] font-black"
                    : "text-slate-400 hover:text-slate-700 font-medium"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${activeMainTab === "approvals" ? "bg-red-50 text-[#DA2128] scale-105" : ""}`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 leading-tight font-bold">อนุมัติ</span>
              </button>
            )}

            <button
              onClick={() => setActiveMainTab("assets")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all active:scale-95 flex-1 ${
                activeMainTab === "assets"
                  ? "text-[#DA2128] font-black"
                  : "text-slate-400 hover:text-slate-700 font-medium"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${activeMainTab === "assets" ? "bg-red-50 text-[#DA2128] scale-105" : ""}`}>
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 leading-tight font-bold">ครุภัณฑ์</span>
            </button>

            {canManageUsers && (
              <button
                onClick={() => setActiveMainTab("users")}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all active:scale-95 flex-1 ${
                  activeMainTab === "users"
                    ? "text-[#DA2128] font-black"
                    : "text-slate-400 hover:text-slate-700 font-medium"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${activeMainTab === "users" ? "bg-red-50 text-[#DA2128] scale-105" : ""}`}>
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 leading-tight font-bold">สิทธิ์ผู้ใช้</span>
              </button>
            )}
          </div>
        </nav>

        {/* Official Modern Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-5 text-center text-xs text-slate-500 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-slate-600">
              <span className="font-bold text-slate-800">มหาวิทยาลัยศรีนครินทรวิโรฒ</span>
              <span>•</span>
              <span>ส่วนพัฒนากายภาพ</span>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <Link href="/dev" className="text-slate-600 hover:text-[#DA2128] transition-colors">
                พิมพ์เขียวระบบและคู่มือ (/dev)
              </Link>
              <span className="text-slate-300">|</span>
              <button onClick={logout} className="text-slate-600 hover:text-[#DA2128] transition-colors">
                ออกจากระบบ
              </button>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
