"use client";

import React from "react";
import { ArrowDown } from "lucide-react";

export default function CoreWorkflowFlowchart() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2D2F33] pb-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <span className="w-3 h-3 rounded-sm bg-[#DA2128] inline-block"></span>
            <span>2. ผังกระบวนการทำงานหลัก (Core Workflows)</span>
          </h3>
          <p className="text-xs text-[#9E9FA3]">
            แผนผังแสดง 3 กระบวนการหลักตามระเบียบกระทรวงการคลังฯ พ.ศ. 2560 (มศว สีเทา-แดง)
          </p>
        </div>
        <span className="text-[11px] font-semibold text-[#9E9FA3] bg-[#232428] px-2.5 py-1 rounded-md border border-[#37383A]">
          Flowchart Diagram
        </span>
      </div>

      {/* 3 Columns Grid matching the image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ========================================================= */}
        {/* COLUMN 1: การรับพัสดุเข้าคลัง */}
        {/* ========================================================= */}
        <div className="bg-[#18191B] border border-[#2D2F33] rounded-xl overflow-hidden flex flex-col shadow-lg">
          {/* Box Header */}
          <div className="bg-[#26272B] border-b border-[#37383A] px-4 py-2.5">
            <h4 className="text-xs font-bold text-white tracking-wide">
              1. การรับพัสดุเข้าคลัง
            </h4>
          </div>

          {/* Flow content */}
          <div className="p-6 flex-1 flex flex-col items-center justify-start space-y-3 text-xs">
            {/* Step 1 */}
            <div className="w-full max-w-[240px] bg-[#212226] border border-[#3D3F43] rounded-lg py-2.5 px-3 text-center text-gray-100 font-semibold shadow-sm hover:border-[#DA2128] transition-colors">
              จัดซื้อจัดจ้าง / บริจาค / โอนมา
            </div>

            <ArrowDown className="w-4 h-4 text-[#9E9FA3]" />

            {/* Step 2 */}
            <div className="w-full max-w-[240px] bg-[#212226] border border-[#3D3F43] rounded-lg py-2.5 px-3 text-center text-gray-100 font-semibold shadow-sm hover:border-[#DA2128] transition-colors">
              บันทึกใบตรวจรับ / เลข PO / สัญญา
            </div>

            <ArrowDown className="w-4 h-4 text-[#9E9FA3]" />

            {/* Diamond Decision: ประเภทพัสดุ */}
            <div className="relative my-2 py-4 flex items-center justify-center">
              <div className="w-28 h-28 bg-[#28181A] border-2 border-[#DA2128] rotate-45 rounded-lg flex items-center justify-center shadow-md">
                <div className="-rotate-45 text-center px-1">
                  <span className="font-bold text-white text-[12px] block">
                    ประเภทพัสดุ
                  </span>
                </div>
              </div>
            </div>

            {/* Branch labels & Boxes */}
            <div className="w-full grid grid-cols-2 gap-3 pt-2">
              {/* Branch Left: วัสดุ */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-[11px] font-bold text-[#9E9FA3] bg-[#26272B] px-2 py-0.5 rounded border border-[#37383A]">
                  วัสดุ
                </span>
                <ArrowDown className="w-3.5 h-3.5 text-[#9E9FA3]" />
                <div className="w-full bg-[#212226] border border-[#3D3F43] rounded-lg p-2.5 text-center text-gray-200 font-medium hover:border-[#DA2128] transition-colors min-h-[54px] flex items-center justify-center">
                  เพิ่มยอดสต็อกในคลัง
                </div>
              </div>

              {/* Branch Right: ครุภัณฑ์ */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-[11px] font-bold text-[#FF4D55] bg-[#DA2128]/20 px-2 py-0.5 rounded border border-[#DA2128]/40">
                  ครุภัณฑ์
                </span>
                <ArrowDown className="w-3.5 h-3.5 text-[#DA2128]" />
                <div className="w-full bg-[#212226] border border-[#3D3F43] rounded-lg p-2.5 text-center text-gray-200 font-medium hover:border-[#DA2128] transition-colors min-h-[54px] flex items-center justify-center">
                  ออกรหัสครุภัณฑ์ & พิมพ์ QR Code
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 2: การเบิกจ่าย & ยืมคืน */}
        {/* ========================================================= */}
        <div className="bg-[#18191B] border border-[#2D2F33] rounded-xl overflow-hidden flex flex-col shadow-lg">
          {/* Box Header */}
          <div className="bg-[#26272B] border-b border-[#37383A] px-4 py-2.5">
            <h4 className="text-xs font-bold text-white tracking-wide">
              2. การเบิกจ่าย & ยืมคืน
            </h4>
          </div>

          {/* Flow content */}
          <div className="p-6 flex-1 flex flex-col items-center justify-start space-y-3 text-xs">
            {/* Step 1 */}
            <div className="w-full max-w-[240px] bg-[#212226] border border-[#3D3F43] rounded-lg py-2.5 px-3 text-center text-gray-100 font-semibold shadow-sm hover:border-[#DA2128] transition-colors">
              ผู้ขอ ยื่นคำขอ Online
            </div>

            <ArrowDown className="w-4 h-4 text-[#9E9FA3]" />

            {/* Step 2 */}
            <div className="w-full max-w-[240px] bg-[#212226] border border-[#3D3F43] rounded-lg py-2.5 px-3 text-center text-gray-100 font-semibold shadow-sm hover:border-[#DA2128] transition-colors">
              หัวหน้างานพิจารณาอนุมัติ
            </div>

            <ArrowDown className="w-4 h-4 text-[#9E9FA3]" />

            {/* Step 3 */}
            <div className="w-full max-w-[240px] bg-[#212226] border border-[#3D3F43] rounded-lg py-2.5 px-3 text-center text-gray-100 font-semibold shadow-sm hover:border-[#DA2128] transition-colors">
              เจ้าหน้าที่พัสดุจ่ายของ / ส่งมอบ
            </div>

            {/* Branch Split */}
            <div className="w-full grid grid-cols-2 gap-3 pt-6 mt-auto">
              {/* Branch Left: วัสดุ */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-[11px] font-bold text-[#9E9FA3] bg-[#26272B] px-2 py-0.5 rounded border border-[#37383A]">
                  วัสดุ
                </span>
                <ArrowDown className="w-3.5 h-3.5 text-[#9E9FA3]" />
                <div className="w-full bg-[#212226] border border-[#3D3F43] rounded-lg p-2.5 text-center text-gray-200 font-medium hover:border-[#DA2128] transition-colors min-h-[54px] flex items-center justify-center">
                  ตัดสต็อกสำเร็จ
                </div>
              </div>

              {/* Branch Right: ครุภัณฑ์ */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-[11px] font-bold text-[#FF4D55] bg-[#DA2128]/20 px-2 py-0.5 rounded border border-[#DA2128]/40">
                  ครุภัณฑ์
                </span>
                <ArrowDown className="w-3.5 h-3.5 text-[#DA2128]" />
                <div className="w-full bg-[#212226] border border-[#3D3F43] rounded-lg p-2.5 text-center text-gray-200 font-medium hover:border-[#DA2128] transition-colors min-h-[54px] flex items-center justify-center">
                  บันทึกการถือครอง / กำหนดวันคืน
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 3: วงรอบประจำปี & จำหน่าย */}
        {/* ========================================================= */}
        <div className="bg-[#18191B] border border-[#2D2F33] rounded-xl overflow-hidden flex flex-col shadow-lg">
          {/* Box Header */}
          <div className="bg-[#26272B] border-b border-[#37383A] px-4 py-2.5">
            <h4 className="text-xs font-bold text-white tracking-wide">
              3. วงรอบประจำปี & จำหน่าย
            </h4>
          </div>

          {/* Flow content */}
          <div className="p-6 flex-1 flex flex-col items-center justify-start space-y-3 text-xs">
            {/* Step 1 */}
            <div className="w-full max-w-[240px] bg-[#212226] border border-[#3D3F43] rounded-lg py-2.5 px-3 text-center text-gray-100 font-semibold shadow-sm hover:border-[#DA2128] transition-colors">
              แต่งตั้งกรรมการตรวจนับ
            </div>

            <ArrowDown className="w-4 h-4 text-[#9E9FA3]" />

            {/* Step 2 */}
            <div className="w-full max-w-[240px] bg-[#212226] border border-[#3D3F43] rounded-lg py-2.5 px-3 text-center text-gray-100 font-semibold shadow-sm hover:border-[#DA2128] transition-colors">
              สแกน QR ตรวจสอบสภาพประจำปี
            </div>

            <ArrowDown className="w-4 h-4 text-[#9E9FA3]" />

            {/* Step 3 */}
            <div className="w-full max-w-[240px] bg-[#212226] border border-[#3D3F43] rounded-lg py-2.5 px-3 text-center text-gray-100 font-semibold shadow-sm hover:border-[#DA2128] transition-colors">
              สรุปรายงานผลการตรวจนับ
            </div>

            <div className="flex flex-col items-center space-y-1 py-1">
              <span className="text-[10px] text-amber-400 font-medium bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                ชำรุด/เสื่อมสภาพ
              </span>
              <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
            </div>

            {/* Step 4: แทงจำหน่าย */}
            <div className="w-full bg-[#212226] border border-[#DA2128]/60 rounded-lg p-3 text-center text-gray-100 font-semibold hover:bg-[#28181A] transition-colors mt-auto">
              <p className="text-white">กระบวนการแทงจำหน่าย:</p>
              <p className="text-[11px] text-[#9E9FA3] font-normal mt-0.5">ขาย / โอน / บริจาค / ทำลาย</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
