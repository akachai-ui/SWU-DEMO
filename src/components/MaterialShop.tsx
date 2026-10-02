"use client";

import React, { useState, useEffect } from "react";
import {
  ConsumableItem,
  RequisitionOrder,
  subscribeToConsumables,
  addConsumableToFirestore,
  updateConsumableInFirestore,
  deleteConsumableFromFirestore,
  saveRequisitionToFirestore
} from "@/lib/consumablesService";
import { useAuth } from "@/lib/authContext";
import DigitalRequisitionDocument from "@/components/DigitalRequisitionDocument";
import {
  Search,
  Plus,
  ShoppingCart,
  Package,
  Layers,
  Sparkles,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Image as ImageIcon,
  DollarSign,
  MapPin,
  FileText,
  X,
  PlusCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Flame,
  Building,
  User,
  Clock,
  ArrowRight,
  Check
} from "lucide-react";

const CATEGORIES = [
  "ทั้งหมด",
  "วัสดุสำนักงาน",
  "วัสดุไฟฟ้าและประปา",
  "วัสดุงานช่างและซ่อมบำรุง",
  "วัสดุไอทีและคอมพิวเตอร์",
  "วัสดุทำความสะอาดและสุขอนามัย",
  "วัสดุการแพทย์และปฐมพยาบาล",
  "วัสดุอื่น ๆ"
];

const UNITS = [
  "อัน",
  "รีม",
  "กล่อง",
  "ม้วน",
  "เล่ม",
  "แพ็ค",
  "กระป๋อง",
  "หลอด",
  "เส้น",
  "ขวด",
  "โหล",
  "ชุด",
  "คู่",
  "ตัว",
  "ถุง",
  "แผ่น",
  "กิโลกรัม",
  "เมตร"
];

export default function MaterialShop() {
  const { user } = useAuth();
  const [items, setItems] = useState<ConsumableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseLive, setIsFirebaseLive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock">("all");

  // Permission Checks
  const canAddConsumables = Boolean(user?.permissions?.canAddConsumables || user?.role === "super_admin" || user?.role === "inventory_officer");
  const canRequestConsumables = Boolean(user?.permissions?.canRequestConsumables !== false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isDigitalDocOpen, setIsDigitalDocOpen] = useState(false);
  const [lastReqOrder, setLastReqOrder] = useState<RequisitionOrder | null>(null);

  // Cart State: { [code]: quantity }
  const [cart, setCart] = useState<{ [code: string]: number }>({});

  // Add/Edit Form State
  const [formData, setFormData] = useState<ConsumableItem>({
    code: "",
    name: "",
    category: "วัสดุสำนักงาน",
    unit: "อัน",
    stock: 1,
    minStock: 1,
    unitPrice: 0,
    location: "",
    imageUrl: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Requisition Checkout Form
  const [checkoutForm, setCheckoutForm] = useState({
    requesterName: "",
    department: "",
    purpose: "",
    urgency: "ปกติ" as "ปกติ" | "ด่วน" | "ด่วนที่สุด"
  });

  // Auto-sync logged in user details to checkoutForm
  useEffect(() => {
    if (user) {
      setCheckoutForm((prev) => ({
        ...prev,
        requesterName: user.name || prev.requesterName,
        department: user.department || "ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ"
      }));
    }
  }, [user]);

  // Show Toast
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Subscribe to Real Firebase Firestore
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToConsumables(
      (firestoreItems) => {
        setItems(firestoreItems);
        setIsFirebaseLive(true);
        setIsLoading(false);
      },
      (err) => {
        console.warn("Firestore listener error:", err);
        setIsFirebaseLive(false);
        setIsLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Filter Items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "ทั้งหมด" || item.category === selectedCategory;

    let matchesStock = true;
    if (stockFilter === "in_stock") matchesStock = item.stock > 0;
    if (stockFilter === "low_stock") matchesStock = item.stock > 0 && item.stock <= (item.minStock || 5);

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Cart Calculations
  const cartItems = Object.entries(cart)
    .map(([code, qty]) => {
      const item = items.find((i) => i.code === code);
      return item ? { item, qty } : null;
    })
    .filter(Boolean) as { item: ConsumableItem; qty: number }[];

  const totalCartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalCartPrice = cartItems.reduce(
    (acc, curr) => acc + (curr.item.unitPrice || 0) * curr.qty,
    0
  );

  const handleAddToCart = (code: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const item = items.find((i) => i.code === code);
    if (!item) return;

    const currentQty = cart[code] || 0;
    if (currentQty >= item.stock) {
      showToast(`สินค้า "${item.name}" มีสต็อกคงเหลือเพียง ${item.stock} ${item.unit}`, "error");
      return;
    }

    setCart((prev) => ({
      ...prev,
      [code]: currentQty + 1
    }));
    showToast(`เพิ่ม "${item.name}" ลงในรายการขอเบิกแล้ว`);
  };

  const handleUpdateCartQty = (code: string, delta: number) => {
    const item = items.find((i) => i.code === code);
    if (!item) return;

    const currentQty = cart[code] || 0;
    const newQty = currentQty + delta;

    if (newQty <= 0) {
      const updated = { ...cart };
      delete updated[code];
      setCart(updated);
    } else if (newQty > item.stock) {
      showToast(`จำนวนเกินยอดคงเหลือในสต็อก (${item.stock} ${item.unit})`, "error");
    } else {
      setCart((prev) => ({ ...prev, [code]: newQty }));
    }
  };

  const handleRemoveFromCart = (code: string) => {
    const updated = { ...cart };
    delete updated[code];
    setCart(updated);
  };

  // Generate SKU Code Helper
  const generateNewSku = (category: string) => {
    let prefix = "MAT-OFF";
    if (category.includes("ไฟฟ้า") || category.includes("ประปา")) prefix = "MAT-ELE";
    else if (category.includes("ช่าง") || category.includes("ซ่อม")) prefix = "MAT-MNT";
    else if (category.includes("ไอที") || category.includes("คอมพิวเตอร์")) prefix = "MAT-IT";
    else if (category.includes("ทำความสะอาด")) prefix = "MAT-CLN";
    else if (category.includes("แพทย์") || category.includes("ปฐมพยาบาล")) prefix = "MAT-MED";
    else prefix = "MAT-GEN";

    const randomNum = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${randomNum}`;
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingId(null);
    const newSku = generateNewSku("วัสดุสำนักงาน");
    setFormData({
      code: newSku,
      name: "",
      category: "วัสดุสำนักงาน",
      unit: "อัน",
      stock: 1,
      minStock: 1,
      unitPrice: 0,
      location: "",
      imageUrl: "",
      description: ""
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: ConsumableItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(item.id || item.code);
    setFormData({
      ...item
    });
    setIsAddModalOpen(true);
  };

  // Submit Add / Edit Form to Firestore
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submit

    if (!formData.name.trim()) {
      showToast("กรุณากรอกชื่อรายการวัสดุ", "error");
      return;
    }
    if (!formData.code.trim()) {
      showToast("กรุณาระบุรหัสพัสดุ", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        // Update
        await updateConsumableInFirestore(editingId, formData);
        showToast(`อัปเดตข้อมูล "${formData.name}" บนฐานข้อมูล Firebase สำเร็จ!`);
      } else {
        // Add new
        await addConsumableToFirestore(formData);
        showToast(`บันทึกข้อมูล "${formData.name}" เข้าสู่ Cloud Firestore สำเร็จ!`);
      }
      // Reset material form to blank
      setFormData({
        code: "",
        name: "",
        category: "วัสดุสำนักงาน",
        unit: "อัน",
        stock: 1,
        minStock: 1,
        unitPrice: 0,
        location: "",
        imageUrl: "",
        description: ""
      });
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error("Save error:", err);
      showToast(`บันทึกไม่สำเร็จ: ${err.message || "ตรวจสอบสิทธิ์ Firebase Rules"}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Item
  const handleDeleteItem = async (item: ConsumableItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`คุณต้องการลบรายการ "${item.name}" (${item.code}) ออกจากฐานข้อมูลใช่หรือไม่?`)) return;

    try {
      await deleteConsumableFromFirestore(item.id || item.code);
      showToast(`ลบรายการ "${item.name}" ออกจากฐานข้อมูลแล้ว`);
    } catch (err: any) {
      showToast(`ไม่สามารถลบข้อมูลได้: ${err.message}`, "error");
    }
  };

  // Submit Requisition Order
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingCheckout) return; // Prevent duplicate submit
    if (cartItems.length === 0) return;

    const finalRequesterName = checkoutForm.requesterName.trim() || user?.name || "";
    const finalDepartment = checkoutForm.department.trim() || user?.department || "ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ";

    if (!finalRequesterName) {
      showToast("กรุณากรอกชื่อผู้ขอเบิก", "error");
      return;
    }

    setIsSubmittingCheckout(true);

    try {
      const reqNo = `REQ-SWU-${new Date().getFullYear() + 543}-${Math.floor(1000 + Math.random() * 9000)}`;
      const verificationToken = `SWU-REQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const orderData: Omit<RequisitionOrder, "id" | "createdAt"> = {
        reqNo,
        requesterEmail: user?.email || "",
        requesterName: finalRequesterName,
        department: finalDepartment,
        purpose: checkoutForm.purpose || "เพื่อใช้ในการปฏิบัติงาน",
        urgency: checkoutForm.urgency,
        items: cartItems.map(({ item, qty }) => ({
          code: item.code,
          name: item.name,
          unit: item.unit,
          quantity: qty,
          unitPrice: item.unitPrice || 0,
          totalPrice: (item.unitPrice || 0) * qty,
          imageUrl: item.imageUrl
        })),
        totalItems: totalCartCount,
        totalAmount: totalCartPrice,
        status: "รออนุมัติ",
        requesterSignature: {
          name: finalRequesterName,
          email: user?.email || "",
          role: "ผู้ขอเบิกพัสดุ",
          signedAt: new Date().toISOString(),
          status: "APPROVED",
          verificationToken
        }
      };

      await saveRequisitionToFirestore(orderData);
      
      // Deduct stock in Firestore
      for (const { item, qty } of cartItems) {
        const newStock = Math.max(0, item.stock - qty);
        await updateConsumableInFirestore(item.id || item.code, { stock: newStock });
      }

      showToast("บันทึกใบขอเบิกพัสดุลงใน Firestore เรียบร้อยแล้ว!");

      // Reset and Clear Form + Cart
      setLastReqOrder(orderData as RequisitionOrder);
      setCart({});
      setCheckoutForm({
        requesterName: user?.name || "",
        department: user?.department || "ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ",
        purpose: "",
        urgency: "ปกติ"
      });
      setIsCartOpen(false);
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      console.warn("Requisition save error:", err);
      showToast(`บันทึกไม่สำเร็จ: ${err.message || "เกิดข้อผิดพลาด"}`, "error");
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-semibold transition-all ${
            notification.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner & Action Controls */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3.5 sm:space-y-5">
        {/* Header Title & Action Button Row */}
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
            <span className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-red-50 text-[#DA2128] shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <div className="min-w-0 flex-1 space-y-0.5">
              <h1 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight leading-tight truncate">
                คลังและระบบเบิกจ่ายพัสดุ
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                ระบบพัสดุสิ้นเปลือง ส่วนพัฒนากายภาพ มศว
              </p>
            </div>
          </div>

          {/* Action Button (Add Material) */}
          {canAddConsumables && (
            <button
              onClick={handleOpenAddModal}
              className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#DA2128] to-[#FF3B44] hover:from-[#B81B22] hover:to-[#DA2128] rounded-xl sm:rounded-2xl transition-all shadow-md shadow-red-500/20 flex items-center space-x-1.5 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">เพิ่มรายการวัสดุใหม่</span>
              <span className="sm:hidden">เพิ่มพัสดุ</span>
            </button>
          )}
        </div>

        {/* Search & Stock Filter */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 pt-2 sm:pt-3 border-t border-slate-100">
            {/* Search Input */}
            <div className="sm:col-span-7 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="ค้นหาชื่อพัสดุ, SKU, ตำแหน่ง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#DA2128]/15 focus:border-[#DA2128] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Stock Segmented Filter */}
            <div className="sm:col-span-5 flex items-center space-x-1 bg-slate-100/90 p-1 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-semibold">
              <button
                onClick={() => setStockFilter("all")}
                className={`flex-1 py-1.5 rounded-lg sm:rounded-xl text-center transition-all ${
                  stockFilter === "all"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                ทั้งหมด ({items.length})
              </button>
              <button
                onClick={() => setStockFilter("in_stock")}
                className={`flex-1 py-1.5 rounded-lg sm:rounded-xl text-center transition-all ${
                  stockFilter === "in_stock"
                    ? "bg-white text-emerald-700 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                มีของ
              </button>
              <button
                onClick={() => setStockFilter("low_stock")}
                className={`flex-1 py-1.5 rounded-lg sm:rounded-xl text-center transition-all ${
                  stockFilter === "low_stock"
                    ? "bg-white text-amber-700 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                ใกล้หมด
              </button>
            </div>
          </div>
        )}

        {/* Category Horizontal Scrolling Chips */}
        {items.length > 0 && (
          <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto pb-0.5 no-scrollbar text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-xl whitespace-nowrap text-[11px] sm:text-xs font-medium transition-all cursor-pointer active:scale-95 ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white font-bold shadow-xs"
                    : "bg-slate-100/90 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#DA2128] animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">กำลังเชื่อมต่อฐานข้อมูล Cloud Firestore...</p>
        </div>
      ) : items.length === 0 ? (
        /* Empty Database State - Ready for user to add real data */
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 sm:p-16 text-center space-y-5 shadow-xs">
          <div className="w-20 h-20 bg-red-50 text-[#DA2128] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Package className="w-10 h-10" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              ยังไม่มีข้อมูลวัสดุสิ้นเปลืองในฐานข้อมูล
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              ฐานข้อมูล Cloud Firestore พร้อมใช้งานแล้ว คุณสามารถเริ่มเพิ่มข้อมูลจริงเข้าสู่ระบบได้ทันที
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-6 py-3 bg-[#DA2128] hover:bg-[#B81B22] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-red-500/20 inline-flex items-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>➕ เพิ่มรายการวัสดุจริงรายการแรก</span>
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <Search className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ทั้งหมด");
              setStockFilter("all");
            }}
            className="text-xs text-[#DA2128] hover:underline font-semibold"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      ) : (
        /* Shop Catalog Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredItems.map((item) => {
            const inCartQty = cart[item.code] || 0;
            const isLow = item.stock > 0 && item.stock <= (item.minStock || 5);
            const isOut = item.stock <= 0;

            return (
              <div
                key={item.id || item.code}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-red-200 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden relative"
              >
                {/* Image Container with Fallback */}
                <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                        (e.target as HTMLElement).nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div
                    className={`${
                      item.imageUrl ? "hidden" : "flex"
                    } w-full h-full items-center justify-center bg-slate-100 text-slate-300`}
                  >
                    <Package className="w-12 h-12" />
                  </div>

                  {/* Stock Status Badge */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    {isOut ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                        สินค้าหมด
                      </span>
                    ) : isLow ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                        สต็อกต่ำ ({item.stock} {item.unit})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600/90 backdrop-blur text-white shadow-xs">
                        คงเหลือ {item.stock} {item.unit}
                      </span>
                    )}
                  </div>

                  {/* Action Menu (Edit & Delete - Only for Inventory Officers and Admins) */}
                  {canAddConsumables && (
                    <div className="absolute top-2.5 right-2.5 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleOpenEditModal(item, e)}
                        className="p-1.5 rounded-lg bg-white/90 backdrop-blur text-slate-600 hover:text-[#DA2128] hover:bg-white shadow-xs transition-colors"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteItem(item, e)}
                        className="p-1.5 rounded-lg bg-white/90 backdrop-blur text-slate-600 hover:text-red-600 hover:bg-white shadow-xs transition-colors"
                        title="ลบรายการ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono font-semibold text-slate-500">{item.code}</span>
                      <span className="text-slate-400 truncate max-w-[100px]">{item.category}</span>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-[#DA2128] transition-colors">
                      {item.name}
                    </h3>

                    {item.location && (
                      <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Price & Cart Actions */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div className="text-xs text-slate-400 font-medium">ราคาต่อหน่วย</div>
                      <div className="text-right">
                        <span className="text-sm sm:text-base font-black text-[#DA2128]">
                          ฿{(item.unitPrice || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">/{item.unit}</span>
                      </div>
                    </div>

                    {/* Add to Cart Stepper / Permission-based Action */}
                    {canRequestConsumables ? (
                      inCartQty > 0 ? (
                        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl p-1">
                          <button
                            onClick={() => handleUpdateCartQty(item.code, -1)}
                            className="w-7 h-7 rounded-lg bg-white text-[#DA2128] hover:bg-red-100 flex items-center justify-center shadow-2xs font-bold transition-all"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-[#DA2128]">
                            {inCartQty} {item.unit}
                          </span>
                          <button
                            onClick={() => handleUpdateCartQty(item.code, 1)}
                            className="w-7 h-7 rounded-lg bg-[#DA2128] text-white hover:bg-[#B81B22] flex items-center justify-center shadow-2xs font-bold transition-all"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleAddToCart(item.code, e)}
                          disabled={isOut}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                            isOut
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-slate-900 hover:bg-[#DA2128] text-white shadow-xs cursor-pointer"
                          }`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>ขอเบิกพัสดุ</span>
                        </button>
                      )
                    ) : (
                      <div className="w-full py-2 px-3 rounded-xl text-xs font-medium text-center bg-slate-50 border border-slate-200 text-slate-500">
                        สิทธิ์ดูรายการอย่างเดียว
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT MATERIAL ITEM (ฟอร์มเพิ่มข้อมูลจริงเข้า Firestore โดยใช้ LINK รูป) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-[#DA2128]">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    {editingId ? "แก้ไขข้อมูลวัสดุ" : "เพิ่มรายการวัสดุจริงเข้าฐานข้อมูล"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    บันทึกลง Cloud Firestore (Collection: <code className="text-[#DA2128] font-mono">consumables_stock</code>)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              {/* Row 1: Code & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">รหัสพัสดุ (SKU / Code) *</label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          code: generateNewSku(prev.category)
                        }))
                      }
                      className="text-[11px] text-[#DA2128] hover:underline font-semibold flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>สุ่มรหัสใหม่อัตโนมัติ</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="เช่น MAT-OFF-001 หรือ MAT-ELE-001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#DA2128]/20 focus:border-[#DA2128]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">หมวดหมู่วัสดุ *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        category: newCat
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#DA2128]/20 focus:border-[#DA2128]"
                  >
                    {CATEGORIES.filter((c) => c !== "ทั้งหมด").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ชื่อรายการวัสดุ / พัสดุสิ้นเปลือง *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ระบุชื่อพัสดุ เช่น กระดาษถ่ายเอกสาร A4 80 แกรม, ปลั๊กไฟ 3 ตา 5 เมตร"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#DA2128]/20 focus:border-[#DA2128]"
                />
              </div>

              {/* Row 3: Image URL (Link) + Live Preview */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-[#DA2128]" />
                      <span>ลิงก์รูปภาพ (Image URL Link)</span>
                    </label>
                    <span className="text-[11px] text-slate-400">ใส่ลิงก์รูปภาพจากเว็บ หรือ Cloud Storage</span>
                  </div>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/images/item-photo.jpg"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#DA2128]/20 focus:border-[#DA2128]"
                  />
                </div>

                {/* Live Image Preview Box */}
                {formData.imageUrl && (
                  <div className="flex items-center space-x-3 p-2.5 bg-white rounded-xl border border-slate-200">
                    <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                          (e.target as HTMLElement).nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                      <div className="hidden w-full h-full flex items-center justify-center bg-rose-50 text-rose-500 text-[10px] text-center p-1 font-bold">
                        ลิงก์เสีย / โหลดภาพไม่ได้
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 space-y-0.5 overflow-hidden">
                      <p className="font-bold text-emerald-700 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ตัวอย่างภาพพร้อมแสดงผล</span>
                      </p>
                      <p className="text-[10px] text-slate-400 truncate max-w-md font-mono">{formData.imageUrl}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Row 4: Numbers (Stock, MinStock, UnitPrice, Unit) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">จำนวนสต็อกคงเหลือ</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#DA2128]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">จุดเตือนสต็อกต่ำ</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#DA2128]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">ราคาต่อหน่วย (฿)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#DA2128]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">หน่วยนับ</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#DA2128]"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Location & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">ตำแหน่งจัดเก็บในคลัง / ตู้</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="เช่น คลัง 1 ชั้น 2 ล็อก A-03"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#DA2128]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">รายละเอียดเพิ่มเติม / สเปก</label>
                  <input
                    type="text"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="เช่น ยี่ห้อ, ขนาด, คุณสมบัติเฉพาะ"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#DA2128]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#DA2128] hover:bg-[#B81B22] text-white text-xs font-bold transition-all shadow-md shadow-red-500/20 flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>กำลังบันทึกลง Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingId ? "บันทึกการแก้ไข" : "บันทึกเข้าฐานข้อมูล Cloud Firestore"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CART & CHECKOUT (ใบเบิกพัสดุ) */}
      {/* ========================================================================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-[#DA2128]">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">ตะกร้าขอเบิกพัสดุ</h2>
                  <p className="text-xs text-slate-500">ตรวจสอบรายการและระบุข้อมูลผู้ขอเบิก</p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-6 space-y-5">
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {cartItems.map(({ item, qty }) => (
                  <div
                    key={item.code}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 m-auto text-slate-300" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{item.code}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5">
                        <button
                          onClick={() => handleUpdateCartQty(item.code, -1)}
                          className="text-slate-500 hover:text-red-600 font-bold px-1"
                        >
                          -
                        </button>
                        <span className="font-bold text-slate-900">{qty}</span>
                        <button
                          onClick={() => handleUpdateCartQty(item.code, 1)}
                          className="text-slate-500 hover:text-red-600 font-bold px-1"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-[#DA2128] min-w-[60px] text-right">
                        ฿{((item.unitPrice || 0) * qty).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleRemoveFromCart(item.code)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Price Bar */}
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">มูลค่ารวมทั้งสิ้น</span>
                <span className="text-base font-black text-[#DA2128]">
                  ฿{totalCartPrice.toLocaleString()} บาท
                </span>
              </div>

              {/* Requester Information Form */}
              <form onSubmit={handleCheckoutSubmit} className="space-y-3.5 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-[#DA2128]" />
                    <span>ข้อมูลผู้ขอเบิกและหน่วยงาน</span>
                  </h3>
                  {user && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>ดึงข้อมูลจากบัญชีผู้ใช้อัตโนมัติ</span>
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">ชื่อ-นามสกุล ผู้ขอเบิก *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น นายสมชาย ใจดี"
                    value={checkoutForm.requesterName || (user ? user.name : "")}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, requesterName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#DA2128]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">หน่วยงาน / ส่วนงาน *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ส่วนพัฒนากายภาพ / ฝ่ายอาคารสถานที่"
                    value={checkoutForm.department || (user ? user.department : "ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ")}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#DA2128]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">วัตถุประสงค์ในการขอเบิก *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="ระบุเหตุผลความจำเป็นในการขอเบิกใช้งาน เช่น ใช้สำหรับงานซ่อมบำรุงอาคาร"
                    value={checkoutForm.purpose}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, purpose: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#DA2128]"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end space-x-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    เลือกเพิ่ม
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCheckout}
                    className="px-6 py-2.5 bg-[#DA2128] hover:bg-[#B81B22] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
                  >
                    {isSubmittingCheckout ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>กำลังส่งใบขอเบิก...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ยืนยันส่งใบขอเบิกพัสดุ</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUCCESS CONFIRMATION RECEIPT */}
      {/* ========================================================================= */}
      {isSuccessModalOpen && lastReqOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center animate-scaleUp">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">ส่งใบขอเบิกพัสดุเรียบร้อยแล้ว!</h3>
              <p className="text-xs text-slate-500">บันทึกข้อมูลเข้าสู่ระบบ Cloud Firestore แล้ว</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">เลขที่ใบเบิก:</span>
                <span className="font-mono font-bold text-[#DA2128]">{lastReqOrder.reqNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ผู้ขอเบิก:</span>
                <span className="font-semibold text-slate-900">{lastReqOrder.requesterName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">จำนวนพัสดุ:</span>
                <span className="font-semibold text-slate-900">{lastReqOrder.totalItems} ชิ้น</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">สถานะคำขอ:</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  {lastReqOrder.status}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setIsDigitalDocOpen(true);
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>เปิดดูใบขอเบิกและลงนามดิจิทัล (E-Form)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                ปิดหน้าต่าง / กลับหน้าร้าน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 100% PAPERLESS MASTER DIGITAL REQUISITION VOUCHER MODAL */}
      {/* ========================================================================= */}
      {isDigitalDocOpen && lastReqOrder && (
        <DigitalRequisitionDocument
          order={lastReqOrder}
          isOpen={isDigitalDocOpen}
          onClose={() => setIsDigitalDocOpen(false)}
          onOrderUpdated={(updated) => setLastReqOrder(updated)}
        />
      )}

      {/* ========================================================================= */}
      {/* FLOATING ACTION SHOPPING CART BUTTON (BOTTOM-RIGHT FAB) */}
      {/* ========================================================================= */}
      {canRequestConsumables && (
        <div className="fixed bottom-[72px] right-3.5 sm:bottom-8 sm:right-8 z-40 animate-fadeIn">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className={`group relative flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 cursor-pointer ${
              totalCartCount > 0
                ? "bg-gradient-to-r from-[#DA2128] via-[#FF3B44] to-[#DA2128] hover:from-[#B81B22] hover:to-[#DA2128] text-white p-3 sm:pl-4 sm:pr-5 sm:py-3.5 rounded-full shadow-red-600/40 hover:shadow-red-600/60 ring-4 ring-red-500/20"
                : "bg-slate-900/90 hover:bg-slate-900 text-white p-3 sm:px-4 sm:py-3.5 rounded-full shadow-slate-900/30 backdrop-blur-md border border-slate-700/60"
            }`}
            title="ดูรายการในตะกร้าขอเบิกพัสดุ"
          >
            {/* Cart Icon */}
            <div className="relative flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
              
              {/* Mobile Count Badge */}
              {totalCartCount > 0 && (
                <span className="sm:hidden absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white text-[#DA2128] text-[10px] font-black flex items-center justify-center shadow-md border border-red-200">
                  {totalCartCount > 99 ? "99+" : totalCartCount}
                </span>
              )}
            </div>

            {/* Desktop & Tablet Label & Count Badge */}
            <div className="hidden sm:flex items-center space-x-2 pl-2.5">
              <span className="text-xs font-black tracking-tight">
                {totalCartCount > 0 ? "ตะกร้าขอเบิก" : "ตะกร้าพัสดุ"}
              </span>
              {totalCartCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-white text-[#DA2128] font-black text-xs shadow-xs">
                  {totalCartCount} ชิ้น
                </span>
              )}
            </div>

            {/* Ambient Glow when cart has items */}
            {totalCartCount > 0 && (
              <span className="absolute -inset-0.5 rounded-full bg-[#DA2128] opacity-30 blur-sm group-hover:opacity-60 transition-opacity -z-10 animate-pulse"></span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
