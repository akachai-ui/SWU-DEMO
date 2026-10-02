"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import {
  RequisitionOrder,
  signApproveRequisitionInFirestore,
  signRejectRequisitionInFirestore,
  signDispenseRequisitionInFirestore,
  signReceiveRequisitionInFirestore
} from "@/lib/consumablesService";
import SWULogo from "@/components/SWULogo";
import {
  FileText,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Clock,
  Printer,
  ShieldCheck,
  UserCheck,
  Check,
  X,
  PenTool,
  RotateCcw,
  Sparkles,
  Award,
  AlertCircle,
  Lock,
  Building,
  User,
  Calendar,
  Hash,
  Share2,
  Camera,
  Download,
  Smartphone
} from "lucide-react";
import html2canvas from "html2canvas";

interface DigitalRequisitionDocumentProps {
  order: RequisitionOrder;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: (updatedOrder: RequisitionOrder) => void;
}

export default function DigitalRequisitionDocument({
  order,
  isOpen,
  onClose,
  onOrderUpdated
}: DigitalRequisitionDocumentProps) {
  const { user } = useAuth();
  const [currentOrder, setCurrentOrder] = useState<RequisitionOrder>(order);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [modalToast, setModalToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  // Touch / Pen Canvas Signature Modal
  const [isSignCanvasOpen, setIsSignCanvasOpen] = useState(false);
  const [canvasSignRole, setCanvasSignRole] = useState<"approver" | "receiver">("receiver");
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  if (!isOpen) return null;

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setModalToast({ message, type });
    setTimeout(() => setModalToast(null), 3500);
  };

  // Screenshot / Share for Smartphone & Paperless
  const handleCaptureScreenshot = async () => {
    const element = document.getElementById("printable-requisition-voucher");
    if (!element) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // 2x high resolution
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false
      });

      // Try native Web Share on mobile if supported
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], `${currentOrder.reqNo}-voucher.png`, { type: "image/png" })] })) {
        const file = new File([blob], `${currentOrder.reqNo}-voucher.png`, { type: "image/png" });
        await navigator.share({
          title: `ใบขอเบิกพัสดุดิจิทัล ${currentOrder.reqNo}`,
          text: `ใบขอเบิกพัสดุดิจิทัล มศว เลขที่ ${currentOrder.reqNo}`,
          files: [file]
        });
        showToast("แชร์รูปภาพเอกสารเรียบร้อยแล้ว!");
      } else {
        // Download as PNG image
        const imageUri = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imageUri;
        link.download = `SWU-Requisition-${currentOrder.reqNo}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("บันทึกรูปภาพใบขอเบิกเรียบร้อยแล้ว!");
      }
    } catch (err: any) {
      console.error("Screenshot capture error:", err);
      showToast("ไม่สามารถแคปภาพได้ กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      setIsCapturing(false);
    }
  };

  const canApprove = user?.permissions?.canApproveRequisitions || user?.role === "super_admin";

  // Setup Canvas
  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High-DPI scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1E3A8A"; // Deep official blue ink
    ctx.lineWidth = 2.5;
    setHasDrawn(false);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Format Date Helper
  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return "-";
    if (typeof timestamp === "string") {
      const d = new Date(timestamp);
      return isNaN(d.getTime())
        ? timestamp
        : d.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });
    }
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
    return "-";
  };

  // Actions: Approver One-Click Sign
  const handleApprove = async () => {
    if (!currentOrder.id) return;
    setIsProcessing(true);
    try {
      await signApproveRequisitionInFirestore(currentOrder.id, {
        name: user?.name || "ผู้อนุมัติ",
        email: user?.email || "",
        role: user?.role === "super_admin" ? "ผู้บริหาร / ผู้อนุมัติสูงสุด" : "หัวหน้าส่วนงาน"
      });
      const updated: RequisitionOrder = {
        ...currentOrder,
        status: "อนุมัติแล้ว",
        approverName: user?.name || "ผู้อนุมัติ",
        approverSignature: {
          name: user?.name || "ผู้อนุมัติ",
          email: user?.email || "",
          role: user?.role === "super_admin" ? "ผู้บริหาร / ผู้อนุมัติสูงสุด" : "หัวหน้าส่วนงาน",
          signedAt: new Date().toISOString(),
          status: "APPROVED",
          verificationToken: `SWU-APV-${Date.now().toString(36).toUpperCase()}`
        }
      };
      setCurrentOrder(updated);
      showToast("ลงนามอนุมัติดิจิทัลสำเร็จแล้ว!");
      if (onOrderUpdated) onOrderUpdated(updated);
    } catch (err: any) {
      console.error(err);
      showToast(`เกิดข้อผิดพลาด: ${err.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Action: Approver Sign with Canvas Drawing
  const handleApproveWithCanvas = async () => {
    if (!currentOrder.id || !canvasRef.current) return;
    const signatureImage = canvasRef.current.toDataURL("image/png");
    setIsProcessing(true);
    try {
      await signApproveRequisitionInFirestore(
        currentOrder.id,
        {
          name: user?.name || "ผู้อนุมัติ",
          email: user?.email || "",
          role: user?.role === "super_admin" ? "ผู้บริหาร / ผู้อนุมัติสูงสุด" : "หัวหน้าส่วนงาน"
        },
        signatureImage
      );
      const updated: RequisitionOrder = {
        ...currentOrder,
        status: "อนุมัติแล้ว",
        approverName: user?.name || "ผู้อนุมัติ",
        approverSignature: {
          name: user?.name || "ผู้อนุมัติ",
          email: user?.email || "",
          role: user?.role === "super_admin" ? "ผู้บริหาร / ผู้อนุมัติสูงสุด" : "หัวหน้าส่วนงาน",
          signedAt: new Date().toISOString(),
          status: "APPROVED",
          signatureImage,
          verificationToken: `SWU-APV-${Date.now().toString(36).toUpperCase()}`
        }
      };
      setCurrentOrder(updated);
      setIsSignCanvasOpen(false);
      showToast("ลงนามอนุมัติด้วยลายเซ็นสดสำเร็จ!");
      if (onOrderUpdated) onOrderUpdated(updated);
    } catch (err: any) {
      console.error(err);
      showToast(`เกิดข้อผิดพลาด: ${err.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!currentOrder.id || !rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      await signRejectRequisitionInFirestore(
        currentOrder.id,
        {
          name: user?.name || "ผู้อนุมัติ",
          email: user?.email || "",
          role: "ผู้อนุมัติ"
        },
        rejectReason.trim()
      );
      const updated: RequisitionOrder = {
        ...currentOrder,
        status: "ปฏิเสธ",
        rejectReason: rejectReason.trim(),
        approverSignature: {
          name: user?.name || "ผู้อนุมัติ",
          email: user?.email || "",
          signedAt: new Date().toISOString(),
          status: "REJECTED",
          remarks: rejectReason.trim()
        }
      };
      setCurrentOrder(updated);
      setIsRejectModalOpen(false);
      showToast(`บันทึกการปฏิเสธคำขอเบิกแล้ว`);
      if (onOrderUpdated) onOrderUpdated(updated);
    } catch (err: any) {
      console.error(err);
      showToast(`เกิดข้อผิดพลาด: ${err.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDispense = async () => {
    if (!currentOrder.id) return;
    setIsProcessing(true);
    try {
      await signDispenseRequisitionInFirestore(currentOrder.id, {
        name: user?.name || "เจ้าหน้าที่คลังพัสดุ",
        email: user?.email || ""
      });
      const updated: RequisitionOrder = {
        ...currentOrder,
        dispenserSignature: {
          name: user?.name || "เจ้าหน้าที่คลังพัสดุ",
          email: user?.email || "",
          role: "เจ้าหน้าที่ผู้จ่ายพัสดุ",
          signedAt: new Date().toISOString(),
          status: "DISPENSED",
          verificationToken: `SWU-DSP-${Date.now().toString(36).toUpperCase()}`
        }
      };
      setCurrentOrder(updated);
      showToast("ลงนามจ่ายพัสดุสำเร็จ!");
      if (onOrderUpdated) onOrderUpdated(updated);
    } catch (err: any) {
      console.error(err);
      showToast(`เกิดข้อผิดพลาด: ${err.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReceiveWithCanvas = async () => {
    if (!currentOrder.id || !canvasRef.current) return;
    const signatureImage = canvasRef.current.toDataURL("image/png");
    setIsProcessing(true);
    try {
      await signReceiveRequisitionInFirestore(
        currentOrder.id,
        {
          name: user?.name || currentOrder.requesterName,
          email: user?.email || currentOrder.requesterEmail
        },
        signatureImage
      );
      const updated: RequisitionOrder = {
        ...currentOrder,
        status: "จ่ายพัสดุแล้ว",
        receiverSignature: {
          name: user?.name || currentOrder.requesterName,
          email: user?.email || currentOrder.requesterEmail,
          role: "ผู้รับพัสดุ",
          signedAt: new Date().toISOString(),
          status: "RECEIVED",
          signatureImage,
          verificationToken: `SWU-RCV-${Date.now().toString(36).toUpperCase()}`
        }
      };
      setCurrentOrder(updated);
      setIsSignCanvasOpen(false);
      showToast("ลงนามรับพัสดุด้วยลายเซ็นสดสำเร็จ!");
      if (onOrderUpdated) onOrderUpdated(updated);
    } catch (err: any) {
      console.error(err);
      showToast(`เกิดข้อผิดพลาด: ${err.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickReceive = async () => {
    if (!currentOrder.id) return;
    setIsProcessing(true);
    try {
      await signReceiveRequisitionInFirestore(currentOrder.id, {
        name: user?.name || currentOrder.requesterName,
        email: user?.email || currentOrder.requesterEmail
      });
      const updated: RequisitionOrder = {
        ...currentOrder,
        status: "จ่ายพัสดุแล้ว",
        receiverSignature: {
          name: user?.name || currentOrder.requesterName,
          email: user?.email || currentOrder.requesterEmail,
          role: "ผู้รับพัสดุ",
          signedAt: new Date().toISOString(),
          status: "RECEIVED",
          verificationToken: `SWU-RCV-${Date.now().toString(36).toUpperCase()}`
        }
      };
      setCurrentOrder(updated);
      showToast("ยืนยันรับพัสดุด้วยบัญชีดิจิทัลสำเร็จ!");
      if (onOrderUpdated) onOrderUpdated(updated);
    } catch (err: any) {
      console.error(err);
      showToast(`เกิดข้อผิดพลาด: ${err.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("printable-requisition-voucher");
    if (!printContent) {
      window.print();
      return;
    }

    try {
      // Create or reuse hidden iframe for isolated print
      let iframe = document.getElementById("print-requisition-frame") as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = "print-requisition-frame";
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        document.body.appendChild(iframe);
      }

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        window.print();
        return;
      }

      const headStyles = Array.from(document.head.querySelectorAll("link[rel='stylesheet'], style"))
        .map((el) => el.outerHTML)
        .join("\n");

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${currentOrder.reqNo} - ใบขอเบิกพัสดุดิจิทัล มศว</title>
            ${headStyles}
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @page {
                size: A4 portrait;
                margin: 6mm 8mm;
              }
              html, body {
                background: #ffffff !important;
                margin: 0 !important;
                padding: 0 !important;
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            </style>
          </head>
          <body class="bg-white p-0 m-0">
            <div style="padding: 0; margin: 0; width: 100%;">
              ${printContent.outerHTML}
            </div>
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 300);
    } catch (err) {
      console.warn("Iframe print fallback to window.print():", err);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2.5 sm:p-6 pb-6 sm:pb-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible animate-fadeIn">
      {/* Dynamic Print CSS to guarantee ONLY the single document prints & fits 1-Page A4 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: A4 portrait;
          margin: 5mm 8mm;
        }
        @media print {
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
            overflow: hidden !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-requisition-voucher,
          #printable-requisition-voucher * {
            visibility: visible !important;
          }
          #printable-requisition-voucher {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
            font-size: 10px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}} />

      {/* Toast Inside Modal */}
      {modalToast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center space-x-2 px-4 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-semibold transition-all print:hidden ${
            modalToast.type === "success" ? "bg-emerald-600/95 text-white border border-emerald-400/40" : "bg-red-600/95 text-white border border-red-400/40"
          }`}
        >
          {modalToast.type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{modalToast.message}</span>
        </div>
      )}

      <div className="glass-modal rounded-3xl max-w-4xl w-full p-3.5 sm:p-8 space-y-4 sm:space-y-6 shadow-2xl border border-white/90 max-h-[92vh] overflow-y-auto print:p-0 print:border-none print:shadow-none animate-scaleUp">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 print:hidden gap-2">
          {/* Badge */}
          <div className="flex items-center space-x-1.5 min-w-0">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50/90 text-emerald-700 border border-emerald-200 text-[11px] sm:text-xs font-bold truncate shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">เอกสารอิเล็กทรอนิกส์ 100% ไร้กระดาษ (Paperless E-Form)</span>
              <span className="sm:hidden">ไร้กระดาษ 100% (Paperless)</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Mobile: Screenshot / Capture Button */}
            <button
              onClick={handleCaptureScreenshot}
              disabled={isCapturing}
              className="sm:hidden px-3 py-1.5 rounded-xl glass-button-primary text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              title="แคปหน้าจอเอกสารเพื่อบันทึกหรือแชร์"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{isCapturing ? "กำลังบันทึก..." : "แคปหน้าจอ"}</span>
            </button>

            {/* Desktop: Print & Screenshot Buttons */}
            <button
              onClick={handleCaptureScreenshot}
              disabled={isCapturing}
              className="hidden sm:inline-flex px-3 py-1.5 rounded-xl glass-button-secondary text-slate-700 text-xs font-bold items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="บันทึกรูปภาพเอกสาร (PNG)"
            >
              <Camera className="w-4 h-4 text-slate-600" />
              <span>{isCapturing ? "กำลังบันทึก..." : "บันทึกภาพ (PNG)"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex px-3 py-1.5 rounded-xl glass-button-primary text-white text-xs font-bold items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
              title="พิมพ์เอกสารหรือบันทึกเป็น PDF"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ / บันทึก PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* OFFICIAL SWU REQUISITION DOCUMENT (E-FORM) */}
        {/* ========================================================================= */}
        <div id="printable-requisition-voucher" className="border-2 border-slate-200/90 rounded-2xl p-3.5 sm:p-8 space-y-4 sm:space-y-5 bg-white shadow-xs print:border-none print:p-0 print:space-y-2">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 pb-3.5 print:pb-2 print:border-b">
            <div className="flex items-center space-x-3">
              <SWULogo size="md" className="shrink-0 print:scale-90 print:origin-left" />
              <div className="space-y-0.5 border-l-2 border-slate-200 pl-3 print:pl-2.5 min-w-0">
                <h2 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight leading-tight print:text-sm">
                  แบบฟอร์มขอเบิกพัสดุและวัสดุสิ้นเปลือง
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-600 font-bold print:text-[10px]">
                  ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium print:text-[9px]">
                  ระบบบริหารคลังพัสดุและลงนามดิจิทัล (E-Requisition & Digital Sign-off)
                </p>
              </div>
            </div>

            {/* Document Meta Capsule */}
            <div className="text-left sm:text-right space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200 shrink-0 print:p-1.5 print:bg-white print:border-slate-300">
              <div className="flex justify-between sm:justify-end items-center space-x-2">
                <span className="text-[11px] text-slate-500 font-semibold print:text-[9px]">เลขที่เอกสาร:</span>
                <span className="font-mono text-xs sm:text-sm font-black text-[#DA2128] print:text-xs">
                  {currentOrder.reqNo}
                </span>
              </div>
              <div className="flex justify-between sm:justify-end items-center space-x-2 text-xs text-slate-600 print:text-[9px]">
                <span className="text-[11px] text-slate-500 print:text-[9px]">วันที่ขอเบิก:</span>
                <span className="font-medium text-[11px] sm:text-xs">{formatDateTime(currentOrder.createdAt)}</span>
              </div>
              <div className="flex justify-between sm:justify-end items-center space-x-2">
                <span className="text-[11px] text-slate-500 print:text-[9px]">สถานะ:</span>
                {currentOrder.status === "รออนุมัติ" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 print:text-[8px] print:py-0">
                    ⏳ รอพิจารณาอนุมัติ
                  </span>
                )}
                {currentOrder.status === "อนุมัติแล้ว" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200 print:text-[8px] print:py-0">
                    ✅ ผ่านการอนุมัติแล้ว
                  </span>
                )}
                {currentOrder.status === "จ่ายพัสดุแล้ว" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 print:text-[8px] print:py-0">
                    📦 จ่ายพัสดุครบถ้วน
                  </span>
                )}
                {currentOrder.status === "ปฏิเสธ" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 print:text-[8px] print:py-0">
                    ❌ ปฏิเสธคำขอ
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Requester Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-200 print:p-2 print:text-[10px] print:bg-slate-50/40">
            <div className="space-y-0.5">
              <span className="text-slate-500 font-medium">ชื่อผู้ขอเบิก:</span>
              <p className="font-bold text-slate-900 text-xs sm:text-sm print:text-xs">{currentOrder.requesterName}</p>
              {currentOrder.requesterEmail && (
                <p className="text-slate-500 font-mono text-[10px] print:text-[9px]">{currentOrder.requesterEmail}</p>
              )}
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-500 font-medium">หน่วยงาน / ส่วนงาน:</span>
              <p className="font-bold text-slate-900 text-xs sm:text-sm print:text-xs">{currentOrder.department}</p>
            </div>
            <div className="sm:col-span-2 pt-1.5 border-t border-slate-200/80">
              <span className="text-slate-500 font-medium">วัตถุประสงค์ในการขอเบิก:</span>
              <p className="text-slate-800 font-medium mt-0.5 print:text-[10px]">{currentOrder.purpose || "เพื่อใช้ในการปฏิบัติงาน"}</p>
            </div>
          </div>

          {/* Requisition Table & Mobile Cards */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 flex items-center space-x-1.5 uppercase tracking-wide print:text-[10px]">
              <span>รายการพัสดุและวัสดุสิ้นเปลืองที่ขอเบิก</span>
              <span className="text-slate-500 font-normal">({currentOrder.items.length} รายการ)</span>
            </h3>

            {/* Smartphone View: Modern Clean Item Cards (sm:hidden) */}
            <div className="sm:hidden space-y-2 print:hidden">
              {currentOrder.items.map((item, idx) => (
                <div key={idx} className="bg-slate-50/90 border border-slate-200 rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-600">
                        #{idx + 1}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-red-50 text-[#DA2128] border border-red-200 text-[10px] font-mono font-bold">
                        {item.code}
                      </span>
                    </div>
                    <span className="text-xs font-black text-[#DA2128] shrink-0">
                      ฿{((item.unitPrice || 0) * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  <p className="font-bold text-xs text-slate-900 leading-snug">{item.name}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>
                      จำนวน: <strong className="text-slate-800 font-bold">{item.quantity} {item.unit}</strong>
                    </span>
                    <span>
                      ราคา/หน่วย: ฿{(item.unitPrice || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}

              {/* Total Card on Smartphone */}
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-xs font-bold text-slate-700">ยอดรวมทั้งสิ้น</span>
                  <p className="text-[10px] text-slate-500">รวม {currentOrder.totalItems} ชิ้น</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-[#DA2128]">
                    ฿{(currentOrder.totalAmount || 0).toLocaleString()} บาท
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop & Print View: 7-Column Table (hidden sm:block print:block) */}
            <div className="hidden sm:block print:block border border-slate-200 rounded-xl overflow-hidden text-xs print:text-[10px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2 text-center w-10 print:p-1">ลำดับ</th>
                    <th className="p-2 print:p-1">รหัสพัสดุ (SKU)</th>
                    <th className="p-2 print:p-1">รายการพัสดุ</th>
                    <th className="p-2 text-center print:p-1">จำนวน</th>
                    <th className="p-2 text-center print:p-1">หน่วย</th>
                    <th className="p-2 text-right print:p-1">ราคา/หน่วย</th>
                    <th className="p-2 text-right print:p-1">รวมเป็นเงิน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentOrder.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2 text-center text-slate-500 font-mono font-bold print:p-1">{idx + 1}</td>
                      <td className="p-2 font-mono font-bold text-[#DA2128] print:p-1">{item.code}</td>
                      <td className="p-2 font-bold text-slate-900 print:p-1">{item.name}</td>
                      <td className="p-2 text-center font-bold text-slate-900 print:p-1">{item.quantity}</td>
                      <td className="p-2 text-center text-slate-600 print:p-1">{item.unit}</td>
                      <td className="p-2 text-right text-slate-600 print:p-1">฿{(item.unitPrice || 0).toLocaleString()}</td>
                      <td className="p-2 text-right font-bold text-slate-900 print:p-1">
                        ฿{((item.unitPrice || 0) * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-red-50/40 border-t-2 border-red-100 font-bold">
                    <td colSpan={3} className="p-2 text-right text-slate-800 print:p-1">
                      รวมทั้งสิ้น ({currentOrder.totalItems} ชิ้น):
                    </td>
                    <td colSpan={4} className="p-2 text-right text-xs sm:text-sm font-black text-[#DA2128] print:p-1 print:text-xs">
                      ฿{(currentOrder.totalAmount || 0).toLocaleString()} บาท
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4-PARTY DIGITAL SIGNATURES SECTION (100% PAPERLESS) */}
          {/* ========================================================================= */}
          <div className="space-y-2 pt-1 print:pt-0">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 print:pb-1">
              <h3 className="text-xs font-black text-slate-900 flex items-center space-x-1.5 uppercase tracking-wide print:text-[10px]">
                <PenTool className="w-3.5 h-3.5 text-[#DA2128]" />
                <span>การลงนามอิเล็กทรอนิกส์ในระบบ 4 ฝ่าย (Paperless E-Signatures)</span>
              </h3>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold border border-emerald-200 print:text-[8px] print:py-0">
                ระบบตรวจสอบสิทธิ์ดิจิทัล มศว
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 gap-2 text-xs print:gap-1.5">
              
              {/* 1. ผู้ขอเบิก (Requester) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col justify-between space-y-2 relative overflow-hidden print:p-2 print:rounded-xl print:bg-slate-50/50">
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 print:text-[10px]">1. ผู้ขอเบิกพัสดุ</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  </div>
                  <p className="text-[10px] text-slate-400 print:text-[8px]">ลงนามส่งคำขอในระบบ</p>
                </div>

                {/* Signature Seal */}
                <div className="my-auto py-1.5 text-center space-y-1 bg-white p-2 rounded-xl border border-dashed border-emerald-300 print:p-1.5 print:rounded-lg">
                  <div className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black print:text-[8px] print:py-0">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    <span>ลงนามดิจิทัลแล้ว</span>
                  </div>
                  <p className="font-bold text-slate-900 text-xs truncate print:text-[10px]">
                    {currentOrder.requesterSignature?.name || currentOrder.requesterName}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono print:text-[8px]">
                    {formatDateTime(currentOrder.requesterSignature?.signedAt || currentOrder.createdAt)}
                  </p>
                  <div className="pt-1 border-t border-slate-100 flex flex-col items-center">
                    <span className="inline-flex items-center space-x-0.5 text-[8.5px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded print:text-[7.5px] print:py-0">
                      <Lock className="w-2 h-2" />
                      <span>ลงนามด้วยการยืนยันตัวตนผ่านระบบ</span>
                    </span>
                    {currentOrder.requesterSignature?.verificationToken && (
                      <span className="text-[7.5px] text-slate-400 font-mono mt-0.5 print:text-[7px]">
                        รหัสรับรอง: {currentOrder.requesterSignature.verificationToken}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[9px] text-center text-slate-400 font-medium print:text-[8px]">
                  (ผู้ขอเบิก / Requester)
                </div>
              </div>

              {/* 2. ผู้อนุมัติ (Approver) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col justify-between space-y-2 relative overflow-hidden print:p-2 print:rounded-xl print:bg-slate-50/50">
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 print:text-[10px]">2. ผู้อนุมัติคำขอ</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      currentOrder.status === "อนุมัติแล้ว" || currentOrder.status === "จ่ายพัสดุแล้ว"
                        ? "bg-emerald-500"
                        : currentOrder.status === "ปฏิเสธ"
                        ? "bg-rose-500"
                        : "bg-amber-400 animate-pulse"
                    }`}></span>
                  </div>
                  <p className="text-[10px] text-slate-400 print:text-[8px]">หัวหน้าส่วนงาน / ผู้มีอำนาจ</p>
                </div>

                {/* Signature Seal / Action */}
                {currentOrder.status === "อนุมัติแล้ว" || currentOrder.status === "จ่ายพัสดุแล้ว" ? (
                  <div className="my-auto py-1.5 text-center space-y-1 bg-white p-2 rounded-xl border border-dashed border-emerald-300 print:p-1.5 print:rounded-lg">
                    {currentOrder.approverSignature?.signatureImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={currentOrder.approverSignature.signatureImage}
                        alt="ลายเซ็นผู้อนุมัติ"
                        className="h-8 mx-auto object-contain print:h-6"
                      />
                    ) : (
                      <div className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black print:text-[8px] print:py-0">
                        <Award className="w-2.5 h-2.5 text-emerald-600" />
                        <span>อนุมัติทางอิเล็กทรอนิกส์</span>
                      </div>
                    )}
                    <p className="font-bold text-slate-900 text-xs truncate print:text-[10px]">
                      {currentOrder.approverSignature?.name || currentOrder.approverName || "ผู้อนุมัติ"}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono print:text-[8px]">
                      {formatDateTime(currentOrder.approverSignature?.signedAt || currentOrder.approvedAt)}
                    </p>
                    <div className="pt-1 border-t border-slate-100 flex flex-col items-center">
                      <span className="inline-flex items-center space-x-0.5 text-[8.5px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded print:text-[7.5px] print:py-0">
                        <ShieldCheck className="w-2 h-2" />
                        <span>ลงนามด้วยการยืนยันตัวตนผ่านระบบ</span>
                      </span>
                      {currentOrder.approverSignature?.verificationToken && (
                        <span className="text-[7.5px] text-slate-400 font-mono mt-0.5 print:text-[7px]">
                          รหัสรับรอง: {currentOrder.approverSignature.verificationToken}
                        </span>
                      )}
                    </div>
                  </div>
                ) : currentOrder.status === "ปฏิเสธ" ? (
                  <div className="my-auto py-1.5 text-center space-y-1 bg-white p-2 rounded-xl border border-dashed border-rose-300 print:p-1.5 print:rounded-lg">
                    <div className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[9px] font-black print:text-[8px] print:py-0">
                      <XCircle className="w-2.5 h-2.5 text-rose-600" />
                      <span>ปฏิเสธคำขอ</span>
                    </div>
                    <p className="font-bold text-slate-900 text-xs truncate print:text-[10px]">
                      {currentOrder.approverSignature?.name || currentOrder.approverName || "ผู้อนุมัติ"}
                    </p>
                    <p className="text-[9px] text-rose-600 line-clamp-2 print:text-[8px]">
                      {currentOrder.rejectReason || "เหตุผล: ไม่อนุมัติ"}
                    </p>
                  </div>
                ) : (
                  <div className="my-auto py-2 text-center space-y-1.5">
                    <span className="text-[10px] text-amber-700 font-bold block bg-amber-50 p-1.5 rounded-xl border border-amber-200">
                      ⏳ อยู่ระหว่างรอการอนุมัติ
                    </span>

                    {/* Interactive Sign Buttons for Approvers (Hidden on Print) */}
                    {canApprove && (
                      <div className="space-y-1 pt-0.5 print:hidden">
                        <button
                          onClick={handleApprove}
                          disabled={isProcessing}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1 shadow-xs transition-all cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>ลงนามอนุมัติ (ด่วน)</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setCanvasSignRole("approver");
                            setIsSignCanvasOpen(true);
                            setTimeout(setupCanvas, 100);
                          }}
                          disabled={isProcessing}
                          className="w-full py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1 transition-all cursor-pointer"
                        >
                          <PenTool className="w-3 h-3 text-amber-400" />
                          <span>วาดลายเซ็นบนจอ</span>
                        </button>

                        <button
                          onClick={() => setIsRejectModalOpen(true)}
                          disabled={isProcessing}
                          className="w-full py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 transition-all cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          <span>ปฏิเสธ</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-[9px] text-center text-slate-400 font-medium print:text-[8px]">
                  (ผู้อนุมัติ / Approver)
                </div>
              </div>

              {/* 3. ผู้จ่ายพัสดุ (Dispenser) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col justify-between space-y-2 relative overflow-hidden print:p-2 print:rounded-xl print:bg-slate-50/50">
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 print:text-[10px]">3. ผู้จ่ายพัสดุ</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      currentOrder.dispenserSignature || currentOrder.status === "จ่ายพัสดุแล้ว"
                        ? "bg-emerald-500"
                        : currentOrder.status === "อนุมัติแล้ว"
                        ? "bg-sky-500 animate-pulse"
                        : "bg-slate-300"
                    }`}></span>
                  </div>
                  <p className="text-[10px] text-slate-400 print:text-[8px]">เจ้าหน้าที่คลังพัสดุ</p>
                </div>

                {/* Signature Seal / Action */}
                {currentOrder.dispenserSignature || currentOrder.dispensedAt ? (
                  <div className="my-auto py-1.5 text-center space-y-1 bg-white p-2 rounded-xl border border-dashed border-sky-300 print:p-1.5 print:rounded-lg">
                    <div className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[9px] font-black print:text-[8px] print:py-0">
                      <PackageCheck className="w-2.5 h-2.5 text-sky-600" />
                      <span>จ่ายพัสดุเรียบร้อย</span>
                    </div>
                    <p className="font-bold text-slate-900 text-xs truncate print:text-[10px]">
                      {currentOrder.dispenserSignature?.name || "เจ้าหน้าที่คลังพัสดุ"}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono print:text-[8px]">
                      {formatDateTime(currentOrder.dispenserSignature?.signedAt || currentOrder.dispensedAt)}
                    </p>
                    <div className="pt-1 border-t border-slate-100 flex flex-col items-center">
                      <span className="inline-flex items-center space-x-0.5 text-[8.5px] font-semibold text-sky-700 bg-sky-50 px-1 py-0.5 rounded print:text-[7.5px] print:py-0">
                        <Lock className="w-2 h-2" />
                        <span>ลงนามด้วยการยืนยันตัวตนผ่านระบบ</span>
                      </span>
                      {currentOrder.dispenserSignature?.verificationToken && (
                        <span className="text-[7.5px] text-slate-400 font-mono mt-0.5 print:text-[7px]">
                          รหัสรับรอง: {currentOrder.dispenserSignature.verificationToken}
                        </span>
                      )}
                    </div>
                  </div>
                ) : currentOrder.status === "อนุมัติแล้ว" ? (
                  <div className="my-auto py-2 text-center space-y-1.5">
                    <span className="text-[10px] text-sky-700 font-bold block bg-sky-50 p-1.5 rounded-xl border border-sky-200">
                      📦 รอเจ้าหน้าที่จ่ายพัสดุ
                    </span>

                    {/* Interactive Dispense Sign Button for Store Officers (Hidden on Print) */}
                    {canApprove && (
                      <button
                        onClick={handleDispense}
                        disabled={isProcessing}
                        className="w-full py-2 bg-[#DA2128] hover:bg-[#B81B22] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1 shadow-xs transition-all cursor-pointer print:hidden"
                      >
                        <PackageCheck className="w-3 h-3" />
                        <span>ลงนามจ่ายพัสดุ</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="my-auto py-3 text-center text-slate-400 text-[10px]">
                    (รอขั้นตอนอนุมัติ)
                  </div>
                )}

                <div className="text-[9px] text-center text-slate-400 font-medium print:text-[8px]">
                  (ผู้จ่ายพัสดุ / Dispenser)
                </div>
              </div>

              {/* 4. ผู้รับพัสดุ (Receiver) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col justify-between space-y-2 relative overflow-hidden print:p-2 print:rounded-xl print:bg-slate-50/50">
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 print:text-[10px]">4. ผู้รับพัสดุ</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      currentOrder.receiverSignature || currentOrder.status === "จ่ายพัสดุแล้ว"
                        ? "bg-emerald-500"
                        : "bg-slate-300"
                    }`}></span>
                  </div>
                  <p className="text-[10px] text-slate-400 print:text-[8px]">ผู้ขอเบิกหรือตัวแทนรับของ</p>
                </div>

                {/* Signature Seal / Action */}
                {currentOrder.receiverSignature ? (
                  <div className="my-auto py-1.5 text-center space-y-1 bg-white p-2 rounded-xl border border-dashed border-emerald-300 print:p-1.5 print:rounded-lg">
                    {currentOrder.receiverSignature.signatureImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={currentOrder.receiverSignature.signatureImage}
                        alt="ลายเซ็นผู้รับพัสดุ"
                        className="h-8 mx-auto object-contain print:h-6"
                      />
                    ) : (
                      <div className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black print:text-[8px] print:py-0">
                        <UserCheck className="w-2.5 h-2.5 text-emerald-600" />
                        <span>ลงนามรับมอบแล้ว</span>
                      </div>
                    )}
                    <p className="font-bold text-slate-900 text-xs truncate print:text-[10px]">
                      {currentOrder.receiverSignature.name}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono print:text-[8px]">
                      {formatDateTime(currentOrder.receiverSignature.signedAt)}
                    </p>
                    <div className="pt-1 border-t border-slate-100 flex flex-col items-center">
                      <span className="inline-flex items-center space-x-0.5 text-[8.5px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded print:text-[7.5px] print:py-0">
                        {currentOrder.receiverSignature.signatureImage ? (
                          <>
                            <PenTool className="w-2 h-2" />
                            <span>ลงนามด้วยลายมือชื่อสด</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-2 h-2" />
                            <span>ลงนามด้วยการยืนยันตัวตนผ่านระบบ</span>
                          </>
                        )}
                      </span>
                      {currentOrder.receiverSignature?.verificationToken && (
                        <span className="text-[7.5px] text-slate-400 font-mono mt-0.5 print:text-[7px]">
                          รหัสรับรอง: {currentOrder.receiverSignature.verificationToken}
                        </span>
                      )}
                    </div>
                  </div>
                ) : currentOrder.status === "อนุมัติแล้ว" || currentOrder.dispenserSignature ? (
                  <div className="my-auto py-2 text-center space-y-1.5">
                    <span className="text-[10px] text-slate-600 font-bold block bg-slate-100 p-1.5 rounded-xl print:text-[9px]">
                      ✍️ พร้อมลงนามรับพัสดุ
                    </span>

                    {/* Interactive Sign Actions for Receiver (Hidden on Print) */}
                    <div className="space-y-1 print:hidden">
                      <button
                        onClick={() => {
                          setCanvasSignRole("receiver");
                          setIsSignCanvasOpen(true);
                          setTimeout(setupCanvas, 100);
                        }}
                        disabled={isProcessing}
                        className="w-full py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1 transition-all cursor-pointer"
                      >
                        <PenTool className="w-3 h-3 text-amber-400" />
                        <span>วาดลายเซ็นบนจอ</span>
                      </button>

                      <button
                        onClick={handleQuickReceive}
                        disabled={isProcessing}
                        className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 transition-all cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>ยืนยันรับด้วยบัญชี</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="my-auto py-3 text-center text-slate-400 text-[10px]">
                    (รอขั้นตอนจ่ายพัสดุ)
                  </div>
                )}

                <div className="text-[9px] text-center text-slate-400 font-medium print:text-[8px]">
                  (ผู้รับพัสดุ / Receiver)
                </div>
              </div>

            </div>
          </div>

          {/* Paperless Security Audit Verification Footer */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-1.5 print:pt-1.5 print:text-[8px]">
            <div className="flex items-center space-x-1.5">
              <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>เอกสารฉบับนี้ลงนามและรับรองด้วยระบบดิจิทัลตาม พ.ร.บ. ว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์</span>
            </div>
            <div className="font-mono text-slate-400 text-[9px] print:text-[7.5px]">
              SWU-SEC-VERIFIED • DOC: {currentOrder.id || currentOrder.reqNo}
            </div>
          </div>

        </div>

        {/* Modal Close Bottom Bar (Hidden on Print) */}
        <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3 pt-1 print:hidden">
          <button
            onClick={handleCaptureScreenshot}
            disabled={isCapturing}
            className="sm:hidden px-4 py-2.5 bg-red-50 hover:bg-red-100 text-[#DA2128] border border-red-200 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>{isCapturing ? "กำลังบันทึก..." : "แคปหน้าจอ"}</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-MODAL: DRAWING CANVAS SIGNATURE PAD (TOUCH & PEN) */}
      {/* ========================================================================= */}
      {isSignCanvasOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md print:hidden">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-red-50 text-[#DA2128]">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {canvasSignRole === "approver" ? "ลงนามอนุมัติคำขอบนหน้าจอ" : "ลงนามรับพัสดุบนหน้าจอ"}
                  </h3>
                  <p className="text-[11px] text-slate-500">ใช้นิ้วมือ ปากกา หรือเมาส์เพื่อเซ็นชื่อ</p>
                </div>
              </div>
              <button
                onClick={() => setIsSignCanvasOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Canvas Box */}
            <div className="space-y-2">
              <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 overflow-hidden touch-none h-44 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full cursor-crosshair"
                />
                {!hasDrawn && (
                  <div className="absolute pointer-events-none text-center space-y-1 opacity-40">
                    <PenTool className="w-6 h-6 mx-auto text-slate-400" />
                    <p className="text-xs font-semibold text-slate-400">เซ็นชื่อในกรอบนี้</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ล้างลายเซ็น</span>
                </button>
                <span className="text-[11px] text-slate-400">หมึกน้ำเงินทางการ (Official Ink)</span>
              </div>
            </div>

            {/* Signer Confirmation */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block">
                {canvasSignRole === "approver" ? "ผู้อนุมัติ:" : "ผู้รับพัสดุ:"}
              </span>
              <span className="font-bold text-slate-900">
                {canvasSignRole === "approver" ? user?.name || "ผู้อนุมัติ" : user?.name || currentOrder.requesterName}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSignCanvasOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={canvasSignRole === "approver" ? handleApproveWithCanvas : handleReceiveWithCanvas}
                disabled={!hasDrawn || isProcessing}
                className="flex-1 py-2.5 bg-[#DA2128] hover:bg-[#B81B22] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 shadow-md cursor-pointer flex items-center justify-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>ยืนยันการลงนาม</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MODAL: REJECT REASON */}
      {/* ========================================================================= */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md print:hidden">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">ปฏิเสธใบขอเบิก {currentOrder.reqNo}</h3>
              <p className="text-xs text-slate-500">กรุณาระบุเหตุผลเพื่อให้ผู้ขอเบิกทราบ</p>
            </div>

            <textarea
              rows={3}
              required
              placeholder="เช่น พัสดุชนิดนี้จัดสรรสำหรับงานส่วนกลางเท่านั้น หรือข้อมูลไม่ครบถ้วน"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#DA2128]"
            />

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectReason.trim()}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
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
