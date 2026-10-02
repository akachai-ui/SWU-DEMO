"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { ShieldCheck, Loader2 } from "lucide-react";
import SWULogo from "./SWULogo";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.replace("/login");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-white flex flex-col items-center justify-center p-4 font-sans selection:bg-[#DA2128] selection:text-white">
        <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-8 sm:p-10 max-w-sm w-full flex flex-col items-center text-center space-y-6 animate-fadeIn relative overflow-hidden">
          <SWULogo size="xl" />

          <div className="space-y-3 flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-slate-100 border-t-[#DA2128] animate-spin"></div>
              <ShieldCheck className="w-5 h-5 text-[#DA2128] absolute" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800 tracking-tight">
                กำลังตรวจสอบสิทธิ์ กรุณารอสักครู่...
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                Verifying authorization & access privileges...
              </p>
            </div>
          </div>

          {/* Animated subtle progress bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#DA2128] via-[#FF3B44] to-[#DA2128] rounded-full animate-pulse w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user && pathname !== "/login") {
    return (
      <div className="min-h-dvh bg-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-8 max-w-sm w-full flex flex-col items-center text-center space-y-4">
          <SWULogo size="xl" />
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#DA2128]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>กรุณาเข้าสู่ระบบ กำลังเปลี่ยนเส้นทาง...</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
