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
  Key,
  User,
  ShieldCheck,
  Loader2
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, loginWithGooglePopup, loginWithEmail, registerWithEmail, sendPasswordReset, logout } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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

  // 1. Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsVerifying(true);
    setVerifyingText("กำลังเชื่อมต่อ Google และตรวจสอบสิทธิ์...");

    try {
      const res = await loginWithGooglePopup();
      if (res.success) {
        setVerifyingText("ยืนยันสิทธิ์สำเร็จ กำลังเข้าสู่ระบบ...");
        setSuccessMessage("เข้าสู่ระบบด้วย Google สำเร็จ!");
        setTimeout(() => {
          router.push("/");
        }, 800);
      } else {
        setIsVerifying(false);
        setErrorMessage(res.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google");
      }
    } catch (err: any) {
      setIsVerifying(false);
      setErrorMessage(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }
  };

  // 2. Email/Password Form Handler
  const handleEmailFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsVerifying(true);
    setVerifyingText(mode === "login" ? "กำลังตรวจสอบสิทธิ์ กรุณารอสักครู่..." : "กำลังตรวจสอบข้อมูลและลงทะเบียน...");

    try {
      if (mode === "login") {
        const res = await loginWithEmail(email, password);
        if (res.success) {
          setVerifyingText("ตรวจสอบสิทธิ์สำเร็จ กำลังเข้าสู่ระบบ...");
          setSuccessMessage("เข้าสู่ระบบสำเร็จ!");
          setTimeout(() => {
            router.push("/");
          }, 800);
        } else {
          setIsVerifying(false);
          setErrorMessage(res.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }
      } else {
        if (!name.trim()) {
          setIsVerifying(false);
          setErrorMessage("กรุณากรอกชื่อ-นามสกุล");
          return;
        }
        const res = await registerWithEmail(email, password, name);
        if (res.success) {
          setVerifyingText("ลงทะเบียนและรับรองสิทธิ์สำเร็จ กำลังเข้าสู่ระบบ...");
          setSuccessMessage("สร้างบัญชีผู้ใช้งานและเข้าสู่ระบบสำเร็จ!");
          setTimeout(() => {
            router.push("/");
          }, 800);
        } else {
          setIsVerifying(false);
          setErrorMessage(res.message || "ไม่สามารถสร้างบัญชีผู้ใช้ได้");
        }
      }
    } catch (err: any) {
      setIsVerifying(false);
      setErrorMessage(err.message || "เกิดข้อผิดพลาดในการทำรายการ");
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-800 flex flex-col justify-between selection:bg-[#DA2128] selection:text-white font-sans relative">
      {/* Top Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#DA2128] via-[#FF3B44] to-[#DA2128]"></div>

      {/* Modern Global Verification Overlay Modal */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200/90 shadow-2xl rounded-3xl p-7 sm:p-9 max-w-sm w-full flex flex-col items-center text-center space-y-5 animate-scaleUp relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#DA2128]/10 rounded-full blur-2xl pointer-events-none"></div>

            <SWULogo size="lg" />

            <div className="space-y-3 flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border-3 border-slate-100 border-t-[#DA2128] animate-spin"></div>
                <ShieldCheck className="w-6 h-6 text-[#DA2128] absolute" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {verifyingText}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Verifying credentials & security privileges...
                </p>
              </div>
            </div>

            {/* Glowing animated progress line */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#DA2128] via-[#FF3B44] to-[#DA2128] rounded-full animate-pulse w-4/5 mx-auto"></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container - Optimized for Smartphone & Desktop */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md">
          
          {/* Card Container */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-40 sm:w-48 h-40 sm:h-48 bg-[#DA2128]/5 rounded-full blur-2xl pointer-events-none"></div>

            {/* Header Text & Logo */}
            <div className="text-center space-y-3 relative z-10 flex flex-col items-center">
              <div className="flex items-center justify-center py-1">
                <SWULogo size="xl" className="mx-auto" />
              </div>
              
              <div className="space-y-0.5">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  ระบบบริหารจัดการพัสดุและครุภัณฑ์
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ
                </p>
              </div>

              <div className="pt-2 w-full">
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className={`py-2 rounded-lg transition-all ${
                      mode === "login"
                        ? "bg-white text-[#DA2128] shadow-xs"
                        : "hover:text-slate-900"
                    }`}
                  >
                    เข้าสู่ระบบ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className={`py-2 rounded-lg transition-all ${
                      mode === "register"
                        ? "bg-white text-[#DA2128] shadow-xs"
                        : "hover:text-slate-900"
                    }`}
                  >
                    ลงทะเบียนใหม่
                  </button>
                </div>
              </div>
            </div>

            {/* If Already Logged In */}
            {user && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
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
                    className="w-10 h-10 rounded-full bg-red-50 text-[#DA2128] font-black items-center justify-center text-sm border border-red-200 shrink-0"
                  >
                    {user.name ? user.name.slice(0, 2).toUpperCase() : "SW"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-slate-500 font-mono text-[11px] truncate">{user.email}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-red-50 text-[#DA2128] border border-red-200">
                      {user.roleNameTh}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-1 border-t border-slate-200">
                  <button
                    onClick={() => router.push("/")}
                    className="flex-1 py-2.5 bg-[#DA2128] active:bg-[#B81B22] text-white font-bold rounded-xl text-center transition-colors text-xs active:scale-[0.99]"
                  >
                    เข้าสู่หน้าหลัก
                  </button>
                  <button
                    onClick={logout}
                    className="py-2.5 px-3.5 bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-colors text-xs"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl flex flex-col space-y-2 text-xs text-red-700 animate-fadeIn">
                <div className="flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-[#DA2128] shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{errorMessage}</span>
                </div>
                {errorMessage.includes("Authorized Domains") && (
                  <div className="pt-1.5 border-t border-red-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px]">
                    <a
                      href="https://console.firebase.google.com/project/swu-demo-b20f8/authentication/settings"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#DA2128] hover:underline inline-flex items-center space-x-1"
                    >
                      <span>🔗 เปิด Firebase Console เพื่อเพิ่ม Domain</span>
                    </a>
                    <span className="text-slate-500">หรือใช้อีเมล/รหัสผ่านเข้าสู่ระบบ</span>
                  </div>
                )}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-start space-x-2.5 text-xs text-emerald-700 font-semibold animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* Option 1: Google Sign-In Button */}
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isVerifying}
                className="w-full bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold py-3.5 px-4 rounded-xl sm:rounded-2xl shadow-xs border border-slate-300 hover:border-slate-400 active:scale-[0.99] transition-all flex items-center justify-center space-x-3 text-xs sm:text-sm cursor-pointer disabled:opacity-70"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                  />
                </svg>
                <span>เข้าสู่ระบบด้วย Google (Sign-In)</span>
              </button>
            </div>

            {/* Symmetric Divider */}
            <div className="flex items-center my-3 space-x-3">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap px-1">
                หรือด้วยอีเมล
              </span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Option 2: Email & Password Form */}
            <form onSubmit={handleEmailFormSubmit} className="space-y-3.5 sm:space-y-4">
              {mode === "register" && (
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold block text-xs">ชื่อ - นามสกุล *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="เช่น นายสมชาย ใจดี"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isVerifying}
                      className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs text-slate-900 focus:outline-none focus:border-[#DA2128] focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-slate-700 font-bold block text-xs">อีเมล (Email) *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="user@g.swu.ac.th หรืออีเมลของท่าน"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isVerifying}
                    className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs text-slate-900 focus:outline-none focus:border-[#DA2128] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-bold block text-xs">รหัสผ่าน (Password) *</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[11px] font-semibold text-[#DA2128] hover:underline cursor-pointer"
                    >
                      ลืมรหัสผ่าน / ขอลิงก์ตั้งรหัส
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isVerifying}
                    className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs text-slate-900 focus:outline-none focus:border-[#DA2128] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-[#DA2128] hover:bg-[#B81B22] active:bg-[#9B151B] text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-red-500/20 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 text-xs sm:text-sm cursor-pointer disabled:opacity-70"
              >
                <span>{mode === "login" ? "เข้าสู่ระบบ (Sign In)" : "สร้างบัญชีผู้ใช้ใหม่"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile Browser Tip */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700 flex items-center space-x-1">
                <span>📱 คำแนะนำสำหรับผู้ใช้สมาร์ตโฟน (iOS / LINE):</span>
              </p>
              <p className="leading-relaxed">
                หากเปิดผ่านแอป LINE หรือ Safari Private Tab แล้วติดปัญหา Google Pop-up แนะนำให้เข้าสู่ระบบด้วย <b>อีเมลและรหัสผ่าน</b> ด้านบน หรือเปิดลิงก์ผ่าน Safari/Chrome
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-400 px-4">
        <p>© 2567 ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ (SWU)</p>
      </footer>
    </div>
  );
}
