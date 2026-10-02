"use client";

import React, { useState, useEffect } from "react";
import {
  UserAccount,
  UserPermissions,
  UserRole,
  ROLE_PRESETS,
  subscribeToUsers,
  saveUserPermissionToFirestore,
  updateUserPermissionInFirestore,
  deleteUserPermissionFromFirestore,
  createUserWithInitialPassword,
  sendUserPasswordReset
} from "@/lib/permissionService";
import {
  ShieldCheck,
  Users,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Key,
  Flame,
  X,
  RefreshCw,
  Building,
  Mail,
  User,
  SlidersHorizontal,
  Check,
  Shield,
  Layers,
  FileSpreadsheet,
  Package,
  Sparkles,
  ChevronDown,
  Eye,
  EyeOff,
  Copy,
  CheckCheck,
  Dices
} from "lucide-react";

const PERMISSION_DEFINITIONS: { key: keyof UserPermissions; label: string; desc: string; category: string }[] = [
  {
    key: "canViewAssets",
    label: "ดูทะเบียนครุภัณฑ์ (View Assets)",
    desc: "สืบค้นและดูรายละเอียดทะเบียนครุภัณฑ์ทั้งหมดของส่วนพัฒนากายภาพ",
    category: "ครุภัณฑ์"
  },
  {
    key: "canEditAssets",
    label: "แก้ไข/จำหน่ายครุภัณฑ์ (Edit Assets)",
    desc: "แก้ไขข้อมูล ปรับปรุงสถานะ หรือส่งรายการแทงจำหน่ายครุภัณฑ์",
    category: "ครุภัณฑ์"
  },
  {
    key: "canExportAssets",
    label: "ส่งออกรายงานครุภัณฑ์ (Export CSV/Excel)",
    desc: "ดาวน์โหลดไฟล์ CSV ทะเบียนครุภัณฑ์และรายงานสรุป",
    category: "ครุภัณฑ์"
  },
  {
    key: "canViewConsumables",
    label: "ดูร้านวัสดุสิ้นเปลือง (View Materials)",
    desc: "เข้าถึงหน้าร้านและสืบค้นรายการวัสดุสิ้นเปลืองในคลัง",
    category: "วัสดุสิ้นเปลือง"
  },
  {
    key: "canRequestConsumables",
    label: "ทำรายการขอเบิกพัสดุ (Request Items)",
    desc: "หยิบใส่ตะกร้าและส่งใบขอเบิกพัสดุออนไลน์",
    category: "วัสดุสิ้นเปลือง"
  },
  {
    key: "canAddConsumables",
    label: "จัดการสต็อกวัสดุ (Manage Stock)",
    desc: "เพิ่มรายการพัสดุใหม่ แก้ไขจำนวนสต็อก หรือลบรายการ",
    category: "วัสดุสิ้นเปลือง"
  },
  {
    key: "canApproveRequisitions",
    label: "อนุมัติใบขอเบิกพัสดุ (Approve Requests)",
    desc: "พิจารณาอนุมัติหรือปฏิเสธคำขอเบิกพัสดุของบุคลากร",
    category: "การอนุมัติ"
  },
  {
    key: "canManageUsers",
    label: "กำหนดสิทธิ์ผู้ใช้งาน (Manage Users & RBAC)",
    desc: "เพิ่ม ลบ แก้ไขสิทธิ์ และบทบาทของผู้ใช้งานในระบบ",
    category: "การดูแลระบบ"
  },
  {
    key: "canAccessDevPortal",
    label: "เข้าถึงพิมพ์เขียวระบบ (Dev Portal)",
    desc: "เข้าดูสถาปัตยกรรม ฐานข้อมูล และพิมพ์เขียวระบบ (/dev)",
    category: "การดูแลระบบ"
  }
];

export default function PermissionManager() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseLive, setIsFirebaseLive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Password Provisioning States
  const [initialPassword, setInitialPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Form State
  const [formData, setFormData] = useState<UserAccount>({
    uid: "",
    name: "",
    email: "",
    role: "staff",
    roleNameTh: ROLE_PRESETS.staff.roleNameTh,
    department: "ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ",
    position: "",
    status: "active",
    permissions: { ...ROLE_PRESETS.staff.defaultPermissions }
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper: Generate clean temporary password
  const generateRandomPassword = () => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const pass = `swu@${randomDigits}`;
    setInitialPassword(pass);
    setPasswordCopied(false);
  };

  // Helper: Copy password to clipboard
  const handleCopyPassword = () => {
    if (!initialPassword) return;
    navigator.clipboard.writeText(initialPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
    showToast(`คัดลอกรหัสผ่าน "${initialPassword}" เรียบร้อยแล้ว!`);
  };

  // Helper: Send password reset email from Edit Modal
  const handleSendResetLink = async (targetEmail: string) => {
    if (!targetEmail) return;
    setIsSendingReset(true);
    try {
      await sendUserPasswordReset(targetEmail);
      showToast(`ส่งลิงก์ตั้งรหัสผ่านไปยัง ${targetEmail} เรียบร้อยแล้ว!`);
    } catch (err: any) {
      showToast(`ไม่สามารถส่งอีเมลได้: ${err.message}`, "error");
    } finally {
      setIsSendingReset(false);
    }
  };

  // Subscribe to Cloud Firestore collection: users_permissions
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToUsers(
      (firestoreUsers) => {
        setUsers(firestoreUsers);
        setIsFirebaseLive(true);
        setIsLoading(false);
      },
      (err) => {
        console.warn("Firestore permissions listener error:", err);
        setIsFirebaseLive(false);
        setIsLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Filter Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.position && u.position.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = selectedRoleFilter === "ALL" || u.role === selectedRoleFilter;
    const matchesStatus = selectedStatusFilter === "ALL" || u.status === selectedStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingId(null);
    const defaultRole: UserRole = "staff";
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    setInitialPassword(`swu@${randomDigits}`);
    setPasswordCopied(false);
    setShowPassword(false);
    setFormData({
      uid: `usr_${Date.now()}`,
      name: "",
      email: "",
      role: defaultRole,
      roleNameTh: ROLE_PRESETS[defaultRole].roleNameTh,
      department: "ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ",
      position: "",
      status: "active",
      permissions: { ...ROLE_PRESETS[defaultRole].defaultPermissions }
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user: UserAccount) => {
    setEditingId(user.id || user.uid);
    setInitialPassword("");
    setPasswordCopied(false);
    setShowPassword(false);
    setFormData({
      ...user,
      permissions: { ...user.permissions }
    });
    setIsModalOpen(true);
  };

  // Handle Role Preset Change in Form
  const handleRoleChange = (newRole: UserRole) => {
    const preset = ROLE_PRESETS[newRole];
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      roleNameTh: preset.roleNameTh,
      permissions: { ...preset.defaultPermissions }
    }));
  };

  // Toggle Single Permission in Form
  const handleTogglePermission = (permKey: keyof UserPermissions) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permKey]: !prev.permissions[permKey]
      }
    }));
  };

  // Submit User Permission to Firestore and Firebase Auth
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submit

    if (!formData.name.trim() || !formData.email.trim()) {
      showToast("กรุณากรอกชื่อ-นามสกุล และอีเมล", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await saveUserPermissionToFirestore(formData);
        showToast(`อัปเดตสิทธิ์ของ "${formData.name}" บน Cloud Firestore สำเร็จ!`);
      } else {
        const result = await createUserWithInitialPassword(formData, initialPassword);
        if (result.createdInAuth) {
          showToast(`สร้างผู้ใช้ "${formData.name}" พร้อมรหัสผ่าน "${initialPassword}" สำเร็จ!`);
        } else {
          showToast(`บันทึกสิทธิ์ผู้ใช้ "${formData.name}" บน Cloud Firestore สำเร็จ!`);
        }
      }

      // Reset form state
      setFormData({
        uid: "",
        name: "",
        email: "",
        role: "staff",
        roleNameTh: ROLE_PRESETS.staff.roleNameTh,
        department: "ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ",
        position: "",
        status: "active",
        permissions: { ...ROLE_PRESETS.staff.defaultPermissions }
      });
      setInitialPassword("");
      setEditingId(null);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Save permission error:", err);
      showToast(`บันทึกไม่สำเร็จ: ${err.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle User Active/Inactive
  const handleToggleStatus = async (user: UserAccount) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    try {
      await updateUserPermissionInFirestore(user.id || user.uid, { status: newStatus });
      showToast(`เปลี่ยนสถานะของ "${user.name}" เป็น ${newStatus === "active" ? "เปิดใช้งาน (Active)" : "ปิดการใช้งาน (Inactive)"}`);
    } catch (err: any) {
      showToast(`ไม่สามารถเปลี่ยนสถานะได้: ${err.message}`, "error");
    }
  };

  // Delete User Permission Record
  const handleDeleteUser = async (user: UserAccount) => {
    if (!confirm(`คุณต้องการลบสิทธิ์การเข้าใช้งานของ "${user.name}" (${user.email}) ใช่หรือไม่?`)) return;

    try {
      await deleteUserPermissionFromFirestore(user.id || user.uid);
      showToast(`ลบข้อมูลสิทธิ์ของ "${user.name}" สำเร็จ`);
    } catch (err: any) {
      showToast(`ไม่สามารถลบข้อมูลได้: ${err.message}`, "error");
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

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span className="p-2.5 rounded-xl bg-red-50 text-[#DA2128]">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  ระบบกำหนดสิทธิ์การเข้าใช้งาน (User & RBAC Permissions)
                </h1>
                <p className="text-xs text-slate-500">
                  การจัดการบทบาทและสิทธิ์การเข้าถึงโมดูลต่าง ๆ ในระบบ ส่วนพัฒนากายภาพ มศว
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 text-xs font-bold text-white bg-[#DA2128] hover:bg-[#B81B22] rounded-xl transition-all shadow-md shadow-red-500/20 flex items-center space-x-1.5 active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มผู้ใช้และกำหนดสิทธิ์</span>
            </button>
          </div>
        </div>

        {/* Role Matrix Guide (6 Roles Overview) */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-700 mb-2.5 flex items-center space-x-1.5">
            <Key className="w-3.5 h-3.5 text-[#DA2128]" />
            <span>มาตรฐานระดับสิทธิ์และบทบาทในระบบ (Role Presets):</span>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {(Object.keys(ROLE_PRESETS) as UserRole[]).map((rKey) => {
              const r = ROLE_PRESETS[rKey];
              return (
                <div
                  key={rKey}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-red-200 transition-all space-y-1"
                >
                  <span className="text-[11px] font-bold text-slate-900 block truncate">
                    {r.roleNameTh.split(" (")[0]}
                  </span>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                    {r.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อผู้ใช้, อีเมล @g.swu.ac.th, หน่วยงาน, ตำแหน่ง..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DA2128]/20 focus:border-[#DA2128] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#DA2128]"
            >
              <option value="ALL">บทบาททั้งหมด ({users.length})</option>
              {(Object.keys(ROLE_PRESETS) as UserRole[]).map((rKey) => (
                <option key={rKey} value={rKey}>
                  {ROLE_PRESETS[rKey].roleNameTh}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#DA2128]"
            >
              <option value="ALL">สถานะทั้งหมด</option>
              <option value="active">เปิดใช้งาน (Active)</option>
              <option value="inactive">ปิดใช้งาน (Inactive)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table / List */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#DA2128] animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">กำลังเชื่อมต่อฐานข้อมูลสิทธิ์ผู้ใช้งาน Cloud Firestore...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 sm:p-16 text-center space-y-5 shadow-xs">
          <div className="w-20 h-20 bg-red-50 text-[#DA2128] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Users className="w-10 h-10" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              ยังไม่มีข้อมูลการกำหนดสิทธิ์ผู้ใช้งานในฐานข้อมูล
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              เริ่มสร้างบัญชีผู้ใช้งานและกำหนดสิทธิ์เข้าใช้งานระบบ (RBAC) เข้าสู่ Cloud Firestore ได้ทันที
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-6 py-3 bg-[#DA2128] hover:bg-[#B81B22] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-red-500/20 inline-flex items-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>➕ เพิ่มผู้ใช้งานและกำหนดสิทธิ์คนแรก</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <th className="py-3.5 px-4">ผู้ใช้งาน / อีเมล</th>
                  <th className="py-3.5 px-4">สังกัด / หน่วยงาน</th>
                  <th className="py-3.5 px-4">บทบาท (Role)</th>
                  <th className="py-3.5 px-4">สิทธิ์การทำงานที่ได้รับ</th>
                  <th className="py-3.5 px-4 text-center">สถานะ</th>
                  <th className="py-3.5 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const rolePreset = ROLE_PRESETS[u.role] || ROLE_PRESETS.staff;
                  const activePermCount = Object.values(u.permissions || {}).filter(Boolean).length;

                  return (
                    <tr key={u.id || u.uid} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-red-50 text-[#DA2128] font-bold flex items-center justify-center text-xs flex-shrink-0 border border-red-200">
                            {u.name.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{u.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <p className="line-clamp-1 font-medium">{u.department}</p>
                        {u.position && <p className="text-[10px] text-slate-400">{u.position}</p>}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.role === "super_admin"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : u.role === "approver"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : u.role === "inventory_officer"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : u.role === "technician"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {u.roleNameTh || rolePreset.roleNameTh}
                        </span>
                      </td>

                      {/* Permissions Pills */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.permissions?.canViewAssets && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              ครุภัณฑ์
                            </span>
                          )}
                          {u.permissions?.canRequestConsumables && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              ขอเบิก
                            </span>
                          )}
                          {u.permissions?.canAddConsumables && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold">
                              คุมสต็อก
                            </span>
                          )}
                          {u.permissions?.canApproveRequisitions && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold">
                              อนุมัติ
                            </span>
                          )}
                          {u.permissions?.canManageUsers && (
                            <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-bold">
                              จัดการสิทธิ์
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 self-center">
                            ({activePermCount}/9 สิทธิ์)
                          </span>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            u.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                          }`}
                          title="คลิกเพื่อสลับสถานะ"
                        >
                          {u.status === "active" ? "🟢 เปิดใช้งาน" : "⚪ ปิดใช้งาน"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#DA2128] hover:bg-slate-100 transition-colors"
                            title="แก้ไขสิทธิ์"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                            title="ลบผู้ใช้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT USER PERMISSIONS FORM */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-[#DA2128]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    {editingId ? "แก้ไขสิทธิ์ผู้ใช้งาน" : "เพิ่มผู้ใช้งานและกำหนดสิทธิ์"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    บันทึกลง Cloud Firestore (Collection: <code className="text-[#DA2128] font-mono">users_permissions</code>)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ชื่อ - นามสกุล *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="เช่น นายสมศักดิ์ สายตรวจ"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#DA2128]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    อีเมลองค์กร (@g.swu.ac.th หรืออีเมลผู้ใช้) *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                        uid: editingId ? formData.uid : e.target.value.replace(/[@.]/g, "_")
                      })
                    }
                    placeholder="somsak@g.swu.ac.th"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#DA2128] font-mono"
                  />
                </div>
              </div>

              {/* Password Section */}
              {!editingId ? (
                <div className="p-4 bg-gradient-to-br from-red-50/70 via-slate-50 to-red-50/30 rounded-2xl border border-red-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <Key className="w-4 h-4 text-[#DA2128]" />
                      <span>รหัสผ่านเริ่มต้นสำหรับเข้าสู่ระบบ (Initial Password) *</span>
                    </label>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="text-[11px] font-bold text-[#DA2128] hover:bg-red-100/60 px-2 py-1 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                        title="สุ่มรหัสผ่านใหม่"
                      >
                        <Dices className="w-3.5 h-3.5" />
                        <span>สุ่มรหัส</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer ${
                          passwordCopied ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                        title="คัดลอกรหัสผ่าน"
                      >
                        {passwordCopied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{passwordCopied ? "คัดลอกแล้ว!" : "คัดลอก"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={initialPassword}
                      onChange={(e) => setInitialPassword(e.target.value)}
                      placeholder="กำหนดรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-red-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#DA2128] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 flex items-center space-x-1">
                    <span>💡 Admin สามารถคัดลอกรหัสผ่านนี้ส่งให้บุคลากรนำไปใช้ล็อกอินเข้าสู่ระบบได้ทันที</span>
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800 flex items-center space-x-1.5">
                      <Key className="w-4 h-4 text-[#DA2128]" />
                      <span>การจัดการรหัสผ่านผู้ใช้งาน</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      หากผู้ใช้งานลืมรหัสผ่าน สามารถส่งลิงก์ตั้งรหัสผ่านใหม่ไปยังอีเมลได้
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isSendingReset}
                    onClick={() => handleSendResetLink(formData.email)}
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-[#DA2128] text-xs font-bold transition-all shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isSendingReset ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>กำลังส่งอีเมล...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        <span>ส่งลิงก์รีเซ็ตรหัสผ่าน</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Row 2: Department & Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    สังกัด / หน่วยงาน
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="เช่น ฝ่ายงานพัฒนาและบำรุงรักษา ส่วนพัฒนากายภาพ"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#DA2128]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ตำแหน่งงาน
                  </label>
                  <input
                    type="text"
                    value={formData.position || ""}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="เช่น ช่างไฟฟ้าชำนาญการ, เจ้าหน้าที่บริหารงานทั่วไป"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#DA2128]"
                  />
                </div>
              </div>

              {/* Row 3: Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  เลือกบทบาทหลัก (Role Preset) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(ROLE_PRESETS) as UserRole[]).map((rKey) => {
                    const r = ROLE_PRESETS[rKey];
                    const isSelected = formData.role === rKey;
                    return (
                      <button
                        key={rKey}
                        type="button"
                        onClick={() => handleRoleChange(rKey)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-red-50 border-[#DA2128] text-slate-900 shadow-2xs font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <p className={`text-xs ${isSelected ? "text-[#DA2128]" : ""}`}>{r.roleNameTh.split(" (")[0]}</p>
                        <p className="text-[10px] text-slate-400 truncate">{r.roleNameTh.split("(")[1]?.replace(")", "")}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: Detailed Permissions Checkboxes */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#DA2128]" />
                    <span>ปรับแต่งสิทธิ์รายโมดูล (Granular Permissions)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">คลิกเปิด/ปิด สิทธิ์เฉพาะบุคคลได้ตามต้องการ</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PERMISSION_DEFINITIONS.map((perm) => {
                    const isChecked = formData.permissions[perm.key];
                    return (
                      <div
                        key={perm.key}
                        onClick={() => handleTogglePermission(perm.key)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-2.5 ${
                          isChecked
                            ? "bg-white border-red-200 shadow-2xs"
                            : "bg-white/60 border-slate-200 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(perm.key)}
                          className="mt-0.5 accent-[#DA2128] cursor-pointer"
                        />
                        <div className="overflow-hidden">
                          <p className={`text-xs font-bold ${isChecked ? "text-slate-900" : "text-slate-500"}`}>
                            {perm.label}
                          </p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{perm.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: Status */}
              <div className="flex items-center space-x-3">
                <label className="text-xs font-bold text-slate-700">สถานะการใช้งาน:</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: "active" })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      formData.status === "active"
                        ? "bg-emerald-600 text-white border-emerald-600 font-bold"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    🟢 เปิดใช้งาน (Active)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: "inactive" })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      formData.status === "inactive"
                        ? "bg-slate-700 text-white border-slate-700 font-bold"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    ⚪ ปิดใช้งาน (Inactive)
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                      <span>{editingId ? "บันทึกการแก้ไขสิทธิ์" : "บันทึกลงฐานข้อมูล Firestore"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
