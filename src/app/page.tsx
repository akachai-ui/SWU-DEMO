"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import SWULogo from "@/components/SWULogo";
import ProtectedRoute from "@/components/ProtectedRoute";
import MaterialShop from "@/components/MaterialShop";
import DataExplorerTab from "@/components/DataExplorerTab";
import RequisitionManagement from "@/components/RequisitionManagement";
import PermissionManager from "@/components/PermissionManager";
import { useAuth } from "@/lib/authContext";
import {
  subscribeToRequisitions,
  RequisitionOrder
} from "@/lib/consumablesService";
import {
  Package,
  BookOpen,
  LogOut,
  User,
  ShieldCheck,
  FileSpreadsheet,
  ShoppingBag,
  FileText,
  Users,
  Bell,
  BellRing,
  Volume2,
  X,
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function RealPortalPage() {
  const { user, logout } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState<"shop" | "my_requests" | "approvals" | "assets" | "users">("shop");

  // Requisitions & Real-time Alert States
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const [newRequisitionAlert, setNewRequisitionAlert] = useState<RequisitionOrder | null>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [welcomeToast, setWelcomeToast] = useState<string | null>(null);
  const isInitialLoadRef = useRef(true);
  const prevPendingCountRef = useRef(0);

  // Specific Permission Flags
  const canViewShop = user?.permissions?.canViewConsumables !== false || user?.role === "super_admin";
  const canViewMyRequests = user?.permissions?.canRequestConsumables !== false || user?.permissions?.canViewConsumables !== false || user?.role === "super_admin";
  const canApprove = Boolean(user?.permissions?.canApproveRequisitions || user?.role === "super_admin");
  const canViewAssets = Boolean(user?.permissions?.canViewAssets || user?.role === "super_admin");
  const canManageUsers = Boolean(user?.permissions?.canManageUsers || user?.role === "super_admin");
  const canAccessDev = Boolean(user?.permissions?.canAccessDevPortal || user?.role === "super_admin");

  // 1. Audio and Speech Synthesizer Preloading & Global Gesture Unlock
  useEffect(() => {
    if (typeof window === "undefined") return;

    const unlockAudioAndVoices = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          if (ctx.state === "suspended") {
            ctx.resume();
          }
        }
      } catch (e) {}

      if ("speechSynthesis" in window) {
        window.speechSynthesis.resume();
        window.speechSynthesis.getVoices();
      }
    };

    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    window.addEventListener("click", unlockAudioAndVoices, { passive: true });
    window.addEventListener("touchstart", unlockAudioAndVoices, { passive: true });

    return () => {
      window.removeEventListener("click", unlockAudioAndVoices);
      window.removeEventListener("touchstart", unlockAudioAndVoices);
    };
  }, []);

  // Play pleasant chime synthesizer on new incoming requisition
  const playNotificationChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Chime audio error:", e);
    }
  };

  // Fallback Web Speech API
  const speakWithSynthesis = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "th-TH";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const allVoices = window.speechSynthesis.getVoices();
      const thaiVoice = allVoices.find((v) => v.lang === "th-TH" || v.lang.replace("_", "-").toLowerCase().startsWith("th"));
      if (thaiVoice) {
        utterance.voice = thaiVoice;
      }

      utterance.onerror = (e) => {
        console.warn("Speech synthesis utterance error:", e);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis error:", err);
    }
  };

  // Play Natural Thai Voice Alert + Chime
  const playVoiceAndChimeAlert = (order?: Partial<RequisitionOrder>) => {
    playNotificationChime();

    const requester = order?.requesterName ? `จากคุณ ${order.requesterName}` : "";
    const messageText = `มีคำขอเบิกพัสดุใหม่ ${requester} รอการอนุมัติค่ะ`;

    if (typeof window === "undefined") return;

    let hasFallbackRun = false;
    const runFallback = () => {
      if (hasFallbackRun) return;
      hasFallbackRun = true;
      speakWithSynthesis(messageText);
    };

    try {
      const audioUrl = `/api/tts?text=${encodeURIComponent(messageText)}&t=${Date.now()}`;
      const audio = new Audio(audioUrl);
      audio.volume = 1.0;

      audio.onerror = (e) => {
        console.warn("TTS audio error:", e);
        runFallback();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("TTS audio play prevented or failed:", err);
          runFallback();
        });
      }
    } catch (e) {
      runFallback();
    }
  };

  // Play Warm Welcome Voice on Login
  const playWelcomeVoice = (name?: string) => {
    playNotificationChime();

    const userDisplayName = name ? `คุณ ${name}` : "";
    const welcomeText = `ยินดีต้อนรับ${userDisplayName} เข้าสู่ระบบบริหารคลังพัสดุ มศว ค่ะ`;
    setWelcomeToast(`ยินดีต้อนรับ ${userDisplayName || "ท่าน"} เข้าสู่ระบบ`);
    setTimeout(() => setWelcomeToast(null), 6000);

    if (typeof window === "undefined") return;

    let hasFallbackRun = false;
    const runFallback = () => {
      if (hasFallbackRun) return;
      hasFallbackRun = true;
      speakWithSynthesis(welcomeText);
    };

    try {
      const audioUrl = `/api/tts?text=${encodeURIComponent(welcomeText)}&t=${Date.now()}`;
      const audio = new Audio(audioUrl);
      audio.volume = 1.0;

      audio.onerror = (e) => {
        console.warn("Welcome TTS audio error:", e);
        runFallback();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Welcome TTS autoplay blocked by browser policy, queuing for first interaction:", err);
          const onUserGesture = () => {
            window.removeEventListener("click", onUserGesture);
            window.removeEventListener("touchstart", onUserGesture);
            playNotificationChime();
            const retryAudio = new Audio(audioUrl);
            retryAudio.play().catch(() => runFallback());
          };
          window.addEventListener("click", onUserGesture, { once: true, passive: true });
          window.addEventListener("touchstart", onUserGesture, { once: true, passive: true });
        });
      }
    } catch (e) {
      runFallback();
    }
  };

  // Trigger Welcome Voice when user arrives from login
  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    const shouldPlay = sessionStorage.getItem("play_welcome_voice");
    if (shouldPlay === "true") {
      sessionStorage.removeItem("play_welcome_voice");
      playWelcomeVoice(user.name);
    }
  }, [user]);

  // Realtime subscription to requisitions to update pending badges & fire pop-ups
  useEffect(() => {
    const unsubscribe = subscribeToRequisitions(
      (orders) => {
        const pending = orders.filter((o) => o.status === "รออนุมัติ");
        const currentCount = pending.length;
        setPendingApprovalCount(currentCount);

        if (!isInitialLoadRef.current) {
          // If pending count increased and current user has approval privileges
          if (currentCount > prevPendingCountRef.current && pending.length > 0) {
            const latest = pending[0];
            setNewRequisitionAlert(latest);
            playVoiceAndChimeAlert(latest);
          }
        } else {
          isInitialLoadRef.current = false;
        }
        prevPendingCountRef.current = currentCount;
      },
      (err) => {
        console.warn("Requisition alert subscription error:", err);
      }
    );

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Auto-switch to first allowed tab if current activeMainTab is restricted
  useEffect(() => {
    if (!user) return;
    const isTabPermitted = (tab: "shop" | "my_requests" | "approvals" | "assets" | "users") => {
      if (tab === "shop") return canViewShop;
      if (tab === "my_requests") return canViewMyRequests;
      if (tab === "approvals") return canApprove;
      if (tab === "assets") return canViewAssets;
      if (tab === "users") return canManageUsers;
      return false;
    };

    if (!isTabPermitted(activeMainTab)) {
      if (canViewShop) setActiveMainTab("shop");
      else if (canViewMyRequests) setActiveMainTab("my_requests");
      else if (canApprove) setActiveMainTab("approvals");
      else if (canViewAssets) setActiveMainTab("assets");
      else if (canManageUsers) setActiveMainTab("users");
    }
  }, [user, activeMainTab, canViewShop, canViewMyRequests, canApprove, canViewAssets, canManageUsers]);

  return (
    <ProtectedRoute>
      <div className="min-h-dvh bg-transparent text-slate-800 flex flex-col justify-between selection:bg-[#DA2128] selection:text-white font-sans relative overflow-x-hidden">
        {/* Ambient Subtle Calm Glow Elements (Comfortable eye-care lighting) */}
        <div className="fixed -top-40 -left-40 w-96 h-96 bg-slate-300/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="fixed top-1/2 -right-40 w-96 h-96 bg-red-200/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="fixed -bottom-40 left-1/3 w-96 h-96 bg-slate-200/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#DA2128] via-[#FF3B44] to-[#DA2128] sticky top-0 z-50"></div>

        {/* Realtime Welcome Toast Notification on Login */}
        {welcomeToast && (
          <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 max-w-sm w-full animate-bounceIn glass-modal rounded-2xl p-3.5 sm:p-4 overflow-hidden flex items-center justify-between gap-3 border border-white/90 shadow-2xl">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2 rounded-xl bg-red-50/90 text-[#DA2128] shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-slate-900 truncate">
                  {welcomeToast}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  ระบบบริหารคลังพัสดุและครุภัณฑ์ มศว
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 shrink-0">
              <button
                type="button"
                onClick={() => playWelcomeVoice(user?.name)}
                className="p-1.5 text-slate-400 hover:text-[#DA2128] hover:bg-slate-100/70 rounded-lg transition-colors cursor-pointer"
                title="ฟังเสียงต้อนรับซ้ำ"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setWelcomeToast(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100/70 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Realtime Floating Pop-up Notification for Approvers */}
        {newRequisitionAlert && canApprove && (
          <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 max-w-sm sm:max-w-md w-full animate-bounceIn glass-modal rounded-3xl border-2 border-red-500/80 p-4 sm:p-5 overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DA2128] via-[#FF3B44] to-[#DA2128]"></div>
            
            <div className="flex items-start space-x-3.5">
              <div className="relative p-2.5 rounded-2xl bg-red-50/90 border border-red-200 text-[#DA2128] shrink-0 shadow-xs">
                <BellRing className="w-6 h-6 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#DA2128] rounded-full animate-ping"></span>
              </div>
              
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100/90 text-[#DA2128] border border-red-300 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DA2128] animate-pulse"></span>
                    <span>คำขอเบิกใหม่รออนุมัติ!</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => playVoiceAndChimeAlert(newRequisitionAlert)}
                      className="text-slate-400 hover:text-[#DA2128] p-1 rounded-lg hover:bg-slate-100/80 transition-colors"
                      title="กดเพื่อฟังเสียงพูดแจ้งเตือนซ้ำ"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setNewRequisitionAlert(null)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100/80 transition-colors"
                      title="ปิดการแจ้งเตือน"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h4 className="text-sm font-black text-slate-900 truncate">
                  เลขที่: {newRequisitionAlert.reqNo}
                </h4>
                <p className="text-xs text-slate-700 font-bold">
                  ผู้ขอ: <span className="text-[#DA2128]">{newRequisitionAlert.requesterName}</span>
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {newRequisitionAlert.department} • {newRequisitionAlert.totalItems} รายการ (฿{newRequisitionAlert.totalAmount?.toLocaleString()})
                </p>
                
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setActiveMainTab("approvals");
                      setNewRequisitionAlert(null);
                    }}
                    className="flex-1 py-2 px-3.5 glass-button-primary text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 active:scale-95 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>ดูคำขอและอนุมัติทันที</span>
                  </button>
                  <button
                    onClick={() => setNewRequisitionAlert(null)}
                    className="py-2 px-3 glass-button-secondary text-slate-600 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unified Premium Navbar with Glassmorphism */}
        <header className="glass-nav sticky top-1.5 z-40 print:hidden transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Top Row: Brand Identity (Left) & User Profile + Tools (Right) */}
            <div className="flex items-center justify-between py-2.5 sm:py-3.5 gap-2 sm:gap-4 border-b border-slate-200/50 min-w-0">
              
              {/* Brand & Identity */}
              <div className="flex items-center space-x-2.5 sm:space-x-4 min-w-0 flex-1">
                <div className="shrink-0 flex items-center">
                  <SWULogo size="md" className="hidden sm:block drop-shadow-xs" />
                  <SWULogo size="sm" className="sm:hidden drop-shadow-xs" />
                </div>
                <div className="border-l border-slate-200/80 pl-2.5 sm:pl-4 min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center space-x-1.5">
                    <h1 className="font-black text-sm sm:text-lg md:text-xl text-slate-900 tracking-tight leading-tight truncate">
                      <span className="sm:hidden">ระบบคลังพัสดุ & ครุภัณฑ์</span>
                      <span className="hidden sm:inline">ระบบบริหารคลังพัสดุและครุภัณฑ์</span>
                    </h1>
                    <span className="hidden sm:inline-flex text-[10px] bg-red-50/90 text-[#DA2128] border border-red-200/80 px-2 py-0.5 rounded-full font-bold leading-none shrink-0 shadow-2xs">
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
                  <div className="flex items-center space-x-1.5 sm:space-x-2 glass-pill p-1 sm:pl-1.5 sm:pr-2.5 sm:py-1 rounded-full transition-all shadow-xs border border-white/90">
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
                      className="w-7 h-7 rounded-full bg-red-50 text-[#DA2128] border border-red-200 items-center justify-center text-[11px] font-black shrink-0"
                    >
                      {user.name ? user.name.slice(0, 2).toUpperCase() : "SW"}
                    </div>

                    <div className="hidden md:flex items-center space-x-1.5 px-0.5">
                      <span className="text-xs font-bold text-slate-800 whitespace-nowrap max-w-[120px] truncate leading-tight" title={user.name}>
                        {user.name}
                      </span>
                      <span className="hidden lg:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 leading-none">
                        {user.role === "super_admin" ? "Admin" : user.role === "approver" ? "ผู้อนุมัติ" : user.role === "technician" ? "ช่าง" : "Staff"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsLogoutConfirmOpen(true)}
                      className="p-1 hover:bg-red-50/80 text-slate-400 hover:text-[#DA2128] rounded-full transition-colors shrink-0 cursor-pointer active:scale-95"
                      title="ออกจากระบบ"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {canApprove && (
                  <button
                    type="button"
                    onClick={() =>
                      playVoiceAndChimeAlert({
                        reqNo: "REQ-TEST",
                        requesterName: user?.name || "สมชาย ใจดี",
                        department: "ส่วนพัฒนากายภาพ",
                        totalItems: 2,
                        totalAmount: 450,
                        status: "รออนุมัติ",
                        items: []
                      })
                    }
                    className="hidden md:inline-flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-[#DA2128] glass-pill hover:bg-red-50/70 border-white/80 hover:border-red-200 px-3 py-1.5 rounded-full transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
                    title="คลิกเพื่อทดสอบเปิดเสียงพูดแจ้งเตือน"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#DA2128]" />
                    <span>ทดสอบเสียงพูด</span>
                  </button>
                )}

                {canAccessDev && (
                  <Link
                    href="/dev"
                    className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-[#DA2128] glass-pill hover:bg-red-50/70 border-white/80 hover:border-red-200 px-3 py-1.5 rounded-full transition-all shadow-xs shrink-0"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#DA2128]" />
                    <span>คู่มือ (/dev)</span>
                  </Link>
                )}
              </div>

            </div>

            {/* Bottom Row: Desktop Navigation Tabs (Segmented Controller with Glass Pill Container) */}
            <div className="hidden sm:flex py-2.5 items-center overflow-x-auto scrollbar-none">
              <div className="flex items-center space-x-1.5 p-1 bg-slate-200/50 backdrop-blur-md rounded-2xl border border-white/80 text-xs font-bold min-w-full sm:min-w-0 shadow-inner">
                {canViewShop && (
                  <button
                    onClick={() => setActiveMainTab("shop")}
                    className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-none ${
                      activeMainTab === "shop"
                        ? "bg-white/95 text-[#DA2128] shadow-sm font-black scale-100 border border-white/90"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>ร้านเบิกจ่ายวัสดุ</span>
                  </button>
                )}

                {canViewMyRequests && (
                  <button
                    onClick={() => setActiveMainTab("my_requests")}
                    className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-none ${
                      activeMainTab === "my_requests"
                        ? "bg-white/95 text-[#DA2128] shadow-sm font-black scale-100 border border-white/90"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>ประวัติการเบิกของฉัน</span>
                  </button>
                )}

                {canApprove && (
                  <button
                    onClick={() => setActiveMainTab("approvals")}
                    className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-none relative ${
                      activeMainTab === "approvals"
                        ? "bg-white/95 text-[#DA2128] shadow-sm font-black scale-100 border border-white/90"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>ศูนย์อนุมัติคำขอเบิก</span>
                    {pendingApprovalCount > 0 && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#DA2128] text-white animate-pulse shadow-xs border border-white/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        <span>{pendingApprovalCount} รออนุมัติ</span>
                      </span>
                    )}
                  </button>
                )}

                {canViewAssets && (
                  <button
                    onClick={() => setActiveMainTab("assets")}
                    className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-none ${
                      activeMainTab === "assets"
                        ? "bg-white/95 text-[#DA2128] shadow-sm font-black scale-100 border border-white/90"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>ทะเบียนครุภัณฑ์ (12,396 รายการ)</span>
                  </button>
                )}

                {canManageUsers && (
                  <button
                    onClick={() => setActiveMainTab("users")}
                    className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-none ${
                      activeMainTab === "users"
                        ? "bg-white/95 text-[#DA2128] shadow-sm font-black scale-100 border border-white/90"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
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
        <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-7 pb-16 sm:pb-8 relative z-10">
          {activeMainTab === "shop" && canViewShop && <MaterialShop />}
          {activeMainTab === "my_requests" && canViewMyRequests && <RequisitionManagement initialViewMode="my_requests" />}
          {activeMainTab === "approvals" && canApprove && <RequisitionManagement initialViewMode="approvals" />}
          {activeMainTab === "assets" && canViewAssets && <DataExplorerTab />}
          {activeMainTab === "users" && canManageUsers && <PermissionManager />}
        </main>

        {/* Native Smartphone App Bottom Navigation Bar (Frosted Glass with 1-Thumb Navigation) */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 glass-bottom-nav pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5 px-1.5 print:hidden">
          <div className="flex items-center justify-around max-w-lg mx-auto">
            {canViewShop && (
              <button
                onClick={() => setActiveMainTab("shop")}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all active:scale-95 flex-1 ${
                  activeMainTab === "shop"
                    ? "text-[#DA2128] font-black"
                    : "text-slate-400 hover:text-slate-700 font-medium"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${activeMainTab === "shop" ? "bg-red-50/90 text-[#DA2128] scale-105 shadow-xs border border-red-200/60" : ""}`}>
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 leading-tight font-bold">ร้านเบิก</span>
              </button>
            )}

            {canViewMyRequests && (
              <button
                onClick={() => setActiveMainTab("my_requests")}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all active:scale-95 flex-1 ${
                  activeMainTab === "my_requests"
                    ? "text-[#DA2128] font-black"
                    : "text-slate-400 hover:text-slate-700 font-medium"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${activeMainTab === "my_requests" ? "bg-red-50/90 text-[#DA2128] scale-105 shadow-xs border border-red-200/60" : ""}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 leading-tight font-bold">ประวัติฉัน</span>
              </button>
            )}

            {canApprove && (
              <button
                onClick={() => setActiveMainTab("approvals")}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all active:scale-95 flex-1 relative ${
                  activeMainTab === "approvals"
                    ? "text-[#DA2128] font-black"
                    : "text-slate-400 hover:text-slate-700 font-medium"
                }`}
              >
                <div className={`relative p-1.5 rounded-xl transition-all ${activeMainTab === "approvals" ? "bg-red-50/90 text-[#DA2128] scale-105 shadow-xs border border-red-200/60" : ""}`}>
                  <ShieldCheck className="w-5 h-5" />
                  {pendingApprovalCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#DA2128] text-white text-[9px] font-black flex items-center justify-center animate-pulse border-2 border-white shadow-xs">
                      {pendingApprovalCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 leading-tight font-bold">อนุมัติ</span>
              </button>
            )}

            {canViewAssets && (
              <button
                onClick={() => setActiveMainTab("assets")}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all active:scale-95 flex-1 ${
                  activeMainTab === "assets"
                    ? "text-[#DA2128] font-black"
                    : "text-slate-400 hover:text-slate-700 font-medium"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${activeMainTab === "assets" ? "bg-red-50/90 text-[#DA2128] scale-105 shadow-xs border border-red-200/60" : ""}`}>
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 leading-tight font-bold">ครุภัณฑ์</span>
              </button>
            )}

            {canManageUsers && (
              <button
                onClick={() => setActiveMainTab("users")}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all active:scale-95 flex-1 ${
                  activeMainTab === "users"
                    ? "text-[#DA2128] font-black"
                    : "text-slate-400 hover:text-slate-700 font-medium"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${activeMainTab === "users" ? "bg-red-50/90 text-[#DA2128] scale-105 shadow-xs border border-red-200/60" : ""}`}>
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 leading-tight font-bold">สิทธิ์ผู้ใช้</span>
              </button>
            )}
          </div>
        </nav>

        {/* Official Modern Footer */}
        <footer className="glass-nav border-t border-slate-200/80 pt-5 pb-28 sm:pb-5 text-center text-xs text-slate-600 print:hidden relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-slate-700">
              <span className="font-bold text-slate-900">© 2026 Srinakharinwirot University (SWU)</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">Physical Development Division</span>
              <span className="hidden md:inline text-slate-300">•</span>
              <span className="hidden md:inline text-slate-500">All Rights Reserved.</span>
            </div>
            <div className="flex items-center space-x-4 text-xs font-semibold">
              <Link href="/dev" className="text-slate-600 hover:text-[#DA2128] transition-colors">
                System Blueprint (/dev)
              </Link>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="text-slate-600 hover:text-[#DA2128] transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </footer>

        {/* ========================================================================= */}
        {/* LOGOUT CONFIRMATION MODAL */}
        {/* ========================================================================= */}
        {isLogoutConfirmOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn print:hidden">
            <div className="glass-modal rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-white/90 animate-scaleUp">
              <div className="w-14 h-14 rounded-2xl bg-red-50/90 text-[#DA2128] border border-red-200 flex items-center justify-center mx-auto shadow-xs">
                <LogOut className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  ยืนยันการออกจากระบบ?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  คุณต้องการออกจากระบบบริหารคลังพัสดุและครุภัณฑ์ใช่หรือไม่
                </p>
              </div>

              {user && (
                <div className="glass-pill border border-slate-200/80 rounded-xl p-2.5 text-xs text-slate-700 flex items-center justify-center space-x-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold truncate">{user.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200/80 text-slate-600 font-semibold">
                    {user.role === "super_admin" ? "Admin" : user.role === "approver" ? "ผู้อนุมัติ" : user.role === "technician" ? "ช่าง" : "Staff"}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  className="py-2.5 px-4 glass-button-secondary text-slate-700 font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setIsLogoutConfirmOpen(false);
                    await logout();
                  }}
                  className="py-2.5 px-4 glass-button-primary text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
