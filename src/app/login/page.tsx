"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import SWULogo from "@/components/SWULogo";
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Mail,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  ShieldAlert
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, loginWithEmail, sendPasswordReset, logout } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyingText, setVerifyingText] = useState("กำลังตรวจสอบสิทธิ์ กรุณารอสักครู่...");

  // Handler for Forgot / Set Password email
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMessage("กรุณากรอกอีเมลในช่องด้านล่างก่อนกดขอลิงก์ตั้งรหัสผ่าน");
      return;
    }
    setErrorMessage("");
    setSuccessMessage("");
    setIsVerifying(true);
    setVerifyingText("กำลังส่งลิงก์สำหรับตั้งรหัสผ่านไปยังอีเมลของคุณ...");
    try {
      const res = await sendPasswordReset(email);
      setIsVerifying(false);
      if (res.success) {
        setSuccessMessage(res.message || "ส่งลิงก์ตั้งรหัสผ่านเรียบร้อยแล้ว");
      } else {
        setErrorMessage(res.message || "ไม่สามารถส่งอีเมลได้");
      }
    } catch (err: any) {
      setIsVerifying(false);
      setErrorMessage(err.message || "เกิดข้อผิดพลาดในการส่งอีเมล");
    }
  };

  // Email & Password Form Handler
  const handleEmailFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsVerifying(true);
    setVerifyingText("กำลังตรวจสอบข้อมูลและสิทธิ์การเข้าใช้งาน...");

    try {
      const res = await loginWithEmail(email, password);
      if (res.success) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("play_welcome_voice", "true");
        }
        setVerifyingText("ตรวจสอบสิทธิ์สำเร็จ กำลังเข้าสู่ระบบ...");
        setSuccessMessage("เข้าสู่ระบบสำเร็จ!");
        setTimeout(() => {
          router.push("/");
        }, 600);
      } else {
        setIsVerifying(false);
        setErrorMessage(res.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือไม่มีสิทธิ์เข้าใช้งาน");
      }
    } catch (err: any) {
      setIsVerifying(false);
      setErrorMessage(err.message || "เกิดข้อผิดพลาดในการทำรายการ");
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 via-slate-100/70 to-red-50/40 text-slate-800 flex flex-col justify-between selection:bg-[#DA2128] selection:text-white font-sans relative overflow-hidden">
      {/* Ambient Glassmorphic Background Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#DA2128]/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-red-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-slate-300/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#DA2128] via-[#FF3B44] to-[#DA2128] relative z-20"></div>

      {/* Modern Global Verification Overlay Modal */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-modal rounded-3xl p-7 sm:p-9 max-w-sm w-full flex flex-col items-center text-center space-y-5 animate-scaleUp relative overflow-hidden shadow-2xl">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#DA2128]/15 rounded-full blur-2xl pointer-events-none"></div>

            <SWULogo size="lg" />

            <div className="space-y-3 flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border-3 border-slate-200/80 border-t-[#DA2128] animate-spin"></div>
                <ShieldCheck className="w-6 h-6 text-[#DA2128] absolute" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {verifyingText}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  SWU Physical Asset Management System
                </p>
              </div>
            </div>

            <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#DA2128] via-[#FF3B44] to-[#DA2128] rounded-full animate-pulse w-4/5 mx-auto"></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container - Optimized for Smartphone & Desktop */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 relative z-10">
        <div className="w-full max-w-md">
          
          {/* Frosted Glass Card Container */}
          <div className="glass-modal rounded-3xl p-6 sm:p-8 space-y-5 sm:space-y-6 shadow-[0_20px_60px_-15px_rgba(218,33,40,0.12)] relative overflow-hidden border border-white/90">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#DA2128]/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-slate-200/40 rounded-full blur-2xl pointer-events-none"></div>

            {/* Header Text & Logo */}
            <div className="text-center space-y-3 relative z-10 flex flex-col items-center">
              <div className="flex items-center justify-center py-1">
                <SWULogo size="xl" className="mx-auto drop-shadow-sm" />
              </div>
              
              <div className="space-y-1">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  ระบบบริหารจัดการพัสดุและครุภัณฑ์
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ
                </p>
              </div>

              <div className="pt-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-red-50/80 text-[#DA2128] border border-red-200/80 backdrop-blur-xs shadow-xs">
                  🔒 ระบบเข้าใช้งานสำหรับบุคลากรภายใน
                </span>
              </div>
            </div>

            {/* If Already Logged In */}
            {user && (
              <div className="p-4 glass-pill rounded-2xl space-y-3 text-xs border border-white/80">
                <div className="flex items-center space-x-3">
                  {user.avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-red-200 shrink-0 shadow-2xs"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    style={{ display: user.avatarUrl ? "none" : "flex" }}
                    className="w-10 h-10 rounded-full bg-red-50 text-[#DA2128] font-black items-center justify-center text-sm border border-red-200 shrink-0 shadow-xs"
                  >
                    {user.name ? user.name.slice(0, 2).toUpperCase() : "SW"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-slate-500 font-mono text-[11px] truncate">{user.email}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-red-50/90 text-[#DA2128] border border-red-200">
                      {user.roleNameTh}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-1 border-t border-slate-200/70">
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        sessionStorage.setItem("play_welcome_voice", "true");
                      }
                      router.push("/");
                    }}
                    className="flex-1 py-2.5 glass-button-primary text-white font-bold rounded-xl text-center text-xs active:scale-[0.99] cursor-pointer"
                  >
                    เข้าสู่หน้าหลัก
                  </button>
                  <button
                    onClick={logout}
                    className="py-2.5 px-3.5 glass-button-secondary text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 p-3.5 rounded-2xl flex flex-col space-y-2 text-xs text-red-700 animate-fadeIn shadow-xs">
                <div className="flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-[#DA2128] shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-emerald-50/90 backdrop-blur-sm border border-emerald-200 p-3.5 rounded-2xl flex items-start space-x-2.5 text-xs text-emerald-700 font-semibold animate-fadeIn shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* Email & Password Sign-In Form */}
            <form onSubmit={handleEmailFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block text-xs">
                  อีเมลผู้ใช้งาน (User Email) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="เช่น user@g.swu.ac.th หรืออีเมลของท่าน"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isVerifying}
                    className="w-full pl-10 pr-3.5 py-3 glass-input rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-bold block text-xs">
                    รหัสผ่าน (Password) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] font-semibold text-[#DA2128] hover:underline cursor-pointer"
                  >
                    ลืมรหัสผ่าน / ขอลิงก์ตั้งรหัส
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="กรอกรหัสผ่านของท่าน"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isVerifying}
                    className="w-full pl-10 pr-10 py-3 glass-input rounded-xl text-xs text-slate-900 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full glass-button-primary text-white font-bold py-3.5 px-4 rounded-2xl active:scale-[0.99] flex items-center justify-center space-x-2 text-xs sm:text-sm cursor-pointer disabled:opacity-70 mt-3"
              >
                <span>เข้าสู่ระบบ (Sign In)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Internal System Admin Notice */}
            <div className="p-3.5 glass-pill border border-slate-200/70 rounded-2xl text-[11px] text-slate-500 space-y-1.5 mt-2">
              <div className="flex items-center space-x-1.5 font-semibold text-slate-700">
                <ShieldAlert className="w-4 h-4 text-[#DA2128] shrink-0" />
                <span>สำหรับบุคลากรใหม่:</span>
              </div>
              <p className="leading-relaxed text-slate-600">
                เนื่องจากเป็นระบบภายในส่วนพัฒนากายภาพ การสร้างบัญชีผู้ใช้และการกำหนดสิทธิ์จะดำเนินการโดย **ผู้ดูแลระบบ (Admin)** เท่านั้น หากท่านยังไม่มีบัญชีหรือต้องการขอสิทธิ์เข้าใช้งาน โปรดติดต่อผู้ดูแลระบบครับ
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-400 px-4 relative z-10">
        <p>© 2567 ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ (SWU)</p>
      </footer>
    </div>
  );
}
