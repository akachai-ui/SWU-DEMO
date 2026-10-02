"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import {
  RequisitionOrder,
  subscribeToRequisitions,
  signApproveRequisitionInFirestore,
  signRejectRequisitionInFirestore,
  signDispenseRequisitionInFirestore,
  signReceiveRequisitionInFirestore
} from "@/lib/consumablesService";
import DigitalRequisitionDocument from "@/components/DigitalRequisitionDocument";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Search,
  Filter,
  User,
  Building,
  Calendar,
  Layers,
  ChevronRight,
  Eye,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  Package,
  PenTool,
  Award,
  UserCheck
} from "lucide-react";

interface RequisitionManagementProps {
  initialViewMode?: "my_requests" | "approvals";
}

export default function RequisitionManagement({
  initialViewMode = "my_requests"
}: RequisitionManagementProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<RequisitionOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"my_requests" | "approvals">(initialViewMode);
  const [statusFilter, setStatusFilter] = useState<string>("ทั้งหมด");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<RequisitionOrder | null>(null);
  const [isDigitalDocModalOpen, setIsDigitalDocModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [orderToReject, setOrderToReject] = useState<RequisitionOrder | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const canApprove = user?.permissions?.canApproveRequisitions || user?.role === "super_admin";

  // Subscribe to realtime requisitions
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToRequisitions(
      (data) => {
        setOrders(data);
        setIsLoading(false);
      },
      (err) => {
        console.warn("Requisitions subscription error:", err);
        setIsLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Filter orders based on active tab and search
  const displayedOrders = orders.filter((order) => {
    // Tab filter
    if (activeSubTab === "my_requests") {
      const isMyEmail = user?.email && order.requesterEmail?.toLowerCase() === user.email.toLowerCase();
      const isMyName = user?.name && order.requesterName?.toLowerCase().includes(user.name.toLowerCase());
      if (!isMyEmail && !isMyName) return false;
    }

    // Status filter
    if (statusFilter !== "ทั้งหมด" && order.status !== statusFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchReqNo = order.reqNo.toLowerCase().includes(q);
      const matchName = order.requesterName.toLowerCase().includes(q);
      const matchDept = order.department.toLowerCase().includes(q);
      const matchItem = order.items.some((item) => item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q));
      if (!matchReqNo && !matchName && !matchDept && !matchItem) return false;
    }

    return true;
  });

  // Action: Quick Approve Order
  const handleQuickApprove = async (order: RequisitionOrder) => {
    if (!order.id || isProcessing) return;
    setIsProcessing(true);
    try {
      await signApproveRequisitionInFirestore(order.id, {
        name: user?.name || "ผู้อนุมัติ",
        email: user?.email || "",
        role: user?.role === "super_admin" ? "ผู้บริหาร / ผู้อนุมัติสูงสุด" : "หัวหน้าส่วนงาน"
      });
      showToast(`ลงนามอนุมัติดิจิทัลสำหรับใบขอเบิก ${order.reqNo} สำเร็จ!`);
    } catch (err: any) {
      showToast(`เกิดข้อผิดพลาด: ${err.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Action: Quick Dispense Order
  const handleQuickDispense = async (order: RequisitionOrder) => {
    if (!order.id || isProcessing) return;
    setIsProcessing(true);
    try {
      await signDispenseRequisitionInFirestore(order.id, {
        name: user?.name || "เจ้าหน้าที่คลังพัสดุ",
        email: user?.email || ""
      });
      showToast(`ลงนามจ่ายพัสดุดิจิทัลสำหรับ ${order.reqNo} สำเร็จ!`);
    } catch (err: any) {
      showToast(`เกิดข้อผิดพลาด: ${err.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Action: Open Reject Modal
  const handleOpenRejectModal = (order: RequisitionOrder) => {
    setOrderToReject(order);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  // Action: Submit Reject Order
  const handleConfirmReject = async () => {
    if (!orderToReject?.id || isProcessing) return;
    if (!rejectReason.trim()) {
      showToast("กรุณาระบุเหตุผลในการปฏิเสธคำขอ", "error");
      return;
    }

    setIsProcessing(true);
    try {
      await signRejectRequisitionInFirestore(
        orderToReject.id,
        {
          name: user?.name || "ผู้อนุมัติ",
          email: user?.email || "",
          role: "ผู้อนุมัติ"
        },
        rejectReason.trim()
      );
      showToast(`ปฏิเสธคำขอเบิก ${orderToReject.reqNo} แล้ว`);
      setRejectReason("");
      setIsRejectModalOpen(false);
      setOrderToReject(null);
    } catch (err: any) {
      showToast(`เกิดข้อผิดพลาด: ${err.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper: Status Badge Styling
  const renderStatusBadge = (status: RequisitionOrder["status"]) => {
    switch (status) {
      case "รออนุมัติ":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
            <span>รออนุมัติ</span>
          </span>
        );
      case "อนุมัติแล้ว":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <CheckCircle2 className="w-3 h-3 text-sky-600" />
            <span>อนุมัติแล้ว (รอมารับของ)</span>
          </span>
        );
      case "จ่ายพัสดุแล้ว":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <PackageCheck className="w-3 h-3 text-emerald-600" />
            <span>จ่ายพัสดุเรียบร้อย</span>
          </span>
        );
      case "ปฏิเสธ":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>ปฏิเสธคำขอ</span>
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  // Helper: 4-Party E-Signature Summary Badge
  const renderSignatureProgressBadge = (order: RequisitionOrder) => {
    const hasRequester = !!(order.requesterSignature || order.createdAt);
    const hasApprover = order.status === "อนุมัติแล้ว" || order.status === "จ่ายพัสดุแล้ว" || !!order.approverSignature;
    const hasDispenser = !!order.dispenserSignature || order.status === "จ่ายพัสดุแล้ว";
    const hasReceiver = !!order.receiverSignature;

    const count = [hasRequester, hasApprover, hasDispenser, hasReceiver].filter(Boolean).length;

    if (order.status === "ปฏิเสธ") {
      return (
        <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
          <XCircle className="w-3 h-3" />
          <span>ยุติการลงนาม</span>
        </span>
      );
    }

    if (count === 4) {
      return (
        <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
          <Award className="w-3 h-3 text-emerald-600" />
          <span>ลงนามครบ 4 ฝ่าย (100% Paperless)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
        <PenTool className="w-3 h-3 text-[#DA2128]" />
        <span>ลงนามแล้ว {count}/4 ฝ่าย</span>
      </span>
    );
  };

  const pendingCount = orders.filter((o) => o.status === "รออนุมัติ").length;
  const myPendingCount = orders.filter((o) => {
    const isMyEmail = user?.email && o.requesterEmail?.toLowerCase() === user.email.toLowerCase();
    const isMyName = user?.name && o.requesterName?.toLowerCase().includes(user.name.toLowerCase());
    return (isMyEmail || isMyName) && o.status === "รออนุมัติ";
  }).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-[80] flex items-center space-x-2 px-4 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-semibold backdrop-blur-xl transition-all ${
            notification.type === "success" ? "bg-emerald-600/95 text-white border border-emerald-400/40" : "bg-red-600/95 text-white border border-red-400/40"
          }`}
        >
          {notification.type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Header & Tab Navigation */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 sm:p-2.5 rounded-xl bg-red-50/90 text-[#DA2128] shrink-0 shadow-xs border border-red-200/60">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </span>
              <div className="min-w-0">
                <h1 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                  ระบบติดตามและลงนามใบขอเบิกพัสดุดิจิทัล
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                  ส่วนพัฒนากายภาพ มศว • Paperless 100% E-Requisition
                </p>
              </div>
            </div>
          </div>

          {/* Sub Tab Switcher: My Requests vs Approver Hub */}
          <div className="grid grid-cols-2 sm:flex items-center gap-1 bg-slate-200/50 backdrop-blur-md p-1 rounded-2xl border border-white/80 text-xs font-bold w-full sm:w-auto shadow-inner">
            <button
              onClick={() => {
                setActiveSubTab("my_requests");
                setStatusFilter("ทั้งหมด");
              }}
              className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
                activeSubTab === "my_requests"
                  ? "bg-white/95 text-[#DA2128] shadow-sm font-black border border-white/90"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">ประวัติการเบิก</span>
              {myPendingCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black shrink-0 shadow-2xs">
                  {myPendingCount}
                </span>
              )}
            </button>

            {canApprove && (
              <button
                onClick={() => {
                  setActiveSubTab("approvals");
                  setStatusFilter("ทั้งหมด");
                }}
                className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
                  activeSubTab === "approvals"
                    ? "bg-white/95 text-[#DA2128] shadow-sm font-black border border-white/90"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">ศูนย์อนุมัติ</span>
                {pendingCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#DA2128] text-white text-[10px] flex items-center justify-center font-black animate-pulse shrink-0 shadow-2xs">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 pt-2 border-t border-slate-200/60">
          {/* Search */}
          <div className="sm:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeSubTab === "my_requests" ? "ค้นหาเลขที่ใบเบิก, ชื่อวัสดุ..." : "ค้นหาเลขที่ใบเบิก, ชื่อผู้ขอ, รายการพัสดุ..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="sm:col-span-5 flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs font-semibold">
            {["ทั้งหมด", "รออนุมัติ", "อนุมัติแล้ว", "จ่ายพัสดุแล้ว", "ปฏิเสธ"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1 shrink-0 ${
                  statusFilter === st
                    ? "bg-slate-900/90 backdrop-blur-md text-white shadow-xs font-bold border border-slate-800"
                    : "glass-pill text-slate-600 hover:text-slate-900 hover:bg-white/80 border-slate-200/70"
                }`}
              >
                <span>{st}</span>
                {st === "รออนุมัติ" && pendingCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${statusFilter === st ? "bg-[#DA2128] text-white" : "bg-amber-100 text-amber-800"}`}>
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Urgent Pending Approval Notification Banner for Approvers */}
      {activeSubTab === "approvals" && pendingCount > 0 && (
        <div className="p-3.5 sm:p-4 glass-card rounded-2xl sm:rounded-3xl border-amber-300/80 bg-gradient-to-r from-amber-50/80 via-red-50/50 to-orange-50/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center text-base shrink-0 shadow-xs animate-pulse">
              🔔
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center space-x-1.5">
                <span>มีคำขอเบิกพัสดุรอการพิจารณาอนุมัติ</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-[#DA2128] text-white shadow-2xs">
                  {pendingCount} รายการ
                </span>
              </h4>
              <p className="text-[11px] text-slate-600">
                โปรดตรวจสอบรายการพัสดุและลงนามอนุมัติดิจิทัลเพื่อดำเนินการตัดสต็อกและจ่ายของ
              </p>
            </div>
          </div>
          {statusFilter !== "รออนุมัติ" && (
            <button
              onClick={() => setStatusFilter("รออนุมัติ")}
              className="w-full sm:w-auto px-3.5 py-2 glass-button-primary text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 shrink-0 active:scale-95 cursor-pointer"
            >
              <span>กรองเฉพาะรายการรออนุมัติ ({pendingCount})</span>
            </button>
          )}
        </div>
      )}

      {/* Orders List Table / Card Grid */}
      {isLoading ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#DA2128] animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">กำลังโหลดรายการคำขอเบิกพัสดุ...</p>
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100/80 text-slate-400 flex items-center justify-center mx-auto shadow-xs">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">ไม่พบรายการขอเบิกพัสดุ</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeSubTab === "my_requests"
              ? "ท่านยังไม่มีประวัติการส่งใบขอเบิกพัสดุ หรือไม่ตรงกับเงื่อนไขการค้นหา"
              : "ไม่มีรายการคำขอเบิกพัสดุที่รอการพิจารณาในขณะนี้"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayedOrders.map((order) => (
            <div
              key={order.id || order.reqNo}
              className={`glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all flex flex-col justify-between space-y-3.5 shadow-xs hover:shadow-md ${
                order.status === "รออนุมัติ"
                  ? "border-amber-300/90 ring-1 ring-amber-200/60 hover:border-amber-400 shadow-[0_4px_20px_rgba(245,158,11,0.06)] bg-white/95"
                  : "hover:border-red-200/80 bg-white/90"
              }`}
            >
              {/* Row 1: Header (ReqNo, Status, Signature Progress, Date) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-xs font-black text-[#DA2128] bg-red-50/90 border border-red-200/80 px-2.5 py-0.5 rounded-lg shadow-2xs">
                    {order.reqNo}
                  </span>
                  {renderStatusBadge(order.status)}
                  {renderSignatureProgressBadge(order)}
                </div>

                {order.createdAt && (
                  <span className="text-[11px] text-slate-400 font-medium flex items-center space-x-1 shrink-0">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>
                      {order.createdAt.seconds
                        ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        : "เมื่อสักครู่"}
                    </span>
                  </span>
                )}
              </div>

              {/* Row 2: Requester Info, Purpose & Totals */}
              <div className="space-y-2.5 text-xs flex-1">
                {/* User & Department + Amount */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5 text-slate-900 font-bold">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-sm">{order.requesterName}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{order.department}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 bg-slate-50/90 border border-slate-200/70 px-3 py-1.5 rounded-xl shadow-2xs">
                    <span className="text-slate-400 text-[10px] block font-medium">รวม {order.totalItems} ชิ้น ({order.items.length} รายการ)</span>
                    <span className="text-sm font-black text-[#DA2128] font-mono">
                      ฿{(order.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Purpose */}
                {order.purpose && (
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 text-[11px]">
                    <span className="text-slate-400 font-medium mr-1.5">วัตถุประสงค์:</span>
                    <span className="text-slate-700 font-medium">{order.purpose}</span>
                  </div>
                )}

                {/* Items Mini-Previews */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-1.5 bg-white border border-slate-200/80 px-2 py-1 rounded-lg text-[11px] text-slate-700 whitespace-nowrap shrink-0 shadow-2xs"
                    >
                      {item.imageUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={item.imageUrl} alt="" className="w-4 h-4 rounded object-cover shadow-2xs" />
                      )}
                      <span className="font-medium truncate max-w-[110px]">{item.name}</span>
                      <span className="font-bold text-[#DA2128]">x{item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-[10px] text-slate-400 font-bold px-2 py-1 bg-slate-100/80 rounded-lg shrink-0">
                      +{order.items.length - 3} รายการ
                    </span>
                  )}
                </div>
              </div>

              {/* Note / Approver Remarks */}
              {order.status === "ปฏิเสธ" && order.rejectReason && (
                <div className="p-2.5 bg-rose-50/90 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">เหตุผลที่ปฏิเสธ: </span>
                    <span>{order.rejectReason}</span>
                  </div>
                </div>
              )}

              {/* Row 3: Action Buttons */}
              <div className="pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                {/* Master Digital Voucher & Signature Button */}
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsDigitalDocModalOpen(true);
                  }}
                  className="flex-1 py-2.5 px-3.5 rounded-xl bg-slate-900/90 hover:bg-black text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-xs active:scale-98 border border-slate-700/60"
                >
                  <PenTool className="w-3.5 h-3.5 text-amber-400" />
                  <span>เปิดใบขอเบิกและลงนามดิจิทัล</span>
                </button>

                {/* Quick Approver Actions */}
                {canApprove && activeSubTab === "approvals" && order.status === "รออนุมัติ" && (
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => handleQuickApprove(order)}
                      disabled={isProcessing}
                      className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-emerald-600/95 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-1 shadow-xs transition-colors cursor-pointer border border-emerald-500 active:scale-98"
                      title="ลงนามอนุมัติดิจิทัลทันที"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>อนุมัติ</span>
                    </button>

                    <button
                      onClick={() => handleOpenRejectModal(order)}
                      disabled={isProcessing}
                      className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-rose-50/90 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center space-x-1 transition-colors cursor-pointer active:scale-98"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>ปฏิเสธ</span>
                    </button>
                  </div>
                )}

                {canApprove && activeSubTab === "approvals" && order.status === "อนุมัติแล้ว" && (
                  <button
                    onClick={() => handleQuickDispense(order)}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-3.5 py-2.5 glass-button-primary text-white text-xs font-bold flex items-center justify-center space-x-1 shadow-xs transition-all cursor-pointer active:scale-98 shrink-0"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>ลงนามจ่ายพัสดุ</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 100% PAPERLESS MASTER DIGITAL REQUISITION VOUCHER & SIGNATURE MODAL */}
      {/* ========================================================================= */}
      {isDigitalDocModalOpen && selectedOrder && (
        <DigitalRequisitionDocument
          order={selectedOrder}
          isOpen={isDigitalDocModalOpen}
          onClose={() => {
            setIsDigitalDocModalOpen(false);
            setSelectedOrder(null);
          }}
          onOrderUpdated={(updated) => {
            setSelectedOrder(updated);
            showToast("อัปเดตสถานะและบันทึกการลงนามดิจิทัลสำเร็จ!");
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: REJECT REASON */}
      {/* ========================================================================= */}
      {isRejectModalOpen && orderToReject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="glass-modal rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-white/90 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-100/90 text-rose-600 flex items-center justify-center mx-auto shadow-xs border border-rose-200">
              <XCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">ปฏิเสธใบขอเบิก {orderToReject.reqNo}</h3>
              <p className="text-xs text-slate-500">กรุณาระบุเหตุผลเพื่อให้ผู้ขอเบิกทราบ</p>
            </div>

            <textarea
              rows={3}
              required
              placeholder="เช่น พัสดุชนิดนี้จัดสรรสำหรับงานส่วนกลางเท่านั้น หรือข้อมูลไม่ครบถ้วน"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 glass-input rounded-xl text-xs text-slate-900"
            />

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 py-2.5 glass-button-secondary text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isProcessing || !rejectReason.trim()}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              >
                ยืนยันปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
